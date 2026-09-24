const express = require('express');
const router = express.Router();
const { createCheckIn, getCheckIns } = require('../controllers/checkinController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createCheckIn);
router.get('/', getCheckIns);

module.exports = router;
