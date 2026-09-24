const express = require('express');
const router = express.Router();
const { logGameSession, getGameStats } = require('../controllers/gameController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/log', logGameSession);
router.get('/stats', getGameStats);

module.exports = router;
