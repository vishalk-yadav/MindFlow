const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and ADMIN role
router.use(authenticate, requireAdmin);

// Settings & Thresholds
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

// Faculty Management
router.get('/faculty', adminController.getFacultyList);
router.post('/faculty', adminController.createFaculty);
router.patch('/faculty/:id', adminController.updateFaculty);

// System Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
