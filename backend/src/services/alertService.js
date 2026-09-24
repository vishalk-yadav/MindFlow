const prisma = require('../config/db');

/**
 * Evaluates whether a student's burnout score warrants an alert for faculty/admin.
 * Applies threshold evaluation, deduplication, and cooldown rules.
 */
async function evaluateStudentAlert(studentId, burnoutScore) {
  try {
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        institution: true,
        academicProfile: true,
        profile: true,
      },
    });

    if (!student) {
      return null;
    }

    const threshold = student.institution?.burnoutThreshold || 70;
    const criticalThreshold = student.institution?.criticalThreshold || 80;
    const score = burnoutScore.score;

    // Check if score crosses configured alert threshold
    if (score < threshold) {
      return null;
    }

    const severity = score >= criticalThreshold ? 'CRITICAL' : 'HIGH';

    // Find any existing active alert for this student (UNREVIEWED, REVIEWED, IN_PROGRESS)
    const existingActiveAlert = await prisma.burnoutAlert.findFirst({
      where: {
        studentId,
        status: { in: ['UNREVIEWED', 'REVIEWED', 'IN_PROGRESS'] },
      },
      orderBy: { detectedAt: 'desc' },
    });

    if (existingActiveAlert) {
      // Escalation rule: If score increased by 10+ points or escalated from HIGH to CRITICAL, update alert
      const isSignificantIncrease = score >= existingActiveAlert.riskScore + 10;
      const isEscalatedToCritical = severity === 'CRITICAL' && existingActiveAlert.riskLevel !== 'CRITICAL';

      if (isSignificantIncrease || isEscalatedToCritical) {
        const updated = await prisma.burnoutAlert.update({
          where: { id: existingActiveAlert.id },
          data: {
            riskScore: score,
            riskLevel: severity,
            reason: `Risk escalated (${score}%): ${burnoutScore.negativeFactors?.slice(0, 3).join(', ') || 'High workload and reduced recovery'}`,
            contributingFactors: burnoutScore.negativeFactors || existingActiveAlert.contributingFactors,
            status: 'UNREVIEWED', // Re-mark unreviewed so faculty notices the escalation
          },
        });

        // Notify faculty of escalation
        await notifyFacultyOfAlert(student, updated, 'RISK_INCREASE');

        return { alert: updated, created: false, escalated: true };
      }

      // Deduplication: Active alert already exists and no major escalation
      return { alert: existingActiveAlert, created: false, deduplicated: true };
    }

    // Cooldown check for recently resolved alert
    const cooldownDays = student.institution?.alertCooldownDays || 3;
    const recentResolvedAlert = await prisma.burnoutAlert.findFirst({
      where: {
        studentId,
        status: 'RESOLVED',
        resolvedAt: {
          gte: new Date(Date.now() - cooldownDays * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { resolvedAt: 'desc' },
    });

    if (recentResolvedAlert && score < criticalThreshold && score <= recentResolvedAlert.riskScore) {
      // Within cooldown period after resolution and not critically spiking
      return { alert: recentResolvedAlert, created: false, inCooldown: true };
    }

    // Construct contributing factors
    const factors = burnoutScore.negativeFactors && burnoutScore.negativeFactors.length > 0
      ? burnoutScore.negativeFactors
      : [
          'High continuous study/coding workload',
          'Sleep deficit relative to baseline target',
          'Academic deadline density',
        ];

    const reasonSummary = factors.slice(0, 3).join(' • ');

    // Create fresh BurnoutAlert
    const newAlert = await prisma.burnoutAlert.create({
      data: {
        studentId,
        institutionId: student.institutionId,
        riskScore: score,
        riskLevel: severity,
        threshold,
        status: 'UNREVIEWED',
        reason: reasonSummary,
        contributingFactors: factors,
      },
    });

    // Notify relevant faculty and admin
    await notifyFacultyOfAlert(student, newAlert, severity === 'CRITICAL' ? 'BURNOUT_CRITICAL' : 'BURNOUT_HIGH');

    // Create audit log for alert creation
    await prisma.auditLog.create({
      data: {
        userId: studentId,
        action: 'ALERT_TRIGGERED',
        targetType: 'ALERT',
        targetId: newAlert.id,
        metadata: {
          riskScore: score,
          riskLevel: severity,
          threshold,
        },
      },
    });

    return { alert: newAlert, created: true };
  } catch (error) {
    console.error('Failed to evaluate student alert:', error);
    return null;
  }
}

/**
 * Dispatches notification to faculty and admins assigned to this student or institution
 */
async function notifyFacultyOfAlert(student, alert, notificationType) {
  try {
    const studentDept = student.department || student.academicProfile?.branch;
    const studentYear = student.academicProfile?.year || 'Student';

    // Find faculty/admins in the same institution
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ['FACULTY', 'ADMIN'] },
        ...(student.institutionId && {
          OR: [
            { institutionId: student.institutionId },
            { institutionId: null }, // Global admin
          ],
        }),
      },
    });

    const isCritical = alert.riskLevel === 'CRITICAL';
    const title = isCritical
      ? 'Critical Burnout Risk Detected'
      : 'High Burnout Risk Detected';

    const message = isCritical
      ? `Critical alert: ${student.name} (${studentDept}, ${studentYear}) has reached a burnout risk score of ${alert.riskScore}%. Immediate review is recommended.`
      : `High risk alert: ${student.name} (${studentDept}, ${studentYear}) has crossed the alert threshold with a score of ${alert.riskScore}%.`;

    for (const recipient of recipients) {
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          studentId: student.id,
          riskScore: alert.riskScore,
          type: notificationType,
          title,
          message,
          read: false,
        },
      });
    }
  } catch (err) {
    console.error('Failed to send faculty notifications:', err);
  }
}

module.exports = {
  evaluateStudentAlert,
  notifyFacultyOfAlert,
};
