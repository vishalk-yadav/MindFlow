const prisma = require('../config/db');

/**
 * Engineering Student Burnout Risk Engine
 * Computes burnout risk score (0-100), risk level, factor contributions, and dynamic explanation.
 */
async function calculateBurnoutRisk(userId) {
  // 1. Fetch user profile, academic profile, recent check-ins, tasks, and focus sessions
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      academicProfile: true,
      checkIns: {
        orderBy: { date: 'desc' },
        take: 7,
      },
      tasks: {
        where: { completed: false },
      },
      focusSessions: {
        orderBy: { startedAt: 'desc' },
        take: 14,
      },
      examPreps: true,
    },
  });

  if (!user) throw new Error('User not found');

  const profile = user.profile || { targetSleepHours: 7.5, dailyStudyHours: 6.0 };
  const targetSleep = profile.targetSleepHours || 7.5;
  const recentCheckIns = user.checkIns;
  const pendingTasks = user.tasks;
  const upcomingExams = user.examPreps.filter(
    (e) => new Date(e.examDate) > new Date() && (new Date(e.examDate) - new Date()) / (1000 * 60 * 60 * 24) <= 7
  );

  // Latest check-in (or sensible engineering student defaults)
  const latestCheckIn = recentCheckIns[0] || {
    sleepHours: 6.2,
    stressLevel: 5,
    energyLevel: 6,
    studyHours: 6.5,
    breaksCount: 2,
    mood: 'OKAY',
  };

  // Average sleep over past 7 check-ins
  const avgSleep = recentCheckIns.length > 0
    ? recentCheckIns.reduce((acc, c) => acc + c.sleepHours, 0) / recentCheckIns.length
    : latestCheckIn.sleepHours;

  // Average stress (1-10)
  const avgStress = recentCheckIns.length > 0
    ? recentCheckIns.reduce((acc, c) => acc + c.stressLevel, 0) / recentCheckIns.length
    : latestCheckIn.stressLevel;

  // 1. WORKLOAD SCORE (0 - 100)
  // Factors: study hours, high priority pending tasks, upcoming exams
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'HIGH').length;
  const dueSoonTasks = pendingTasks.filter((t) => {
    if (!t.deadline) return false;
    const diffDays = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  }).length;

  let rawWorkload = 0;
  rawWorkload += (latestCheckIn.studyHours / profile.dailyStudyHours) * 35;
  rawWorkload += Math.min(highPriorityTasks * 10, 30);
  rawWorkload += Math.min(dueSoonTasks * 8, 20);
  rawWorkload += Math.min(upcomingExams.length * 15, 25);
  const workloadScore = Math.min(Math.max(rawWorkload, 15), 100);

  // 2. SLEEP DEFICIT SCORE (0 - 100)
  // Target vs Actual sleep
  const sleepDeficit = Math.max(0, targetSleep - avgSleep);
  // Deficit of 0h = 10, 1h deficit = 40, 2h deficit = 75, 3h+ = 95
  const sleepScore = Math.min(Math.max(10 + sleepDeficit * 30, 5), 100);

  // 3. STRESS & MOOD SCORE (0 - 100)
  let moodPenalty = 0;
  if (latestCheckIn.mood === 'EXHAUSTED') moodPenalty = 25;
  else if (latestCheckIn.mood === 'STRESSED') moodPenalty = 15;
  else if (latestCheckIn.mood === 'OKAY') moodPenalty = 5;
  else if (latestCheckIn.mood === 'GREAT') moodPenalty = -10;

  const stressScore = Math.min(Math.max(avgStress * 9 + moodPenalty, 10), 100);

  // 4. BREAK DEFICIT SCORE (0 - 100)
  // Low breaks when working high hours = high burnout risk
  const breaksTaken = latestCheckIn.breaksCount || 2;
  const breakScore = Math.min(Math.max(100 - breaksTaken * 25, 10), 95);

  // WEIGHTED AGGREGATE BURNOUT RISK (0 - 100)
  const totalScore = Math.round(
    workloadScore * 0.35 +
    sleepScore * 0.25 +
    stressScore * 0.25 +
    breakScore * 0.15
  );

  const finalScore = Math.min(Math.max(totalScore, 12), 98);

  // Risk Classification
  let riskLevel = 'LOW';
  if (finalScore >= 70) riskLevel = 'HIGH';
  else if (finalScore >= 40) riskLevel = 'MODERATE';

  // Relative Factor Contribution Percentages (summing to 100%)
  const wWeight = workloadScore * 0.35;
  const sWeight = sleepScore * 0.25;
  const stWeight = stressScore * 0.25;
  const bWeight = breakScore * 0.15;
  const sumWeights = wWeight + sWeight + stWeight + bWeight;

  const workloadFactor = Math.round((wWeight / sumWeights) * 100);
  const sleepFactor = Math.round((sWeight / sumWeights) * 100);
  const stressFactor = Math.round((stWeight / sumWeights) * 100);
  const breaksFactor = 100 - (workloadFactor + sleepFactor + stressFactor);

  // Dynamic Explanations & Positive/Negative Factor lists
  const positiveFactors = [];
  const negativeFactors = [];

  if (avgSleep >= targetSleep) {
    positiveFactors.push('Sleep is meeting or exceeding your target');
  } else {
    negativeFactors.push(`Average sleep (${avgSleep.toFixed(1)} hrs) is below your ${targetSleep}h target`);
  }

  if (breaksTaken >= 4) {
    positiveFactors.push('Consistent mindful breaks taken during study sessions');
  } else {
    negativeFactors.push(`Few breaks recorded today (${breaksTaken} taken)`);
  }

  if (dueSoonTasks > 0) {
    negativeFactors.push(`${dueSoonTasks} academic deadline${dueSoonTasks > 1 ? 's' : ''} due within 72 hours`);
  }

  if (upcomingExams.length > 0) {
    negativeFactors.push(`${upcomingExams.length} upcoming exam${upcomingExams.length > 1 ? 's' : ''} within a week`);
  }

  if (latestCheckIn.studyHours > 7) {
    negativeFactors.push(`High continuous study/coding duration (${latestCheckIn.studyHours} hrs)`);
  } else {
    positiveFactors.push('Study hours remain balanced with daily targets');
  }

  // Generate clear, empathetic, non-medical summary explanation
  let explanation = '';
  if (riskLevel === 'HIGH') {
    explanation = "Your workload and deadlines are high while your recovery indicators (sleep and breaks) are depleted. We strongly recommend entering Recovery Mode and rescheduling non-critical tasks.";
  } else if (riskLevel === 'MODERATE') {
    explanation = "Your workload is slightly high and your sleep could be better. Take a short break and focus on your wellbeing.";
  } else {
    explanation = "Your workload, rest cycles, and stress levels are well balanced. Keep maintaining these healthy study habits!";
  }

  // Save the calculated score
  const recorded = await prisma.burnoutScore.create({
    data: {
      userId,
      score: finalScore,
      riskLevel,
      workloadFactor,
      sleepFactor,
      stressFactor,
      breaksFactor,
      explanation,
      positiveFactors,
      negativeFactors,
    },
  });

  return recorded;
}

module.exports = { calculateBurnoutRisk };
