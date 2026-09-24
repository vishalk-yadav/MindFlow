const express = require('express');
const router = express.Router();
const { startFocusSession, completeFocusSession, getFocusStats, getAllFocusSessions } = require('../controllers/focusController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/start', startFocusSession);
router.post('/complete/:id?', completeFocusSession);
router.get('/stats', getFocusStats);
router.get('/history', getAllFocusSessions);

module.exports = router;
