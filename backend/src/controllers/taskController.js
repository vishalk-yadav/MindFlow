const prisma = require('../config/db');
const { calculateBurnoutRisk } = require('../services/burnoutService');
const { prioritizeTasks } = require('../services/prioritizationService');

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter, category, priority, search } = req.query;

    const where = { userId };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (filter === 'completed') {
      where.completed = true;
    } else if (filter === 'today') {
      where.completed = false;
      // tasks labeled due today or with deadline today
    } else if (filter === 'upcoming') {
      where.completed = false;
      where.deadline = { gt: new Date() };
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Grouping for To-Do List screen
    const highPriority = tasks.filter((t) => !t.completed && t.priority === 'HIGH');
    const mediumPriority = tasks.filter((t) => !t.completed && t.priority === 'MEDIUM');
    const lowPriority = tasks.filter((t) => !t.completed && t.priority === 'LOW');
    const completedTasks = tasks.filter((t) => t.completed);

    const totalCount = tasks.length;
    const completedCount = completedTasks.length;

    // Get current burnout score for smart prioritization
    const latestBurnout = await prisma.burnoutScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    const prioritization = prioritizeTasks(
      tasks.filter((t) => !t.completed),
      latestBurnout?.score || 50
    );

    res.json({
      tasks,
      groups: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
        completed: completedTasks,
      },
      stats: {
        total: totalCount,
        completed: completedCount,
        pending: totalCount - completedCount,
        progressPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
      recommendation: prioritization.recommendedTask,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, priority, deadline, deadlineLabel, estimatedMinutes } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description || null,
        category: category || 'ACADEMIC',
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        deadlineLabel: deadlineLabel || (deadline ? 'Due ' + new Date(deadline).toLocaleDateString() : 'Due today'),
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : 60,
      },
    });

    // Recalculate burnout score dynamically
    const updatedBurnout = await calculateBurnoutRisk(userId);

    res.status(201).json({ task, burnoutRisk: updatedBurnout });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, category, priority, deadline, deadlineLabel, estimatedMinutes } = req.body;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(priority && { priority }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(deadlineLabel !== undefined && { deadlineLabel }),
        ...(estimatedMinutes && { estimatedMinutes: parseInt(estimatedMinutes, 10) }),
      },
    });

    const updatedBurnout = await calculateBurnoutRisk(userId);

    res.json({ task: updated, burnoutRisk: updatedBurnout });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

const toggleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const newCompleted = !existing.completed;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
      },
    });

    // Recalculate burnout risk
    const updatedBurnout = await calculateBurnoutRisk(userId);

    res.json({ task: updated, burnoutRisk: updatedBurnout });
  } catch (error) {
    console.error('Error toggling task completion:', error);
    res.status(500).json({ error: 'Failed to toggle task completion.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await prisma.task.delete({ where: { id } });

    // Recalculate burnout
    const updatedBurnout = await calculateBurnoutRisk(userId);

    res.json({ success: true, burnoutRisk: updatedBurnout });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

const getPrioritization = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await prisma.task.findMany({
      where: { userId, completed: false },
    });

    const latestBurnout = await prisma.burnoutScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });

    const result = prioritizeTasks(tasks, latestBurnout?.score || 50);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to prioritize tasks.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
  getPrioritization,
};
