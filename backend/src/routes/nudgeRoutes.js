const express = require('express');
const router = express.Router();
const {
  getNudges,
  recommendNudges,
  dismissNudge,
  dismissAllNudges,
} = require('../controllers/nudgeController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getNudges);
router.post('/recommend', recommendNudges);
router.patch('/dismiss-all', dismissAllNudges);
router.patch('/:id/dismiss', dismissNudge);

module.exports = router;
