const express = require('express');
const router = express.Router();
const { createDailyPlan, getLatestPlan } = require('../controllers/plannerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/generate', createDailyPlan);
router.get('/', getLatestPlan);

module.exports = router;
