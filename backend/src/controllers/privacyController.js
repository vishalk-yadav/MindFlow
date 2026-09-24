const prisma = require('../config/db');

const getPrivacyOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        privacySetting: true,
        _count: {
          select: {
            tasks: true,
            checkIns: true,
            burnoutScores: true,
            focusSessions: true,
            habits: true,
            gameSessions: true,
            aiConversations: true,
          },
        },
      },
    });

    const categories = [
      { name: 'Profile & Academics', count: 1, purpose: 'Branch, year, semester and subjects to personalize workload estimation.' },
      { name: 'Academic & Coding Tasks', count: user._count.tasks, purpose: 'Task priorities and deadlines used in burnout risk calculation.' },
      { name: 'Daily Check-ins', count: user._count.checkIns, purpose: 'Sleep, stress, mood, and daily workload telemetry.' },
      { name: 'Burnout Indicator History', count: user._count.burnoutScores, purpose: 'Trend tracking and early fatigue pattern detection.' },
      { name: 'Focus Sessions', count: user._count.focusSessions, purpose: 'Session durations and DSA/coding productivity tracking.' },
      { name: 'Habits & Streaks', count: user._count.habits, purpose: 'Consistency tracking for sleep, water, and breaks.' },
      { name: 'Wellbeing Games', count: user._count.gameSessions, purpose: 'Micro-break duration and post-game mood resets.' },
      { name: 'AI Conversations', count: user._count.aiConversations, purpose: 'Guidance and personalized study scheduling history.' },
    ];

    res.json({
      anonymousMode: user.anonymousMode,
      settings: user.privacySetting,
      categories,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch privacy settings.' });
  }
};

const toggleAnonymousMode = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { anonymousMode: !user.anonymousMode },
    });

    res.json({
      success: true,
      anonymousMode: updated.anonymousMode,
      displayName: updated.anonymousMode ? 'Anonymous Student #4092' : updated.name,
      displayEmail: updated.anonymousMode ? 'hidden@mindflow.local' : updated.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update anonymous mode.' });
  }
};

const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const format = req.query.format || 'json';

    const fullData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        academicProfile: true,
        tasks: true,
        checkIns: true,
        burnoutScores: true,
        focusSessions: true,
        habits: { include: { logs: true } },
        gameSessions: true,
        examPreps: true,
        privacySetting: true,
      },
    });

    // Remove password hash
    delete fullData.passwordHash;

    if (format === 'csv') {
      // Basic CSV serialization for tasks
      const csvHeader = 'id,title,category,priority,completed,deadline\n';
      const csvRows = fullData.tasks.map(
        (t) => `"${t.id}","${t.title}","${t.category}","${t.priority}",${t.completed},"${t.deadline || ''}"`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=mindflow_tasks.csv');
      return res.send(csvHeader + csvRows);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=mindflow_data_export.json');
    res.json(fullData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    // Cascade delete user
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'Account and associated data deleted permanently.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};

module.exports = {
  getPrivacyOverview,
  toggleAnonymousMode,
  exportUserData,
  deleteAccount,
};
