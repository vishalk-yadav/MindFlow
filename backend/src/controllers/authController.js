const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'mindflow_super_secret_jwt_key_2025_engineering_wellbeing';

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, branch, year, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: {
          create: {
            college: college || 'National Institute of Technology',
            targetSleepHours: 7.5,
            dailyStudyHours: 6.0,
            priorities: ['Semester academics', 'DSA', 'Projects'],
          },
        },
        academicProfile: {
          create: {
            branch: branch || 'Computer Science & Engineering',
            year: year || '2nd Year',
            semester: 4,
            currentSubjects: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Mathematics IV'],
          },
        },
        privacySetting: {
          create: {
            shareAnalytics: false,
            storeAIHistory: true,
            retentionDays: 365,
          },
        },
      },
      include: {
        profile: true,
        academicProfile: true,
      },
    });

    // Create default habits
    const defaultHabits = [
      { name: 'Sleep (7h)', category: 'SLEEP' },
      { name: 'Exercise', category: 'PHYSICAL' },
      { name: 'Water (8 glasses)', category: 'HEALTH' },
      { name: 'Meditation', category: 'MINDFULNESS' },
      { name: 'Breaks', category: 'RECOVERY' },
      { name: 'No Screen (1h)', category: 'WELLBEING' },
    ];

    for (const h of defaultHabits) {
      await prisma.habit.create({
        data: {
          userId: user.id,
          name: h.name,
          category: h.category,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        institutionId: user.institutionId,
        section: user.section,
        anonymousMode: user.anonymousMode,
        profile: user.profile,
        academicProfile: user.academicProfile,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        academicProfile: true,
        institution: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.anonymousMode ? 'Anonymous Student #4092' : user.name,
        email: user.anonymousMode ? 'hidden@mindflow.local' : user.email,
        role: user.role,
        department: user.department,
        institutionId: user.institutionId,
        section: user.section,
        institution: user.institution,
        anonymousMode: user.anonymousMode,
        profile: user.profile,
        academicProfile: user.academicProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        academicProfile: true,
        privacySetting: true,
        institution: true,
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.anonymousMode ? 'Anonymous Student #4092' : user.name,
        email: user.anonymousMode ? 'hidden@mindflow.local' : user.email,
        role: user.role,
        department: user.department,
        institutionId: user.institutionId,
        section: user.section,
        institution: user.institution,
        anonymousMode: user.anonymousMode,
        profile: user.profile,
        academicProfile: user.academicProfile,
        privacySetting: user.privacySetting,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load user profile.' });
  }
};

const updateOnboarding = async (req, res) => {
  try {
    const { branch, year, semester, currentSubjects, targetSleepHours, dailyStudyHours, priorities } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profile: {
          update: {
            ...(targetSleepHours && { targetSleepHours: Number(targetSleepHours) }),
            ...(dailyStudyHours && { dailyStudyHours: Number(dailyStudyHours) }),
            ...(priorities && { priorities }),
          },
        },
        academicProfile: {
          update: {
            ...(branch && { branch }),
            ...(year && { year }),
            ...(semester && { semester: Number(semester) }),
            ...(currentSubjects && { currentSubjects }),
          },
        },
      },
      include: {
        profile: true,
        academicProfile: true,
      },
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update onboarding data.' });
  }
};

module.exports = { register, login, getMe, updateOnboarding };
