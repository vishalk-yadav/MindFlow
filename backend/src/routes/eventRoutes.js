const express = require('express');
const router = express.Router();
const {
  getEvents,
  getTodayEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getEvents);
router.get('/today', getTodayEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
