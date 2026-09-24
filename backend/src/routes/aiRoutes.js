const express = require('express');
const router = express.Router();
const { chat, getHistory, getStatus, clearHistory } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/chat', chat);
router.get('/history', getHistory);
router.delete('/history', clearHistory);
router.get('/status', getStatus);

module.exports = router;
