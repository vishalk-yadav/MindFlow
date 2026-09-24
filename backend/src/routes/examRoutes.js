const express = require('express');
const router = express.Router();
const { getExams, createExam, updateExamTopics } = require('../controllers/examController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getExams);
router.post('/', createExam);
router.put('/:id/topics', updateExamTopics);

module.exports = router;
