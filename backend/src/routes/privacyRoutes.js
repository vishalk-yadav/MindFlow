const express = require('express');
const router = express.Router();
const {
  getPrivacyOverview,
  toggleAnonymousMode,
  exportUserData,
  deleteAccount,
} = require('../controllers/privacyController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getPrivacyOverview);
router.patch('/anonymous', toggleAnonymousMode);
router.get('/export', exportUserData);
router.delete('/account', deleteAccount);

module.exports = router;
