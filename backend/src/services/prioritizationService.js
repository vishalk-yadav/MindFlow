/**
 * Smart Task Prioritization Service for Engineering Students
 */
function prioritizeTasks(tasks, currentBurnoutScore = 50) {
  if (!tasks || tasks.length === 0) return { prioritizedTasks: [], recommendedTask: null };

  const now = new Date();

  const scoredTasks = tasks.map((task) => {
    let score = 0;
    const reasons = [];

    // 1. Base Priority
    if (task.priority === 'HIGH') {
      score += 35;
      reasons.push('High priority');
    } else if (task.priority === 'MEDIUM') {
      score += 20;
    } else {
      score += 10;
    }

    // 2. Deadline Urgency
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0) {
        score += 55;
        reasons.push('Overdue task');
      } else if (diffHours <= 24) {
        score += 45;
        reasons.push('Due today');
      } else if (diffHours <= 48) {
        score += 30;
        reasons.push('Due tomorrow');
      } else if (diffHours <= 120) {
        score += 15;
        reasons.push('Due this week');
      }
    } else if (task.deadlineLabel) {
      const label = task.deadlineLabel.toLowerCase();
      if (label.includes('today')) {
        score += 45;
        reasons.push('Due today');
      } else if (label.includes('tomorrow')) {
        score += 30;
        reasons.push('Due tomorrow');
      }
    }

    // 3. Category Weighting
    const cat = task.category;
    if (cat === 'EXAM_PREP' || cat === 'ASSIGNMENT') {
      score += 15;
      reasons.push('Academic requirement');
    } else if (cat === 'LAB') {
      score += 12;
    } else if (cat === 'DSA' || cat === 'CODING_PRACTICE') {
      score += 10;
    }

    // 4. Burnout Adaptation: Quick-Win Bonus
    const estMin = task.estimatedMinutes || 60;
    if (currentBurnoutScore >= 65) {
      if (estMin <= 45) {
        score += 20;
        reasons.push(`Quick-win (${estMin} min) to relieve cognitive load`);
      } else if (estMin > 90) {
        score -= 10; // De-prioritize heavy daunting tasks during high burnout
      }
    } else {
      reasons.push(`Estimated ${estMin}m`);
    }

    return {
      ...task,
      priorityScore: score,
      recommendationReason: reasons.join(' + '),
    };
  });

  // Sort descending by calculated score
  scoredTasks.sort((a, b) => b.priorityScore - a.priorityScore);

  const recommendedTask = scoredTasks.length > 0 ? scoredTasks[0] : null;

  return {
    prioritizedTasks: scoredTasks,
    recommendedTask: recommendedTask
      ? {
          task: recommendedTask,
          title: recommendedTask.title,
          reason: recommendedTask.recommendationReason,
        }
      : null,
  };
}

module.exports = { prioritizeTasks };
