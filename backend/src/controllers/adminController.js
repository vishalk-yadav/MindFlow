const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/settings
 * Retrieves institution settings and configurable burnout risk thresholds.
 */
const getSettings = async (req, res) => {
  try {
    let institution = null;
    if (req.user.institutionId) {
      institution = await prisma.institution.findUnique({
        where: { id: req.user.institutionId },
      });
    }

    if (!institution) {
      institution = await prisma.institution.findFirst();
    }

    if (!institution) {
      institution = await prisma.institution.create({
        data: {
          name: 'National Institute of Technology',
          code: 'NIT-MFLOW',
          burnoutThreshold: 70,
          highThreshold: 60,
          criticalThreshold: 80,
          alertCooldownDays: 3,
        },
      });
    }

    res.json({
      institution: {
        id: institution.id,
        name: institution.name,
        code: institution.code,
      },
      thresholds: {
        burnoutThreshold: institution.burnoutThreshold,
        highThreshold: institution.highThreshold,
        criticalThreshold: institution.criticalThreshold,
        alertCooldownDays: institution.alertCooldownDays,
      },
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({ error: 'Failed to retrieve administrative settings.' });
  }
};

/**
 * PATCH /api/admin/settings
 * Configures burnout risk thresholds and alert cooldowns.
 */
const updateSettings = async (req, res) => {
  try {
    const {
      burnoutThreshold,
      highThreshold,
      criticalThreshold,
      alertCooldownDays,
      institutionName,
    } = req.body;

    let institution = null;
    if (req.user.institutionId) {
      institution = await prisma.institution.findUnique({
        where: { id: req.user.institutionId },
      });
    }
    if (!institution) {
      institution = await prisma.institution.findFirst();
    }

    // Validation
    const bThreshold = burnoutThreshold !== undefined ? Math.min(Math.max(parseInt(burnoutThreshold, 10), 10), 95) : institution.burnoutThreshold;
    const hThreshold = highThreshold !== undefined ? Math.min(Math.max(parseInt(highThreshold, 10), 10), 90) : institution.highThreshold;
    const cThreshold = criticalThreshold !== undefined ? Math.min(Math.max(parseInt(criticalThreshold, 10), 50), 99) : institution.criticalThreshold;
    const cooldown = alertCooldownDays !== undefined ? Math.min(Math.max(parseInt(alertCooldownDays, 10), 1), 30) : institution.alertCooldownDays;

    if (hThreshold >= cThreshold) {
      return res.status(400).json({ error: 'High risk threshold must be lower than critical risk threshold.' });
    }

    const updated = await prisma.institution.update({
      where: { id: institution.id },
      data: {
        burnoutThreshold: bThreshold,
        highThreshold: hThreshold,
        criticalThreshold: cThreshold,
        alertCooldownDays: cooldown,
        ...(institutionName && { name: institutionName.trim() }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_THRESHOLD_SETTINGS',
        targetType: 'SETTINGS',
        targetId: institution.id,
        metadata: {
          burnoutThreshold: bThreshold,
          highThreshold: hThreshold,
          criticalThreshold: cThreshold,
          alertCooldownDays: cooldown,
        },
      },
    });

    res.json({
      success: true,
      thresholds: {
        burnoutThreshold: updated.burnoutThreshold,
        highThreshold: updated.highThreshold,
        criticalThreshold: updated.criticalThreshold,
        alertCooldownDays: updated.alertCooldownDays,
      },
      message: 'Institution threshold configuration updated successfully.',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update administrative settings.' });
  }
};

/**
 * GET /api/admin/faculty
 * List all faculty members.
 */
const getFacultyList = async (req, res) => {
  try {
    const faculty = await prisma.user.findMany({
      where: {
        role: { in: ['FACULTY', 'ADMIN'] },
        ...(req.user.institutionId && { institutionId: req.user.institutionId }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
        _count: {
          select: {
            interventionNotes: true,
            reviewedAlerts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to retrieve faculty list.' });
  }
};

/**
 * POST /api/admin/faculty
 * Add or onboard a faculty member.
 */
const createFaculty = async (req, res) => {
  try {
    const { name, email, password, department, role = 'FACULTY' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and temporary password.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const faculty = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'FACULTY',
        department: department || 'Computer Science & Engineering',
        institutionId: req.user.institutionId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_FACULTY_USER',
        targetType: 'USER',
        targetId: faculty.id,
        metadata: { name, email, department },
      },
    });

    res.status(201).json({ success: true, faculty });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Failed to create faculty member.' });
  }
};

/**
 * PATCH /api/admin/faculty/:id
 * Updates faculty department assignment.
 */
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(department && { department }),
        ...(role && { role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
    });

    res.json({ success: true, faculty: updated });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ error: 'Failed to update faculty member.' });
  }
};

/**
 * GET /api/admin/audit-logs
 * Retrieves system audit logs.
 */
const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, action } = req.query;

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(action && { action }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10) || 50,
    });

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getFacultyList,
  createFaculty,
  updateFaculty,
  getAuditLogs,
};
