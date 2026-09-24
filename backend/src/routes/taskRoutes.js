const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
  getPrioritization,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/prioritize', getPrioritization);
router.put('/:id', updateTask);
router.patch('/:id/complete', toggleComplete);
router.delete('/:id', deleteTask);

module.exports = router;
