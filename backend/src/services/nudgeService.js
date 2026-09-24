const prisma = require('../config/db');

/**
 * Generate context-aware wellbeing nudges for engineering students
 */
async function generateNudges(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      checkIns: { orderBy: { date: 'desc' }, take: 3 },
      tasks: { where: { completed: false } },
      focusSessions: { orderBy: { startedAt: 'desc' }, take: 5 },
      burnoutScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      nudges: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!user) return [];

  const existingNudges = user.nudges;
  const recentCheckIn = user.checkIns[0];
  const targetSleep = user.profile?.targetSleepHours || 7.5;
  const burnout = user.burnoutScores[0];
  const tasksDueSoon = user.tasks.filter((t) => {
    if (!t.deadline) return false;
    const diffHours = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 48;
  });

  // Count coding/DSA hours today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const codingFocusMinutes = user.focusSessions
    .filter(
      (s) =>
        new Date(s.startedAt) >= todayStart &&
        (s.category === 'DSA' || s.category === 'CODING_PRACTICE' || s.category === 'PROJECT')
    )
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  const newNudges = [];

  // Helper to check if nudge type already exists
  const hasType = (type) => existingNudges.some((n) => n.type === type);

  // 1. CODING OVERLOAD NUDGE
  if (codingFocusMinutes >= 150 && !hasType('CODING_BREAK')) {
    newNudges.push({
      userId,
      type: 'CODING_BREAK',
      title: 'Coding Recovery',
      message: `You've spent ${(codingFocusMinutes / 60).toFixed(1)} hours coding today. Consider taking a short recovery break to rest your eyes and reset.`,
      actionLabel: 'Take a Break',
      actionLink: '/focus',
    });
  }

  // 2. DEADLINE CONGESTION NUDGE
  if (tasksDueSoon.length >= 3 && !hasType('DEADLINE_PRESSURE')) {
    newNudges.push({
      userId,
      type: 'DEADLINE_PRESSURE',
      title: 'Academic Priorities',
      message: `You have ${tasksDueSoon.length} high-priority tasks due soon. Consider completing the most urgent task first rather than multitasking.`,
      actionLabel: 'View To-Do List',
      actionLink: '/tasks',
    });
  }

  // 3. SLEEP RECOVERY NUDGE
  if (recentCheckIn && recentCheckIn.sleepHours < targetSleep - 1.2 && !hasType('LOW_SLEEP')) {
    newNudges.push({
      userId,
      type: 'LOW_SLEEP',
      title: 'Sleep Target Alert',
      message: `Your sleep (${recentCheckIn.sleepHours}h) was below your target (${targetSleep}h). Protecting recovery time helps cognitive performance in DSA and exams.`,
      actionLabel: 'Recovery Tips',
      actionLink: '/ai',
    });
  }

  // 4. HIGH STRESS NUDGE
  if (recentCheckIn && recentCheckIn.stressLevel >= 7 && !hasType('HIGH_STRESS')) {
    newNudges.push({
      userId,
      type: 'HIGH_STRESS',
      title: 'Stress Relief',
      message: `Your recent stress level is elevated (${recentCheckIn.stressLevel}/10). Try a 2-minute breathing exercise or a quick reset game.`,
      actionLabel: 'Breathing Game',
      actionLink: '/games',
    });
  }

  // 5. RECOVERY MODE NUDGE
  if (burnout && burnout.score >= 70 && !hasType('RECOVERY_MODE')) {
    newNudges.push({
      userId,
      type: 'RECOVERY_MODE',
      title: 'Recovery Mode Recommended',
      message: 'Your burnout risk indicator is high. Shift non-urgent tasks, focus only on essentials, and activate recovery pacing.',
      actionLabel: 'Enter Recovery Mode',
      actionLink: '/dashboard?recovery=true',
    });
  }

  // Insert generated nudges
  for (const n of newNudges) {
    await prisma.nudge.create({ data: n });
  }

  // Return all active nudges
  return await prisma.nudge.findMany({
    where: { userId, dismissed: false },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { generateNudges };
