const prisma = require('../config/db');
const { generateNudges } = require('../services/nudgeService');

/**
 * Get active AI nudges for the authenticated student
 */
const getNudges = async (req, res) => {
  try {
    const userId = req.user.id;
    const nudges = await generateNudges(userId);
    res.json(nudges);
  } catch (error) {
    console.error('Error fetching nudges:', error);
    res.status(500).json({ error: 'Failed to retrieve AI nudges.' });
  }
};

/**
 * Explicitly trigger AI to evaluate telemetry and generate fresh recommendations
 */
const recommendNudges = async (req, res) => {
  try {
    const userId = req.user.id;
    const nudges = await generateNudges(userId, { forceAi: true });
    res.json({
      message: 'AI nudges evaluated and updated successfully.',
      nudges,
    });
  } catch (error) {
    console.error('Error generating AI nudge recommendations:', error);
    res.status(500).json({ error: 'Failed to generate AI nudge recommendations.' });
  }
};

/**
 * Dismiss a specific nudge
 */
const dismissNudge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.nudge.updateMany({
      where: { id, userId },
      data: { dismissed: true },
    });

    res.json({ success: true, message: 'Nudge dismissed.' });
  } catch (error) {
    console.error('Error dismissing nudge:', error);
    res.status(500).json({ error: 'Failed to dismiss nudge.' });
  }
};

/**
 * Dismiss all active nudges
 */
const dismissAllNudges = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.nudge.updateMany({
      where: { userId, dismissed: false },
      data: { dismissed: true },
    });

    res.json({ success: true, message: 'All nudges dismissed.' });
  } catch (error) {
    console.error('Error dismissing all nudges:', error);
    res.status(500).json({ error: 'Failed to dismiss all nudges.' });
  }
};

module.exports = {
  getNudges,
  recommendNudges,
  dismissNudge,
  dismissAllNudges,
};
