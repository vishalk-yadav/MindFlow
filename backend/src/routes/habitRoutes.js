const express = require('express');
const router = express.Router();
const { getHabits, toggleHabitToday, createHabit } = require('../controllers/habitController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/:id/toggle', toggleHabitToday);

module.exports = router;
