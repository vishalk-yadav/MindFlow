const prisma = require('../config/db');
const { generateDailyPlan } = require('../services/plannerService');

const createDailyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startHour, forceRecovery } = req.body;

    const plan = await generateDailyPlan(userId, { startHour, forceRecovery });
    res.json(plan);
  } catch (error) {
    console.error('Planner error:', error);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
};

const getLatestPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await prisma.plannerSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      // Auto-generate if none exists
      const newPlan = await generateDailyPlan(userId);
      return res.json(newPlan);
    }

    res.json({
      id: plan.id,
      schedule: plan.scheduleJson,
      burnoutAdapted: plan.burnoutAdapted,
      createdAt: plan.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study plan.' });
  }
};

module.exports = { createDailyPlan, getLatestPlan };
