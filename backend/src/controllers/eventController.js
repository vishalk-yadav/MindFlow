const prisma = require('../config/db');

/**
 * Checks for any events scheduled for today where reminders haven't been sent,
 * and creates in-app notifications for the student.
 */
const checkAndSendTodayReminders = async (userId) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const pendingTodayEvents = await prisma.plannerEvent.findMany({
      where: {
        userId,
        notify: true,
        reminderSent: false,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    for (const event of pendingTodayEvents) {
      await prisma.notification.create({
        data: {
          userId,
          title: `Event Today: ${event.title}`,
          message: `Reminder: You have "${event.title}" scheduled for today${
            event.startTime ? ` at ${event.startTime}` : ''
          }.${event.description ? ` Details: ${event.description}` : ''}`,
          type: 'EVENT',
          read: false,
        },
      });

      await prisma.plannerEvent.update({
        where: { id: event.id },
        data: { reminderSent: true },
      });
    }
  } catch (err) {
    console.error('Failed to trigger daily event reminders:', err);
  }
};

/**
 * GET /api/events
 * Retrieves events with optional date filtering and triggers today's reminders.
 */
const getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month, date } = req.query;

    // Check today's reminders in background
    await checkAndSendTodayReminders(userId);

    const where = { userId };

    if (date) {
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        const [y, m, d] = date.trim().split('-').map(Number);
        const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
        const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
        where.date = { gte: start, lte: end };
      } else {
        const targetDate = new Date(date);
        const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
        const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
        where.date = { gte: start, lte: end };
      }
    } else if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1; // 0-indexed month
      const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      where.date = { gte: start, lte: end };
    }

    const events = await prisma.plannerEvent.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    res.json(events);
  } catch (error) {
    console.error('getEvents error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

/**
 * GET /api/events/today
 * Returns all events scheduled for today.
 */
const getTodayEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const events = await prisma.plannerEvent.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json(events);
  } catch (error) {
    console.error('getTodayEvents error:', error);
    res.status(500).json({ error: "Failed to fetch today's events." });
  }
};

/**
 * POST /api/events
 * Creates a new event and immediately creates a notification about that day.
 */
const createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      category = 'ACADEMIC',
      color = 'blue',
      isAllDay = false,
      notify = true,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Event title and date are required.' });
    }

    let parsedDate;
    let dateInputStr = '';

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      dateInputStr = date.trim();
      const [y, m, d] = dateInputStr.split('-').map(Number);
      parsedDate = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    } else {
      parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getFullYear();
        const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const d = String(parsedDate.getDate()).padStart(2, '0');
        dateInputStr = `${y}-${m}-${d}`;
      }
    }

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided.' });
    }

    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isToday = dateInputStr === nowStr;

    const event = await prisma.plannerEvent.create({
      data: {
        userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        date: parsedDate,
        startTime: isAllDay ? null : startTime || null,
        endTime: isAllDay ? null : endTime || null,
        category,
        color,
        isAllDay: Boolean(isAllDay),
        notify: Boolean(notify),
        reminderSent: isToday, // if today, we create the reminder notification immediately below
      },
    });

    let notification = null;
    if (notify) {
      const [y, m, d] = (dateInputStr || '').split('-').map(Number);
      const displayDt = dateInputStr ? new Date(y, m - 1, d) : parsedDate;
      const formattedDateStr = displayDt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const notifTitle = isToday ? `Event Today: ${event.title}` : `Event Scheduled: ${event.title}`;
      const notifMessage = isToday
        ? `🔔 Today is the day! "${event.title}" is scheduled for today${
            event.startTime ? ` at ${event.startTime}` : ''
          }.${event.description ? ` Notes: ${event.description}` : ''}`
        : `📅 Event "${event.title}" has been scheduled for ${formattedDateStr}${
            event.startTime ? ` at ${event.startTime}` : ''
          }.${event.description ? ` (${event.description})` : ''} You will be notified on that day.`;

      notification = await prisma.notification.create({
        data: {
          userId,
          title: notifTitle,
          message: notifMessage,
          type: 'EVENT',
          read: false,
        },
      });
    }

    res.status(201).json({
      success: true,
      event,
      notification,
      isToday,
    });
  } catch (error) {
    console.error('createEvent error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

/**
 * PUT /api/events/:id
 * Updates an existing event.
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.plannerEvent.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const {
      title,
      description,
      date,
      startTime,
      endTime,
      category,
      color,
      isAllDay,
      notify,
    } = req.body;

    const updated = await prisma.plannerEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(category !== undefined && { category }),
        ...(color !== undefined && { color }),
        ...(isAllDay !== undefined && { isAllDay: Boolean(isAllDay) }),
        ...(notify !== undefined && { notify: Boolean(notify) }),
      },
    });

    res.json({ success: true, event: updated });
  } catch (error) {
    console.error('updateEvent error:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

/**
 * DELETE /api/events/:id
 * Deletes an event.
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.plannerEvent.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    await prisma.plannerEvent.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('deleteEvent error:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};

module.exports = {
  getEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  checkAndSendTodayReminders,
};
