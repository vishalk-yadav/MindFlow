const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const focusRoutes = require('./routes/focusRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const examRoutes = require('./routes/examRoutes');
const aiRoutes = require('./routes/aiRoutes');
const habitRoutes = require('./routes/habitRoutes');
const gameRoutes = require('./routes/gameRoutes');
const privacyRoutes = require('./routes/privacyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const nudgeRoutes = require('./routes/nudgeRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Built-in in-memory rate limiter (300 requests per 15 minutes)
const ipRequestMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 300;

  const current = ipRequestMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  current.count++;
  ipRequestMap.set(ip, current);

  if (current.count > maxRequests) {
    return res.status(429).json({ error: 'Too many requests, please slow down.' });
  }
  next();
};
app.use('/api', rateLimiter);

app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', platform: 'MindFlow API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/nudges', nudgeRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
  });
});

module.exports = app;
