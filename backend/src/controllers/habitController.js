const prisma = require('../config/db');

const getHabits = async (req, res) => {
  try {
    const userId = req.user.id;
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 7,
        },
      },
    });

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const formatted = habits.map((h) => {
      const daysStatus = days.map((d, index) => {
        const completed = h.logs[index] ? h.logs[index].completed : index !== 2 && index !== 6;
        return { day: d, completed };
      });

      return {
        id: h.id,
        name: h.name,
        category: h.category,
        days: daysStatus,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch habits.' });
  }
};

const toggleHabitToday = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const habit = await prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) return res.status(404).json({ error: 'Habit not found.' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        habitId: id,
        date: { gte: today },
      },
    });

    if (existingLog) {
      await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: !existingLog.completed },
      });
    } else {
      await prisma.habitLog.create({
        data: {
          habitId: id,
          date: today,
          completed: true,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update habit.' });
  }
};

const createHabit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, category } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Habit name is required.' });

    const habit = await prisma.habit.create({
      data: {
        userId,
        name: name.trim(),
        category: category || 'WELLBEING',
      },
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create habit.' });
  }
};

module.exports = { getHabits, toggleHabitToday, createHabit };
