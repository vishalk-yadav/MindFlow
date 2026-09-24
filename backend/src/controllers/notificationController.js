const prisma = require('../config/db');
const { checkAndSendTodayReminders } = require('./eventController');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check today's event reminders
    await checkAndSendTodayReminders(userId);

    let notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (notifications.length === 0) {
      await prisma.notification.createMany({
        data: [
          {
            userId,
            title: 'Assignment Deadline Approaching',
            message: 'Complete DSA assignment is due today in 10 hours.',
            type: 'DEADLINE',
            read: false,
          },
          {
            userId,
            title: 'Recovery Telemetry Active',
            message: 'MindFlow is tracking your workload and recovery balance. Remember to take regular 5-minute breaks.',
            type: 'NUDGE',
            read: false,
          },
        ],
      });
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return res.json({ success: true });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

const clearNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.notification.deleteMany({
      where: { userId },
    });
    res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
};

module.exports = { getNotifications, markAsRead, clearNotifications };
