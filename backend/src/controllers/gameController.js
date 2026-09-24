const prisma = require('../config/db');

const logGameSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType, durationSeconds, score, postMoodFeedback } = req.body;

    const session = await prisma.gameSession.create({
      data: {
        userId,
        gameType: gameType || 'STRESS_BUBBLES',
        durationSeconds: durationSeconds ? parseInt(durationSeconds, 10) : 30,
        score: score ? parseInt(score, 10) : 0,
        postMoodFeedback: postMoodFeedback || 'BETTER',
      },
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record game session.' });
  }
};

const getGameStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await prisma.gameSession.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 20,
    });

    const totalPlayed = sessions.length;
    const feltBetterCount = sessions.filter((s) => s.postMoodFeedback === 'BETTER').length;
    const resetSuccessRate = totalPlayed > 0 ? Math.round((feltBetterCount / totalPlayed) * 100) : 100;

    res.json({
      totalPlayed,
      resetSuccessRate,
      recentSessions: sessions.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game stats.' });
  }
};

module.exports = { logGameSession, getGameStats };
