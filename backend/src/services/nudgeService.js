const prisma = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate context-aware AI wellbeing and workload nudges for engineering students
 */
async function generateNudges(userId, { forceAi = false } = {}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      academicProfile: true,
      checkIns: { orderBy: { date: 'desc' }, take: 3 },
      tasks: { where: { completed: false } },
      focusSessions: { orderBy: { startedAt: 'desc' }, take: 10 },
      burnoutScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      examPreps: true,
      nudges: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) return [];

  const existingNudges = user.nudges || [];

  // If user already has active nudges and force generation was not requested, return existing
  if (existingNudges.length >= 2 && !forceAi) {
    return existingNudges;
  }

  const targetSleep = user.profile?.targetSleepHours || 7.5;
  const recentCheckIn = user.checkIns[0] || { sleepHours: 6.5, stressLevel: 5, mood: 'Good', studyHours: 4 };
  const burnout = user.burnoutScores[0] || {
    score: 45,
    riskLevel: 'MODERATE',
    workloadFactor: 50,
    sleepFactor: 50,
    stressFactor: 50,
    breaksFactor: 50,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const codingMinutesToday = (user.focusSessions || [])
    .filter(
      (s) =>
        new Date(s.startedAt) >= todayStart &&
        (s.category === 'DSA' || s.category === 'CODING_PRACTICE' || s.category === 'PROJECT')
    )
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const totalFocusMinutesToday = (user.focusSessions || [])
    .filter((s) => new Date(s.startedAt) >= todayStart)
    .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const tasksDueSoon = (user.tasks || []).filter((t) => {
    if (!t.deadline) return false;
    const diffHours = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  });

  const highPriorityTasks = (user.tasks || []).filter((t) => t.priority === 'HIGH' || t.priority === 'URGENT');

  let generatedNudges = [];

  // 1. Try Gemini AI generation
  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (apiKey) {
    generatedNudges = await generateNudgesWithAI({
      user,
      recentCheckIn,
      targetSleep,
      burnout,
      codingMinutesToday,
      totalFocusMinutesToday,
      tasksDueSoon,
      highPriorityTasks,
      apiKey,
    });
  }

  // 2. Fallback to smart engineering heuristics if AI returns empty or fails
  if (!generatedNudges || generatedNudges.length === 0) {
    generatedNudges = generateHeuristicNudges({
      userId,
      user,
      recentCheckIn,
      targetSleep,
      burnout,
      codingMinutesToday,
      tasksDueSoon,
      highPriorityTasks,
      existingNudges,
    });
  }

  // If force generation was requested, dismiss older active nudges to keep recommendations fresh
  if (forceAi && generatedNudges.length > 0) {
    await prisma.nudge.updateMany({
      where: { userId, dismissed: false },
      data: { dismissed: true },
    });
  }

  // 3. Persist generated nudges to database
  for (const n of generatedNudges) {
    const duplicate = await prisma.nudge.findFirst({
      where: {
        userId,
        title: n.title,
        dismissed: false,
      },
    });

    if (!duplicate) {
      await prisma.nudge.create({
        data: {
          userId,
          type: n.type || 'AI_RECOMMENDATION',
          title: n.title,
          message: n.message,
          actionLabel: n.actionLabel || 'Take Action',
          actionLink: n.actionLink || '/focus',
        },
      });
    }
  }

  // Return all active nudges for this user
  return await prisma.nudge.findMany({
    where: { userId, dismissed: false },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

/**
 * Generate personalized nudges using Google Gemini API
 */
async function generateNudgesWithAI({
  user,
  recentCheckIn,
  targetSleep,
  burnout,
  codingMinutesToday,
  totalFocusMinutesToday,
  tasksDueSoon,
  highPriorityTasks,
  apiKey,
}) {
  const candidateModels = [
    process.env.AI_MODEL || 'gemini-3.6-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
  ];
  const uniqueModels = [...new Set(candidateModels)];
  const genAI = new GoogleGenerativeAI(apiKey);

  const systemInstruction = `You are MindFlow's AI Wellbeing & Workload Nudge Recommender for engineering students.
Your job is to examine the student's real-time telemetry (burnout risk, sleep deficit, coding time, upcoming deadlines) and recommend 1 to 3 targeted, high-impact, actionable nudges.

OUTPUT REQUIREMENTS:
- Output MUST be a valid JSON array of objects only.
- Do NOT output any conversational text, markdown preamble, or extra explanations outside the JSON.
- Format:
[
  {
    "type": "CODING_BREAK" | "SLEEP_DEFICIT" | "DEADLINE_PRESSURE" | "HIGH_STRESS" | "RECOVERY_MODE" | "HEALTHY_MOMENTUM" | "EXAM_PACING",
    "title": "Short punchy title (max 5 words, include a relevant emoji)",
    "message": "1-2 sentences of personalized, empathetic advice directly referencing their metrics.",
    "actionLabel": "Action text (e.g. 'Take 5m Break', 'Review Tasks', 'Log Sleep', 'Play Reset Game', 'Ask AI')",
    "actionLink": "/focus" | "/tasks" | "/games" | "/ai"
  }
]`;

  const prompt = `Student telemetry:
- Student Name: ${user.name || 'Student'}
- Engineering Branch: ${user.academicProfile?.branch || 'Computer Science & Engineering'}
- Burnout Score: ${burnout.score}/100 (${burnout.riskLevel})
- Today's Sleep: ${recentCheckIn.sleepHours} hrs (Target: ${targetSleep} hrs)
- Stress Level: ${recentCheckIn.stressLevel}/10, Mood: ${recentCheckIn.mood}
- Coding/DSA Minutes Today: ${codingMinutesToday} mins
- Total Focus Today: ${totalFocusMinutesToday} mins
- Urgent Tasks Due Soon (<48h): ${tasksDueSoon.length} (${tasksDueSoon.map((t) => t.title).join(', ') || 'None'})
- High Priority Tasks: ${highPriorityTasks.length}

Generate 1 to 3 personalized AI nudges based on this telemetry now.`;

  for (const modelName of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.() || '';

      // Clean markdown code blocks if any
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate items
        const validNudges = parsed
          .filter((item) => item && item.title && item.message)
          .map((item) => ({
            type: item.type || 'AI_RECOMMENDATION',
            title: item.title,
            message: item.message,
            actionLabel: item.actionLabel || 'Take Action',
            actionLink: sanitizeActionLink(item.actionLink),
          }));

        if (validNudges.length > 0) {
          return validNudges;
        }
      }
    } catch (err) {
      console.warn(`[AI Nudge] Model ${modelName} fallback triggered: ${err.message}`);
    }
  }

  return [];
}

/**
 * Intelligent deterministic fallback generator grounded in engineering student psychology
 */
function generateHeuristicNudges({
  userId,
  user,
  recentCheckIn,
  targetSleep,
  burnout,
  codingMinutesToday,
  tasksDueSoon,
  highPriorityTasks,
  existingNudges,
}) {
  const hasType = (t) => (existingNudges || []).some((n) => n.type === t);
  const nudges = [];

  // 1. Critical Burnout / Recovery Mode
  if (burnout.score >= 70 && !hasType('RECOVERY_MODE')) {
    nudges.push({
      userId,
      type: 'RECOVERY_MODE',
      title: '🛡️ AI Recovery Mode Recommended',
      message: `Your burnout risk indicator is high (${burnout.score}/100). Consider deferring non-critical assignments and prioritizing mental recovery.`,
      actionLabel: 'Enter Recovery Mode',
      actionLink: '/dashboard?recovery=true',
    });
  }

  // 2. High Coding / DSA Fatigue
  if (codingMinutesToday >= 90 && !hasType('CODING_BREAK')) {
    nudges.push({
      userId,
      type: 'CODING_BREAK',
      title: '💻 Coding Cognitive Reset',
      message: `You've spent ${(codingMinutesToday / 60).toFixed(1)}h coding today. Continuous debugging reduces algorithmic accuracy—take a 5-minute break to rest your eyes.`,
      actionLabel: 'Take 5m Break',
      actionLink: '/focus',
    });
  }

  // 3. Sleep Deficit Warning
  if (recentCheckIn.sleepHours < targetSleep - 1.0 && !hasType('SLEEP_DEFICIT')) {
    nudges.push({
      userId,
      type: 'SLEEP_DEFICIT',
      title: '🌙 Sleep Target Deficit',
      message: `You recorded ${recentCheckIn.sleepHours}h of sleep (target: ${targetSleep}h). Adequate sleep is vital for memory consolidation and problem-solving stamina.`,
      actionLabel: 'Open Sleep Timer',
      actionLink: '/focus',
    });
  }

  // 4. Imminent Deadline Congestion
  if (tasksDueSoon.length >= 2 && !hasType('DEADLINE_PRESSURE')) {
    nudges.push({
      userId,
      type: 'DEADLINE_PRESSURE',
      title: '⚡ Urgent Deadline Pacing',
      message: `You have ${tasksDueSoon.length} deliverables due within 48 hours. Focus on the most critical item first to prevent multitasking cognitive strain.`,
      actionLabel: 'Review Tasks',
      actionLink: '/tasks',
    });
  }

  // 5. High Stress / Emotional Strain
  if (recentCheckIn.stressLevel >= 7 && !hasType('HIGH_STRESS')) {
    nudges.push({
      userId,
      type: 'HIGH_STRESS',
      title: '🧘 Stress Calibrator Nudge',
      message: `Your stress rating is elevated (${recentCheckIn.stressLevel}/10). A 2-minute mindful breathing exercise or a quick reset game will help ground your nervous system.`,
      actionLabel: 'Play Reset Game',
      actionLink: '/games',
    });
  }

  // 6. Healthy Flow Encouragement (if metrics are well-balanced)
  if (nudges.length === 0 && !hasType('HEALTHY_MOMENTUM')) {
    nudges.push({
      userId,
      type: 'HEALTHY_MOMENTUM',
      title: '✨ Healthy Flow Momentum',
      message: 'Your study rhythm, sleep hours, and workload are in great balance today. Keep up this sustainable pace!',
      actionLabel: 'Ask AI Assistant',
      actionLink: '/ai',
    });
  }

  return nudges;
}

/**
 * Ensure action links only point to valid internal application routes
 */
function sanitizeActionLink(link) {
  const validPrefixes = ['/focus', '/tasks', '/games', '/ai', '/planner', '/analytics', '/checkin', '/dashboard'];
  if (!link || typeof link !== 'string') return '/focus';
  const match = validPrefixes.find((p) => link.startsWith(p));
  return match ? link : '/focus';
}

module.exports = {
  generateNudges,
};
