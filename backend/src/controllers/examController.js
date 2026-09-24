const prisma = require('../config/db');

const getExams = async (req, res) => {
  try {
    const userId = req.user.id;
    const exams = await prisma.examPreparation.findMany({
      where: { userId },
      orderBy: { examDate: 'asc' },
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exam preparations.' });
  }
};

const createExam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subject, examDate, difficulty, topicsList } = req.body;

    const topics = topicsList || [
      { name: 'Core Foundations', completed: true },
      { name: 'Advanced Concepts', completed: false },
      { name: 'Problem Solving & Exercises', completed: false },
      { name: 'Previous Year Questions', completed: false },
    ];

    const completedCount = topics.filter((t) => t.completed).length;

    const exam = await prisma.examPreparation.create({
      data: {
        userId,
        subject: subject || 'DBMS Exam',
        examDate: examDate ? new Date(examDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        difficulty: difficulty || 'MEDIUM',
        topicsTotal: topics.length,
        topicsCompleted: completedCount,
        topicsList: topics,
      },
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam preparation.' });
  }
};

const updateExamTopics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { topicsList } = req.body;

    const existing = await prisma.examPreparation.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ error: 'Exam not found.' });

    const completedCount = topicsList.filter((t) => t.completed).length;

    const updated = await prisma.examPreparation.update({
      where: { id },
      data: {
        topicsList,
        topicsTotal: topicsList.length,
        topicsCompleted: completedCount,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exam topics.' });
  }
};

module.exports = { getExams, createExam, updateExamTopics };
