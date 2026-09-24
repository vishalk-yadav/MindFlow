const prisma = require('../config/db');
const { prioritizeTasks } = require('./prioritizationService');

/**
 * Smart Daily Study Planner for Engineering Students
 * Schedules tasks, breaks, and recovery periods dynamically
 */
async function generateDailyPlan(userId, options = {}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      academicProfile: true,
      tasks: { where: { completed: false } },
      burnoutScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
    },
  });

  if (!user) throw new Error('User not found');

  const burnoutScore = user.burnoutScores[0]?.score || 50;
  const isHighBurnout = burnoutScore >= 65 || options.forceRecovery;
  const { prioritizedTasks } = prioritizeTasks(user.tasks, burnoutScore);

  // Determine study day hours
  const startHour = options.startHour || 9; // 09:00 AM
  const maxStudyHours = isHighBurnout ? 4.5 : (user.profile?.dailyStudyHours || 6.0);

  const schedule = [];
  let currentMinutes = startHour * 60;
  let totalWorkMinutes = 0;
  const maxWorkMinutes = maxStudyHours * 60;

  // Format HH:MM
  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Add tasks up to max study capacity
  for (const task of prioritizedTasks) {
    if (totalWorkMinutes >= maxWorkMinutes) break;

    const taskDuration = Math.min(task.estimatedMinutes || 45, isHighBurnout ? 45 : 75);
    const startStr = formatTime(currentMinutes);
    const endMinutes = currentMinutes + taskDuration;
    const endStr = formatTime(endMinutes);

    schedule.push({
      id: `slot-${task.id}`,
      type: 'TASK',
      title: task.title,
      category: task.category,
      priority: task.priority,
      startTime: startStr,
      endTime: endStr,
      durationMinutes: taskDuration,
      taskId: task.id,
      description: task.description || `${task.category.replace('_', ' ')} session`,
    });

    currentMinutes = endMinutes;
    totalWorkMinutes += taskDuration;

    // Insert smart mindful break
    const breakDuration = isHighBurnout ? 15 : 10;
    const breakStart = formatTime(currentMinutes);
    const breakEndMinutes = currentMinutes + breakDuration;
    const breakEnd = formatTime(breakEndMinutes);

    schedule.push({
      id: `break-${schedule.length}`,
      type: 'BREAK',
      title: isHighBurnout ? 'Mindful Recovery Break' : 'Focus Refresh Break',
      category: 'WELLBEING',
      startTime: breakStart,
      endTime: breakEnd,
      durationMinutes: breakDuration,
      recommendation: isHighBurnout
        ? 'Try 2-min box breathing or rest your eyes away from screens.'
        : 'Stand up, hydrate, and stretch.',
    });

    currentMinutes = breakEndMinutes;
  }

  // Save the planner session
  const plan = await prisma.plannerSession.create({
    data: {
      userId,
      scheduleJson: schedule,
      burnoutAdapted: isHighBurnout,
    },
  });

  return {
    id: plan.id,
    schedule,
    burnoutAdapted: isHighBurnout,
    burnoutScore,
    totalPlannedHours: (totalWorkMinutes / 60).toFixed(1),
    summary: isHighBurnout
      ? 'Recovery-adapted schedule: capped study blocks to 45 mins with extended 15-minute recovery intervals to prevent cognitive fatigue.'
      : 'Optimal productivity schedule: balanced engineering tasks with 10-minute focus resets.',
  };
}

module.exports = { generateDailyPlan };
