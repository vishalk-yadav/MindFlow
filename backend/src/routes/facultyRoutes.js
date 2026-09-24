const express = require('express');
const router = express.Router();
const { authenticate, requireFaculty } = require('../middleware/auth');
const facultyController = require('../controllers/facultyController');

// All faculty routes require authentication and FACULTY or ADMIN role
router.use(authenticate, requireFaculty);

// Dashboard Overview
router.get('/dashboard', facultyController.getDashboardOverview);

// Student Directory & Profile
router.get('/students', facultyController.getStudentsDirectory);
router.get('/students/:id', facultyController.getStudentDetail);

// Burnout Alerts & Interventions
router.get('/alerts', facultyController.getAlerts);
router.patch('/alerts/:id/review', facultyController.reviewAlert);
router.patch('/alerts/:id/resolve', facultyController.resolveAlert);
router.post('/alerts/:id/notes', facultyController.addInterventionNote);

// Institutional Analytics & Activity Feed
router.get('/analytics', facultyController.getAnalytics);
router.get('/activity', facultyController.getActivityLogs);

module.exports = router;
