const express = require('express');
const router = express.Router();
const { getStudentAnalytics } = require('../services/analyticsService');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const data = await getStudentAnalytics(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
});

module.exports = router;
