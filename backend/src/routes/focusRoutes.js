const express = require('express');
const router = express.Router();
const {
  startFocusSession,
  completeFocusSession,
  getFocusStats,
  getAllFocusSessions,
  logSleepSession,
  getSleepStats,
} = require('../controllers/focusController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/start', startFocusSession);
router.post('/complete/:id?', completeFocusSession);
router.get('/stats', getFocusStats);
router.get('/history', getAllFocusSessions);

// Sleep Timer Endpoints
router.post('/sleep', logSleepSession);
router.get('/sleep/stats', getSleepStats);

module.exports = router;
