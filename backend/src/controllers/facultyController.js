const prisma = require('../config/db');

/**
 * Helper to get the student scoping filter based on faculty role and assignments.
 * Admin sees all institution students; Faculty sees institution / department students.
 */
const getStudentScope = (facultyUser) => {
  const where = { role: 'STUDENT' };

  if (facultyUser.institutionId) {
    where.OR = [
      { institutionId: facultyUser.institutionId },
      { institutionId: null }, // unassigned students in same deployment
    ];
  }

  // If faculty is assigned to a specific department and is not Admin, optionally narrow
  // but by default faculty can monitor institution students with department filtering.
  return where;
};

/**
 * GET /api/faculty/dashboard
 * Aggregated metrics & quick alerts overview.
 */
const getDashboardOverview = async (req, res) => {
  try {
    const studentFilter = getStudentScope(req.user);

    // 1. All registered students in scope
    const students = await prisma.user.findMany({
      where: studentFilter,
      include: {
        burnoutScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
        academicProfile: true,
        checkIns: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    const totalStudents = students.length;

    // Categorize students by latest burnout score
    let lowRisk = 0;
    let moderateRisk = 0;
    let highRisk = 0;
    let criticalRisk = 0;

    const highRiskStudents = [];

    students.forEach((s) => {
      const latestScore = s.burnoutScores[0]?.score ?? 35;
      if (latestScore >= 80) {
        criticalRisk++;
        highRiskStudents.push({
          id: s.id,
          name: s.name,
          email: s.email,
          department: s.department || s.academicProfile?.branch || 'General Engineering',
          year: s.academicProfile?.year || '1st Year',
          score: latestScore,
          riskLevel: 'CRITICAL',
          lastCheckIn: s.checkIns[0]?.date || null,
        });
      } else if (latestScore >= 60) {
        highRisk++;
        highRiskStudents.push({
          id: s.id,
          name: s.name,
          email: s.email,
          department: s.department || s.academicProfile?.branch || 'General Engineering',
          year: s.academicProfile?.year || '1st Year',
          score: latestScore,
          riskLevel: 'HIGH',
          lastCheckIn: s.checkIns[0]?.date || null,
        });
      } else if (latestScore >= 30) {
        moderateRisk++;
      } else {
        lowRisk++;
      }
    });

    // Sort high-risk students by score desc
    highRiskStudents.sort((a, b) => b.score - a.score);

    // 2. Active Alerts count & Recent Alerts
    const activeAlerts = await prisma.burnoutAlert.findMany({
      where: {
        status: { in: ['UNREVIEWED', 'REVIEWED', 'IN_PROGRESS'] },
        student: studentFilter,
      },
      include: {
        student: {
          include: { academicProfile: true },
        },
        interventionNotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { riskScore: 'desc' },
        { detectedAt: 'desc' },
      ],
      take: 6,
    });

    const unreviewedAlertsCount = await prisma.burnoutAlert.count({
      where: {
        status: 'UNREVIEWED',
        student: studentFilter,
      },
    });

    // 3. Department breakdown
    const deptMap = {};
    students.forEach((s) => {
      const dept = s.department || s.academicProfile?.branch || 'Other';
      const score = s.burnoutScores[0]?.score ?? 35;
      if (!deptMap[dept]) {
        deptMap[dept] = { name: dept, total: 0, highRiskCount: 0, sumScore: 0 };
      }
      deptMap[dept].total++;
      deptMap[dept].sumScore += score;
      if (score >= 60) deptMap[dept].highRiskCount++;
    });

    const departmentStats = Object.values(deptMap).map((d) => ({
      name: d.name,
      totalStudents: d.total,
      highRiskCount: d.highRiskCount,
      averageScore: Math.round(d.sumScore / (d.total || 1)),
    }));

    res.json({
      summary: {
        totalStudents,
        lowRisk,
        moderateRisk,
        highRisk,
        criticalRisk,
        unreviewedAlertsCount,
        activeAlertsCount: activeAlerts.length,
      },
      recentAlerts: activeAlerts,
      highRiskStudents: highRiskStudents.slice(0, 4),
      departmentStats,
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({ error: 'Failed to load faculty dashboard data.' });
  }
};

/**
 * GET /api/faculty/students
 * Search and filter student directory.
 */
const getStudentsDirectory = async (req, res) => {
  try {
    const { search, department, year, riskLevel, page = 1, limit = 25 } = req.query;
    const baseFilter = getStudentScope(req.user);

    const where = {
      ...baseFilter,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(department && {
        OR: [
          { department: { contains: department, mode: 'insensitive' } },
          { academicProfile: { branch: { contains: department, mode: 'insensitive' } } },
        ],
      }),
      ...(year && {
        academicProfile: { year },
      }),
    };

    const students = await prisma.user.findMany({
      where,
      include: {
        academicProfile: true,
        profile: true,
        burnoutScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
        checkIns: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        tasks: {
          where: { completed: false },
        },
        studentAlerts: {
          where: { status: { in: ['UNREVIEWED', 'REVIEWED', 'IN_PROGRESS'] } },
          orderBy: { detectedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    // Map formatted records
    let records = students.map((s) => {
      const score = s.burnoutScores[0]?.score ?? 35;
      let computedRisk = 'LOW';
      if (score >= 80) computedRisk = 'CRITICAL';
      else if (score >= 60) computedRisk = 'HIGH';
      else if (score >= 30) computedRisk = 'MODERATE';

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        department: s.department || s.academicProfile?.branch || 'General Engineering',
        branch: s.academicProfile?.branch || 'Computer Science & Engineering',
        year: s.academicProfile?.year || '2nd Year',
        section: s.section || 'A',
        burnoutScore: score,
        riskLevel: computedRisk,
        lastCheckIn: s.checkIns[0]?.date || null,
        activeTasksCount: s.tasks.length,
        hasActiveAlert: s.studentAlerts.length > 0,
        activeAlertId: s.studentAlerts[0]?.id || null,
        createdAt: s.createdAt,
      };
    });

    // Filter by riskLevel if requested
    if (riskLevel && riskLevel !== 'ALL') {
      records = records.filter((r) => r.riskLevel.toUpperCase() === riskLevel.toUpperCase());
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const totalCount = records.length;
    const paginated = records.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      students: paginated,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Students directory error:', error);
    res.status(500).json({ error: 'Failed to retrieve students list.' });
  }
};

/**
 * GET /api/faculty/students/:id
 * Detailed student wellbeing profile. Records an audit log.
 */
const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        academicProfile: true,
        profile: true,
        institution: true,
        burnoutScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 30,
        },
        checkIns: {
          orderBy: { date: 'desc' },
          take: 14,
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        focusSessions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        studentAlerts: {
          include: {
            interventionNotes: {
              include: { faculty: { select: { id: true, name: true, department: true } } },
              orderBy: { createdAt: 'desc' },
            },
          },
          orderBy: { detectedAt: 'desc' },
        },
      },
    });

    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ error: 'Student not found or unauthorized.' });
    }

    // Create AuditLog entry for viewing student profile
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'VIEW_STUDENT_PROFILE',
        targetType: 'STUDENT',
        targetId: student.id,
        metadata: {
          studentName: student.name,
          studentEmail: student.email,
        },
      },
    });

    const latestBurnout = student.burnoutScores[0] || null;
    const score = latestBurnout?.score ?? 35;
    let riskLevel = 'LOW';
    if (score >= 80) riskLevel = 'CRITICAL';
    else if (score >= 60) riskLevel = 'HIGH';
    else if (score >= 30) riskLevel = 'MODERATE';

    // Tasks metrics
    const totalTasks = student.tasks.length;
    const completedTasks = student.tasks.filter((t) => t.completed).length;
    const pendingTasks = student.tasks.filter((t) => !t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Check-in averages (past 14 checkins)
    const checkIns = student.checkIns;
    const avgSleep = checkIns.length > 0
      ? Number((checkIns.reduce((acc, c) => acc + c.sleepHours, 0) / checkIns.length).toFixed(1))
      : 7.0;
    const avgStress = checkIns.length > 0
      ? Number((checkIns.reduce((acc, c) => acc + c.stressLevel, 0) / checkIns.length).toFixed(1))
      : 5.0;
    const avgStudy = checkIns.length > 0
      ? Number((checkIns.reduce((acc, c) => acc + c.studyHours, 0) / checkIns.length).toFixed(1))
      : 6.0;

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department || student.academicProfile?.branch,
        branch: student.academicProfile?.branch,
        year: student.academicProfile?.year,
        semester: student.academicProfile?.semester,
        section: student.section || 'A',
        college: student.profile?.college || student.institution?.name,
        targetSleepHours: student.profile?.targetSleepHours || 7.5,
        dailyStudyHours: student.profile?.dailyStudyHours || 6.0,
      },
      currentBurnout: {
        score,
        riskLevel,
        explanation: latestBurnout?.explanation || 'Balanced wellbeing indicators.',
        workloadFactor: latestBurnout?.workloadFactor ?? 30,
        sleepFactor: latestBurnout?.sleepFactor ?? 25,
        stressFactor: latestBurnout?.stressFactor ?? 25,
        breaksFactor: latestBurnout?.breaksFactor ?? 20,
        positiveFactors: latestBurnout?.positiveFactors || [],
        negativeFactors: latestBurnout?.negativeFactors || [],
        calculatedAt: latestBurnout?.calculatedAt || new Date(),
      },
      trends: {
        burnoutHistory: student.burnoutScores.map((b) => ({
          date: b.calculatedAt,
          score: b.score,
          riskLevel: b.riskLevel,
        })),
        avgSleep,
        avgStress,
        avgStudy,
      },
      checkInHistory: student.checkIns.map((c) => ({
        id: c.id,
        date: c.date,
        mood: c.mood,
        stressLevel: c.stressLevel,
        sleepHours: c.sleepHours,
        studyHours: c.studyHours,
        breaksCount: c.breaksCount,
        mainWorkload: c.mainWorkload,
      })),
      tasksSummary: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate,
        upcomingTasks: student.tasks.filter((t) => !t.completed).slice(0, 5),
      },
      alerts: student.studentAlerts,
    });
  } catch (error) {
    console.error('Student detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve student profile.' });
  }
};

/**
 * GET /api/faculty/alerts
 * List and filter burnout alerts.
 */
const getAlerts = async (req, res) => {
  try {
    const { status, riskLevel, sort = 'risk_desc' } = req.query;
    const studentFilter = getStudentScope(req.user);

    const where = {
      student: studentFilter,
      ...(status && status !== 'ALL' && { status }),
      ...(riskLevel && riskLevel !== 'ALL' && { riskLevel }),
    };

    let orderBy = [{ riskScore: 'desc' }, { detectedAt: 'desc' }];
    if (sort === 'date_desc') orderBy = [{ detectedAt: 'desc' }];
    if (sort === 'date_asc') orderBy = [{ detectedAt: 'asc' }];
    if (sort === 'risk_asc') orderBy = [{ riskScore: 'asc' }];

    const alerts = await prisma.burnoutAlert.findMany({
      where,
      include: {
        student: {
          include: {
            academicProfile: true,
            profile: true,
          },
        },
        reviewedBy: {
          select: { id: true, name: true, email: true },
        },
        interventionNotes: {
          include: {
            faculty: {
              select: { id: true, name: true, department: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy,
    });

    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to retrieve burnout alerts.' });
  }
};

/**
 * PATCH /api/faculty/alerts/:id/review
 * Marks alert as REVIEWED.
 */
const reviewAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.burnoutAlert.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    const updated = await prisma.burnoutAlert.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        reviewedAt: new Date(),
        reviewedById: req.user.id,
      },
      include: {
        student: true,
        reviewedBy: { select: { id: true, name: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'REVIEW_ALERT',
        targetType: 'ALERT',
        targetId: id,
        metadata: {
          studentName: alert.student.name,
          riskScore: alert.riskScore,
        },
      },
    });

    res.json({ success: true, alert: updated });
  } catch (error) {
    console.error('Review alert error:', error);
    res.status(500).json({ error: 'Failed to update alert status.' });
  }
};

/**
 * PATCH /api/faculty/alerts/:id/resolve
 * Marks alert as RESOLVED.
 */
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.burnoutAlert.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    const updated = await prisma.burnoutAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        reviewedById: alert.reviewedById || req.user.id,
        reviewedAt: alert.reviewedAt || new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESOLVE_ALERT',
        targetType: 'ALERT',
        targetId: id,
        metadata: {
          studentName: alert.student.name,
          riskScore: alert.riskScore,
        },
      },
    });

    res.json({ success: true, alert: updated });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert.' });
  }
};

/**
 * POST /api/faculty/alerts/:id/notes
 * Adds supportive intervention note.
 */
const addInterventionNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, actionType = 'NOTE' } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Please provide a supportive intervention note.' });
    }

    const alert = await prisma.burnoutAlert.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    const interventionNote = await prisma.interventionNote.create({
      data: {
        alertId: id,
        facultyId: req.user.id,
        note: note.trim(),
        actionType,
      },
      include: {
        faculty: { select: { id: true, name: true, department: true } },
      },
    });

    // Advance status to IN_PROGRESS if UNREVIEWED
    if (alert.status === 'UNREVIEWED') {
      await prisma.burnoutAlert.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          reviewedAt: alert.reviewedAt || new Date(),
          reviewedById: alert.reviewedById || req.user.id,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ADD_INTERVENTION_NOTE',
        targetType: 'ALERT',
        targetId: id,
        metadata: {
          actionType,
          studentName: alert.student.name,
        },
      },
    });

    res.status(201).json({ success: true, note: interventionNote });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add intervention note.' });
  }
};

/**
 * GET /api/faculty/analytics
 * Aggregated institution-level analytics (privacy-safe, non-identifying).
 */
const getAnalytics = async (req, res) => {
  try {
    const studentFilter = getStudentScope(req.user);

    const students = await prisma.user.findMany({
      where: studentFilter,
      include: {
        burnoutScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 7,
        },
        checkIns: {
          orderBy: { date: 'desc' },
          take: 7,
        },
        academicProfile: true,
      },
    });

    // 1. Burnout Distribution
    let low = 0;
    let moderate = 0;
    let high = 0;
    let critical = 0;

    students.forEach((s) => {
      const score = s.burnoutScores[0]?.score ?? 35;
      if (score >= 80) critical++;
      else if (score >= 60) high++;
      else if (score >= 30) moderate++;
      else low++;
    });

    const total = students.length || 1;
    const distribution = [
      { name: 'Low Risk', count: low, percentage: Math.round((low / total) * 100), color: '#10b981' },
      { name: 'Moderate Risk', count: moderate, percentage: Math.round((moderate / total) * 100), color: '#f59e0b' },
      { name: 'High Risk', count: high, percentage: Math.round((high / total) * 100), color: '#f97316' },
      { name: 'Critical Risk', count: critical, percentage: Math.round((critical / total) * 100), color: '#ef4444' },
    ];

    // 2. Weekly average burnout trend (past 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrend = days.map((day, idx) => {
      // Aggregate average for that slot across students
      let sum = 0;
      let count = 0;
      students.forEach((s) => {
        const item = s.burnoutScores[idx % (s.burnoutScores.length || 1)];
        if (item) {
          sum += item.score;
          count++;
        }
      });
      return {
        day,
        avgScore: count > 0 ? Math.round(sum / count) : 48,
        activeCheckIns: Math.round(count * 0.8),
      };
    });

    // 3. Department Comparison
    const deptStats = {};
    students.forEach((s) => {
      const d = s.department || s.academicProfile?.branch || 'Other';
      const score = s.burnoutScores[0]?.score ?? 35;
      if (!deptStats[d]) {
        deptStats[d] = { department: d, total: 0, highRisk: 0, avgScoreSum: 0 };
      }
      deptStats[d].total++;
      deptStats[d].avgScoreSum += score;
      if (score >= 60) deptStats[d].highRisk++;
    });

    const departmentComparison = Object.values(deptStats).map((d) => ({
      department: d.department,
      studentCount: d.total,
      highRiskCount: d.highRisk,
      avgScore: Math.round(d.avgScoreSum / (d.total || 1)),
    }));

    // 4. Check-in Participation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkedInToday = students.filter((s) => {
      const lastCheck = s.checkIns[0]?.date;
      return lastCheck && new Date(lastCheck) >= today;
    }).length;

    const inactiveCount = students.length - checkedInToday;
    const weeklyParticipationRate = Math.round((checkedInToday / total) * 100);

    res.json({
      distribution,
      weeklyTrend,
      departmentComparison,
      participation: {
        checkedInToday,
        inactiveCount,
        weeklyRate: weeklyParticipationRate,
      },
    });
  } catch (error) {
    console.error('Faculty analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics.' });
  }
};

/**
 * GET /api/faculty/activity
 * Activity log of academic and wellbeing events.
 */
const getActivityLogs = async (req, res) => {
  try {
    const studentFilter = getStudentScope(req.user);

    // Recent checkins
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { user: studentFilter },
      include: {
        user: { select: { id: true, name: true, department: true } },
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    // Recent tasks completed
    const tasksCompleted = await prisma.task.findMany({
      where: {
        user: studentFilter,
        completed: true,
        completedAt: { not: null },
      },
      include: {
        user: { select: { id: true, name: true, department: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    // Recent alerts detected
    const alerts = await prisma.burnoutAlert.findMany({
      where: { student: studentFilter },
      include: {
        student: { select: { id: true, name: true, department: true } },
      },
      orderBy: { detectedAt: 'desc' },
      take: 15,
    });

    // Merge into normalized timeline
    const timeline = [];

    checkIns.forEach((c) => {
      timeline.push({
        id: `ci-${c.id}`,
        timestamp: c.date,
        type: 'CHECK_IN',
        studentName: c.user.name,
        department: c.user.department || 'Engineering',
        title: 'Completed Daily Check-in',
        details: `Mood: ${c.mood} • Stress: ${c.stressLevel}/10 • Sleep: ${c.sleepHours}h • Study: ${c.studyHours}h`,
      });
    });

    tasksCompleted.forEach((t) => {
      timeline.push({
        id: `task-${t.id}`,
        timestamp: t.completedAt,
        type: 'TASK_COMPLETED',
        studentName: t.user.name,
        department: t.user.department || 'Engineering',
        title: `Completed Task: "${t.title}"`,
        details: `Category: ${t.category} • Priority: ${t.priority}`,
      });
    });

    alerts.forEach((a) => {
      timeline.push({
        id: `alert-${a.id}`,
        timestamp: a.detectedAt,
        type: 'BURNOUT_ALERT',
        studentName: a.student.name,
        department: a.student.department || 'Engineering',
        title: `${a.riskLevel === 'CRITICAL' ? 'Critical' : 'High'} Burnout Risk Detected (${a.riskScore}%)`,
        details: a.reason || 'Threshold exceeded after recent academic workload.',
      });
    });

    // Sort descending by timestamp
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(timeline.slice(0, 30));
  } catch (error) {
    console.error('Activity logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve activity stream.' });
  }
};

module.exports = {
  getDashboardOverview,
  getStudentsDirectory,
  getStudentDetail,
  getAlerts,
  reviewAlert,
  resolveAlert,
  addInterventionNote,
  getAnalytics,
  getActivityLogs,
};
