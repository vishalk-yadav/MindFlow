const prisma = require('../config/db');
const { calculateBurnoutRisk } = require('../services/burnoutService');
const { generateNudges } = require('../services/nudgeService');
const { evaluateStudentAlert } = require('../services/alertService');

const CATEGORY_MAP = {
  CLASSES: 'ACADEMIC',
  CLASS: 'ACADEMIC',
  ACADEMIC: 'ACADEMIC',
  ACADEMICS: 'ACADEMIC',
  ASSIGNMENT: 'ASSIGNMENT',
  ASSIGNMENTS: 'ASSIGNMENT',
  DSA: 'DSA',
  CODING: 'CODING_PRACTICE',
  'CODING PRACTICE': 'CODING_PRACTICE',
  CODING_PRACTICE: 'CODING_PRACTICE',
  PROJECT: 'PROJECT',
  PROJECTS: 'PROJECT',
  LAB: 'LAB',
  LABS: 'LAB',
  'LAB WORK': 'LAB',
  'EXAM PREPARATION': 'EXAM_PREP',
  'EXAM PREP': 'EXAM_PREP',
  EXAM_PREP: 'EXAM_PREP',
  EXAM: 'EXAM_PREP',
  EXAMS: 'EXAM_PREP',
  'PLACEMENT PREPARATION': 'PLACEMENT_PREP',
  'PLACEMENT PREP': 'PLACEMENT_PREP',
  PLACEMENT_PREP: 'PLACEMENT_PREP',
  PLACEMENT: 'PLACEMENT_PREP',
  PLACEMENTS: 'PLACEMENT_PREP',
  INTERNSHIP: 'INTERNSHIP',
  INTERNSHIPS: 'INTERNSHIP',
  HACKATHON: 'HACKATHON',
  HACKATHONS: 'HACKATHON',
  'OPEN SOURCE': 'OPEN_SOURCE',
  OPEN_SOURCE: 'OPEN_SOURCE',
  PERSONAL: 'PERSONAL',
  OTHER: 'OTHER',
};

const VALID_MOODS = ['GREAT', 'GOOD', 'OKAY', 'STRESSED', 'EXHAUSTED'];

const normalizeTaskCategory = (val) => {
  if (!val) return 'ACADEMIC';
  const clean = String(val).trim().toUpperCase();
  if (CATEGORY_MAP[clean]) return CATEGORY_MAP[clean];
  const underscored = clean.replace(/[\s-]+/g, '_');
  if (CATEGORY_MAP[underscored]) return CATEGORY_MAP[underscored];
  return 'OTHER';
};

const normalizeMood = (val) => {
  if (!val) return 'GOOD';
  const clean = String(val).trim().toUpperCase();
  return VALID_MOODS.includes(clean) ? clean : 'GOOD';
};

const createCheckIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      mood,
      stressLevel,
      energyLevel,
      sleepHours,
      studyHours,
      breaksCount,
      mainWorkload,
      notes,
    } = req.body;

    const parsedMood = normalizeMood(mood);
    const parsedStress = Math.min(Math.max(parseInt(stressLevel, 10) || 5, 1), 10);
    const parsedEnergy = Math.min(Math.max(parseInt(energyLevel, 10) || 5, 1), 10);
    const parsedSleep = Math.min(Math.max(parseFloat(sleepHours) || 6.5, 0), 24);
    const parsedStudy = Math.min(Math.max(parseFloat(studyHours) || 0, 0), 24);
    const parsedBreaks = Math.max(parseInt(breaksCount, 10) || 0, 0);
    const category = normalizeTaskCategory(mainWorkload);

    // Save DailyCheckIn
    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        userId,
        mood: parsedMood,
        stressLevel: parsedStress,
        energyLevel: parsedEnergy,
        sleepHours: parsedSleep,
        studyHours: parsedStudy,
        breaksCount: parsedBreaks,
        mainWorkload: category,
        notes: notes ? String(notes).trim() : null,
      },
    });

    // Recalculate burnout risk
    const updatedBurnout = await calculateBurnoutRisk(userId);

    // Evaluate high-risk burnout alert for faculty
    await evaluateStudentAlert(userId, updatedBurnout);

    // Generate fresh nudges
    const updatedNudges = await generateNudges(userId);

    res.status(201).json({
      success: true,
      checkIn,
      burnoutRisk: {
        score: updatedBurnout.score,
        riskLevel: updatedBurnout.riskLevel === 'HIGH' ? 'High Risk' : updatedBurnout.riskLevel === 'MODERATE' ? 'Moderate Risk' : 'Low Risk',
        explanation: updatedBurnout.explanation,
        factors: {
          workload: updatedBurnout.workloadFactor,
          sleep: updatedBurnout.sleepFactor,
          stress: updatedBurnout.stressFactor,
          breaks: updatedBurnout.breaksFactor,
        },
        positiveFactors: updatedBurnout.positiveFactors || [],
        negativeFactors: updatedBurnout.negativeFactors || [],
      },
      nudges: updatedNudges,
      message: 'Daily check-in logged and burnout risk recalculated!',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to record check-in.', details: error.message });
  }
};

const getCheckIns = async (req, res) => {
  try {
    const userId = req.user.id;
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve check-in history.' });
  }
};

module.exports = { createCheckIn, getCheckIns };
