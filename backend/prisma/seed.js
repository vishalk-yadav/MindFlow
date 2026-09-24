const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MindFlow engineering student & faculty portal database...');

  // 1. Clean existing records in correct dependency order
  await prisma.auditLog.deleteMany();
  await prisma.interventionNote.deleteMany();
  await prisma.burnoutAlert.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.plannerSession.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.nudge.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.burnoutScore.deleteMany();
  await prisma.dailyCheckIn.deleteMany();
  await prisma.examPreparation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.academicProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.privacySetting.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 2. Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'National Institute of Technology',
      code: 'NIT-MFLOW',
      burnoutThreshold: 70,
      highThreshold: 60,
      criticalThreshold: 80,
      alertCooldownDays: 3,
    },
  });
  console.log(`Created Institution: ${institution.name} (${institution.code})`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Ramesh Verma',
      email: 'admin@mindflow.edu',
      passwordHash,
      role: 'ADMIN',
      department: 'Dean of Student Affairs',
      institutionId: institution.id,
      profile: {
        create: {
          college: institution.name,
          targetSleepHours: 7.5,
          dailyStudyHours: 4.0,
          priorities: ['Institution wellbeing', 'Student mentorship', 'Academic policy'],
        },
      },
    },
  });
  console.log(`Created Admin: ${admin.name} (${admin.email})`);

  // 4. Create 3 Faculty Members
  const facultyMembers = [
    {
      name: 'Prof. Rajesh Sharma',
      email: 'prof.sharma@mindflow.edu',
      department: 'Computer Science & Engineering',
    },
    {
      name: 'Dr. Priya Patel',
      email: 'dr.patel@mindflow.edu',
      department: 'Information Technology',
    },
    {
      name: 'Prof. Alok Gupta',
      email: 'prof.gupta@mindflow.edu',
      department: 'Electronics & Communication',
    },
  ];

  const facultyUsers = [];
  for (const f of facultyMembers) {
    const fac = await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        passwordHash,
        role: 'FACULTY',
        department: f.department,
        institutionId: institution.id,
        profile: {
          create: {
            college: institution.name,
            targetSleepHours: 7.0,
            dailyStudyHours: 5.0,
            priorities: ['Course delivery', 'Student counseling', 'Lab mentorship'],
          },
        },
      },
    });
    facultyUsers.push(fac);
    console.log(`Created Faculty: ${fac.name} (${fac.email}) - ${fac.department}`);
  }

  // 5. Create 20 Synthetic Students
  const studentsConfig = [
    // 4 Critical Risk Students (score >= 80)
    {
      name: 'Rohan Das',
      email: 'rohan.das@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '3rd Year',
      semester: 6,
      score: 91,
      riskLevel: 'CRITICAL',
      alertStatus: 'UNREVIEWED',
      avgStudyHours: 9.8,
      avgSleepHours: 4.2,
      stressLevel: 9,
      energyLevel: 3,
      mood: 'EXHAUSTED',
      mainWorkload: 'EXAM_PREP',
      missedBreaks: 0,
      activeTasks: 7,
      overdueTasks: 3,
      notes: null,
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '4th Year',
      semester: 8,
      score: 88,
      riskLevel: 'CRITICAL',
      alertStatus: 'IN_PROGRESS',
      avgStudyHours: 10.2,
      avgSleepHours: 4.5,
      stressLevel: 8,
      energyLevel: 3,
      mood: 'OVERWHELMED',
      mainWorkload: 'PROJECT',
      missedBreaks: 1,
      activeTasks: 6,
      overdueTasks: 2,
      notes: [
        { authorIndex: 0, text: 'Called student for counseling. She has 3 capstone submissions due this Friday.', followUpDate: new Date(Date.now() + 48 * 3600 * 1000) },
      ],
    },
    {
      name: 'Sameer Khan',
      email: 'sameer.khan@mindflow.edu',
      department: 'Information Technology',
      section: 'A',
      year: '2nd Year',
      semester: 4,
      score: 86,
      riskLevel: 'CRITICAL',
      alertStatus: 'UNREVIEWED',
      avgStudyHours: 9.0,
      avgSleepHours: 4.8,
      stressLevel: 8,
      energyLevel: 4,
      mood: 'STRESSED',
      mainWorkload: 'ASSIGNMENT',
      missedBreaks: 0,
      activeTasks: 5,
      overdueTasks: 2,
      notes: null,
    },
    {
      name: 'Tanvi Deshmukh',
      email: 'tanvi.deshmukh@mindflow.edu',
      department: 'Electronics & Communication',
      section: 'C',
      year: '3rd Year',
      semester: 5,
      score: 82,
      riskLevel: 'CRITICAL',
      alertStatus: 'REVIEWED',
      avgStudyHours: 8.8,
      avgSleepHours: 5.0,
      stressLevel: 8,
      energyLevel: 4,
      mood: 'EXHAUSTED',
      mainWorkload: 'LAB',
      missedBreaks: 1,
      activeTasks: 5,
      overdueTasks: 1,
      notes: [
        { authorIndex: 2, text: 'Discussed extending lab report deadline by 3 days with lab incharge.', followUpDate: new Date(Date.now() + 72 * 3600 * 1000) },
      ],
    },

    // 5 High Risk Students (score 60 - 79)
    {
      name: 'Aditya Mehta',
      email: 'aditya.mehta@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '3rd Year',
      semester: 5,
      score: 78,
      riskLevel: 'HIGH',
      alertStatus: 'IN_PROGRESS',
      avgStudyHours: 8.5,
      avgSleepHours: 5.2,
      stressLevel: 7,
      energyLevel: 4,
      mood: 'STRESSED',
      mainWorkload: 'PLACEMENT_PREP',
      missedBreaks: 1,
      activeTasks: 5,
      overdueTasks: 1,
      notes: [
        { authorIndex: 0, text: 'Student preparing for upcoming mock interviews and DSA contests. Suggested daily 30-min break.', followUpDate: null },
      ],
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '2nd Year',
      semester: 3,
      score: 75,
      riskLevel: 'HIGH',
      alertStatus: 'UNREVIEWED',
      avgStudyHours: 8.0,
      avgSleepHours: 5.5,
      stressLevel: 7,
      energyLevel: 5,
      mood: 'OVERWHELMED',
      mainWorkload: 'DSA',
      missedBreaks: 1,
      activeTasks: 4,
      overdueTasks: 1,
      notes: null,
    },
    {
      name: 'Karan Malhotra',
      email: 'karan.malhotra@mindflow.edu',
      department: 'Information Technology',
      section: 'B',
      year: '3rd Year',
      semester: 6,
      score: 72,
      riskLevel: 'HIGH',
      alertStatus: 'REVIEWED',
      avgStudyHours: 7.8,
      avgSleepHours: 5.6,
      stressLevel: 7,
      energyLevel: 5,
      mood: 'STRESSED',
      mainWorkload: 'PROJECT',
      missedBreaks: 2,
      activeTasks: 4,
      overdueTasks: 0,
      notes: [
        { authorIndex: 1, text: 'Sent reminder to prioritize sleep and use Pomodoro focus timer.', followUpDate: null },
      ],
    },
    {
      name: 'Meera Joshi',
      email: 'meera.joshi@mindflow.edu',
      department: 'Electronics & Communication',
      section: 'A',
      year: '4th Year',
      semester: 7,
      score: 68,
      riskLevel: 'HIGH',
      alertStatus: 'RESOLVED',
      avgStudyHours: 7.5,
      avgSleepHours: 5.8,
      stressLevel: 6,
      energyLevel: 5,
      mood: 'OKAY',
      mainWorkload: 'ACADEMIC',
      missedBreaks: 2,
      activeTasks: 3,
      overdueTasks: 0,
      notes: [
        { authorIndex: 2, text: 'Reviewed past workload. Midterm exams completed and stress levels stabilizing.', followUpDate: null },
      ],
    },
    {
      name: 'Vikram Nair',
      email: 'vikram.nair@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'C',
      year: '1st Year',
      semester: 2,
      score: 64,
      riskLevel: 'HIGH',
      alertStatus: 'UNREVIEWED',
      avgStudyHours: 7.2,
      avgSleepHours: 5.8,
      stressLevel: 6,
      energyLevel: 5,
      mood: 'STRESSED',
      mainWorkload: 'ASSIGNMENT',
      missedBreaks: 1,
      activeTasks: 4,
      overdueTasks: 1,
      notes: null,
    },

    // 6 Moderate Risk Students (score 40 - 59)
    {
      name: 'Vipin', // Demo student Vipin
      email: 'vipin@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '2nd Year',
      semester: 4,
      score: 48,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 6.5,
      avgSleepHours: 6.2,
      stressLevel: 5,
      energyLevel: 6,
      mood: 'GOOD',
      mainWorkload: 'DSA',
      missedBreaks: 2,
      activeTasks: 5,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '3rd Year',
      semester: 5,
      score: 58,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 6.8,
      avgSleepHours: 6.0,
      stressLevel: 5,
      energyLevel: 6,
      mood: 'OKAY',
      mainWorkload: 'PROJECT',
      missedBreaks: 2,
      activeTasks: 4,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Pooja Nair',
      email: 'pooja.nair@mindflow.edu',
      department: 'Information Technology',
      section: 'A',
      year: '2nd Year',
      semester: 3,
      score: 55,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 6.5,
      avgSleepHours: 6.2,
      stressLevel: 5,
      energyLevel: 6,
      mood: 'GOOD',
      mainWorkload: 'DSA',
      missedBreaks: 2,
      activeTasks: 3,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Aman Gupta',
      email: 'aman.gupta@mindflow.edu',
      department: 'Electronics & Communication',
      section: 'B',
      year: '4th Year',
      semester: 8,
      score: 51,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 6.2,
      avgSleepHours: 6.4,
      stressLevel: 4,
      energyLevel: 7,
      mood: 'GOOD',
      mainWorkload: 'PROJECT',
      missedBreaks: 3,
      activeTasks: 3,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Riya Sen',
      email: 'riya.sen@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'A',
      year: '1st Year',
      semester: 1,
      score: 45,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 6.0,
      avgSleepHours: 6.6,
      stressLevel: 4,
      energyLevel: 7,
      mood: 'GREAT',
      mainWorkload: 'ACADEMIC',
      missedBreaks: 3,
      activeTasks: 2,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Siddharth Rao',
      email: 'siddharth.rao@mindflow.edu',
      department: 'Information Technology',
      section: 'C',
      year: '3rd Year',
      semester: 6,
      score: 42,
      riskLevel: 'MODERATE',
      alertStatus: null,
      avgStudyHours: 5.8,
      avgSleepHours: 6.8,
      stressLevel: 4,
      energyLevel: 7,
      mood: 'GOOD',
      mainWorkload: 'LAB',
      missedBreaks: 3,
      activeTasks: 2,
      overdueTasks: 0,
      notes: null,
    },

    // 5 Low Risk Students (score < 40)
    {
      name: 'Divya Chauhan',
      email: 'divya.chauhan@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'B',
      year: '2nd Year',
      semester: 4,
      score: 35,
      riskLevel: 'LOW',
      alertStatus: null,
      avgStudyHours: 5.5,
      avgSleepHours: 7.2,
      stressLevel: 3,
      energyLevel: 8,
      mood: 'GREAT',
      mainWorkload: 'DSA',
      missedBreaks: 4,
      activeTasks: 2,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Aryan Kapoor',
      email: 'aryan.kapoor@mindflow.edu',
      department: 'Electronics & Communication',
      section: 'A',
      year: '3rd Year',
      semester: 5,
      score: 31,
      riskLevel: 'LOW',
      alertStatus: null,
      avgStudyHours: 5.2,
      avgSleepHours: 7.5,
      stressLevel: 3,
      energyLevel: 8,
      mood: 'GREAT',
      mainWorkload: 'ACADEMIC',
      missedBreaks: 4,
      activeTasks: 2,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Neha Saxena',
      email: 'neha.saxena@mindflow.edu',
      department: 'Computer Science & Engineering',
      section: 'C',
      year: '4th Year',
      semester: 7,
      score: 27,
      riskLevel: 'LOW',
      alertStatus: null,
      avgStudyHours: 5.0,
      avgSleepHours: 7.6,
      stressLevel: 2,
      energyLevel: 9,
      mood: 'EXCELLENT',
      mainWorkload: 'PROJECT',
      missedBreaks: 4,
      activeTasks: 1,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Kabir Joshi',
      email: 'kabir.joshi@mindflow.edu',
      department: 'Information Technology',
      section: 'B',
      year: '1st Year',
      semester: 2,
      score: 22,
      riskLevel: 'LOW',
      alertStatus: null,
      avgStudyHours: 4.8,
      avgSleepHours: 7.8,
      stressLevel: 2,
      energyLevel: 9,
      mood: 'EXCELLENT',
      mainWorkload: 'ACADEMIC',
      missedBreaks: 5,
      activeTasks: 1,
      overdueTasks: 0,
      notes: null,
    },
    {
      name: 'Shreya Roy',
      email: 'shreya.roy@mindflow.edu',
      department: 'Electronics & Communication',
      section: 'B',
      year: '2nd Year',
      semester: 3,
      score: 18,
      riskLevel: 'LOW',
      alertStatus: null,
      avgStudyHours: 4.5,
      avgSleepHours: 8.0,
      stressLevel: 1,
      energyLevel: 9,
      mood: 'EXCELLENT',
      mainWorkload: 'PERSONAL',
      missedBreaks: 5,
      activeTasks: 1,
      overdueTasks: 0,
      notes: null,
    },
  ];

  for (const s of studentsConfig) {
    const studentUser = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash,
        role: 'STUDENT',
        department: s.department,
        section: s.section,
        institutionId: institution.id,
        anonymousMode: false,
        profile: {
          create: {
            college: institution.name,
            targetSleepHours: 7.5,
            dailyStudyHours: 6.0,
            priorities: ['Academics', 'DSA', 'Projects'],
          },
        },
        academicProfile: {
          create: {
            branch: s.department,
            year: s.year,
            semester: s.semester,
            currentSubjects: [
              'Data Structures & Algorithms',
              'Database Management Systems',
              'Computer Networks',
              'Operating Systems',
            ],
            academicWorkload: s.score >= 80 ? 'CRITICAL' : s.score >= 60 ? 'HIGH' : 'MODERATE',
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
    });

    // Populate past 14 days check-ins with trend
    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);

      // Fluctuate around their average
      const studyHrs = Math.max(2, (s.avgStudyHours + (Math.sin(dayOffset) * 1.2)).toFixed(1));
      const sleepHrs = Math.max(3, (s.avgSleepHours - (Math.cos(dayOffset) * 0.8)).toFixed(1));
      const stress = Math.min(10, Math.max(1, Math.round(s.stressLevel + (Math.sin(dayOffset) * 1.5))));
      const energy = Math.min(10, Math.max(1, Math.round(s.energyLevel - (Math.sin(dayOffset) * 1.2))));

      await prisma.dailyCheckIn.create({
        data: {
          userId: studentUser.id,
          date: d,
          studyHours: parseFloat(studyHrs),
          sleepHours: parseFloat(sleepHrs),
          breaksCount: s.missedBreaks,
          stressLevel: stress,
          energyLevel: energy,
          mood: s.mood,
          mainWorkload: s.mainWorkload,
        },
      });
    }

    // Historical Burnout Scores for trend chart
    for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 2) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dayScore = Math.min(100, Math.max(10, Math.round(s.score + (Math.sin(dayOffset) * 6))));

      await prisma.burnoutScore.create({
        data: {
          userId: studentUser.id,
          score: dayOffset === 0 ? s.score : dayScore,
          riskLevel: s.riskLevel,
          workloadFactor: Math.round(s.score * 0.35),
          sleepFactor: Math.round(s.score * 0.28),
          stressFactor: Math.round(s.score * 0.22),
          breaksFactor: Math.round(s.score * 0.15),
          explanation: s.score >= 80
            ? 'Critical burnout detected. Extremely high study load and severe sleep deprivation.'
            : s.score >= 60
            ? 'High risk of academic fatigue. Study habits suggest upcoming burnout.'
            : s.score >= 40
            ? 'Moderate risk. Workload is balanced but monitoring recommended.'
            : 'Low risk. Healthy study and recovery habits maintained.',
          positiveFactors: s.score < 60
            ? ['Regular study intervals maintained', 'Sufficient sleep logged regularly']
            : ['Consistent platform engagement'],
          negativeFactors: s.score >= 60
            ? [
                `Average sleep (${s.avgSleepHours} hrs) is substantially below 7.5h target`,
                `High study intensity (${s.avgStudyHours} hrs/day) with inadequate breaks`,
                `${s.activeTasks} upcoming assignment deadlines within 5 days`,
              ]
            : ['Occasionally late study sessions'],
          calculatedAt: d,
        },
      });
    }

    // Populate Tasks
    for (let t = 0; t < s.activeTasks; t++) {
      const isOverdue = t < s.overdueTasks;
      await prisma.task.create({
        data: {
          userId: studentUser.id,
          title: `Assignment Module ${t + 1} - ${s.department.split(' ')[0]}`,
          category: t % 2 === 0 ? 'DSA' : 'PROJECT',
          priority: s.score >= 70 ? 'HIGH' : 'MEDIUM',
          completed: false,
          deadlineLabel: isOverdue ? 'Overdue • 1 day ago' : `Due in ${t + 1} days`,
          deadline: isOverdue
            ? new Date(Date.now() - 24 * 3600 * 1000)
            : new Date(Date.now() + (t + 1) * 24 * 3600 * 1000),
          estimatedMinutes: 90,
        },
      });
    }

    // Burnout Alert generation if High or Critical
    if (s.alertStatus) {
      const riskLevel = s.score >= 80 ? 'CRITICAL' : 'HIGH';
      const alert = await prisma.burnoutAlert.create({
        data: {
          studentId: studentUser.id,
          institutionId: institution.id,
          riskScore: s.score,
          riskLevel,
          threshold: 70,
          status: s.alertStatus,
          reason: s.score >= 80 ? 'Critical academic fatigue and acute sleep deficit.' : 'High risk pattern across assignments and study hours.',
          contributingFactors: [
            `Average sleep (${s.avgSleepHours}h) below recommended 7.5h`,
            `High study load (${s.avgStudyHours}h/day)`,
            `${s.overdueTasks > 0 ? `${s.overdueTasks} overdue assignments` : 'Tight upcoming deadlines'}`,
          ],
          reviewedById: s.alertStatus !== 'UNREVIEWED' ? facultyUsers[0].id : null,
          reviewedAt: s.alertStatus !== 'UNREVIEWED' ? new Date(Date.now() - 12 * 3600 * 1000) : null,
          resolvedAt: s.alertStatus === 'RESOLVED' ? new Date() : null,
        },
      });

      // Add intervention notes if present
      if (s.notes && s.notes.length > 0) {
        for (const n of s.notes) {
          const author = facultyUsers[n.authorIndex] || facultyUsers[0];
          await prisma.interventionNote.create({
            data: {
              alertId: alert.id,
              facultyId: author.id,
              note: n.text,
              actionType: 'NOTE',
            },
          });
        }
      }
    }
  }

  // 6. Give Vipin the detailed interactive data (habits, games, focus, AI conversation)
  const vipinUser = await prisma.user.findUnique({ where: { email: 'vipin@mindflow.edu' } });
  if (vipinUser) {
    // Habits
    const habitsData = [
      { name: 'Sleep (7h)', category: 'SLEEP' },
      { name: 'Exercise', category: 'PHYSICAL' },
      { name: 'Water (8 glasses)', category: 'HEALTH' },
      { name: 'Meditation', category: 'MINDFULNESS' },
      { name: 'Breaks', category: 'RECOVERY' },
      { name: 'No Screen (1h)', category: 'WELLBEING' },
    ];
    for (const h of habitsData) {
      const habit = await prisma.habit.create({
        data: { userId: vipinUser.id, name: h.name, category: h.category },
      });
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const d = new Date();
        d.setDate(d.getDate() - dayOffset);
        d.setHours(0, 0, 0, 0);
        await prisma.habitLog.create({
          data: {
            habitId: habit.id,
            date: d,
            completed: !(dayOffset === 2 || (h.name === 'Exercise' && dayOffset === 4)),
          },
        });
      }
    }

    // Exam Preparation
    await prisma.examPreparation.create({
      data: {
        userId: vipinUser.id,
        subject: 'DBMS Semester Exam',
        examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        difficulty: 'MEDIUM',
        topicsTotal: 5,
        topicsCompleted: 3,
        topicsList: [
          { name: 'ER Model & Relational Algebra', completed: true },
          { name: 'SQL & Complex Queries', completed: true },
          { name: 'Normalization (1NF to BCNF)', completed: true },
          { name: 'Transaction Management & ACID', completed: false },
          { name: 'Indexing & B+ Trees', completed: false },
        ],
      },
    });

    // AI Conversation
    const conversation = await prisma.aIConversation.create({
      data: {
        userId: vipinUser.id,
        title: 'Workload & Assignments Guidance',
      },
    });
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        content: "I have 6 assignments due this week. I'm feeling overwhelmed and don't know how to manage them.",
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    });
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'ASSISTANT',
        content: "I understand — that can feel really stressful. Let's break this down and create a plan together. 💙",
        structuredData: {
          title: "Here's a suggested plan:",
          steps: [
            'Prioritize your assignments (based on deadlines & difficulty)',
            'Spread them across the week with realistic time slots',
            'Keep 1–2 short breaks between study sessions',
            'Get at least 7 hours of sleep each night',
            'Try a short mindfulness exercise when you feel stressed',
          ],
          burnoutNotice: "You're currently at a moderate burnout risk (48/100). This plan will help you reduce your stress and get back on track.",
          actionPrompt: 'Would you like me to create a detailed study schedule for the next 5 days?',
          actions: [
            { label: 'Yes, create the plan', action: 'CREATE_PLAN', variant: 'primary' },
            { label: 'Not now', action: 'DISMISS', variant: 'secondary' },
          ],
        },
        createdAt: new Date(Date.now() - 4 * 60 * 1000),
      },
    });
  }

  // 7. Seed Notifications for Faculty
  for (const fac of facultyUsers) {
    await prisma.notification.createMany({
      data: [
        {
          userId: fac.id,
          title: '🚨 Critical Burnout Alert: Rohan Das',
          message: 'Rohan Das crossed the critical threshold with a score of 91/100. Severe sleep deprivation logged.',
          type: 'BURNOUT_ALERT',
          read: false,
        },
        {
          userId: fac.id,
          title: '⚠️ High Risk Alert: Aditya Mehta',
          message: 'Aditya Mehta has reached 78/100 burnout risk due to multiple consecutive 9-hour study sessions.',
          type: 'BURNOUT_ALERT',
          read: false,
        },
        {
          userId: fac.id,
          title: '📋 Weekly Wellbeing Summary',
          message: 'Department wellbeing report for Computer Science & Engineering is ready for review.',
          type: 'FACULTY_SUMMARY',
          read: true,
        },
      ],
    });
  }

  // 8. Seed Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'INITIALIZE_INSTITUTION',
        targetType: 'INSTITUTION',
        targetId: institution.id,
        metadata: { institutionName: institution.name, code: institution.code },
      },
      {
        userId: facultyUsers[0].id,
        action: 'REVIEW_ALERT',
        targetType: 'ALERT',
        targetId: 'alert-init-1',
        metadata: { student: 'Ananya Iyer', action: 'SCHEDULED_COUNSELING' },
      },
    ],
  });

  console.log('✅ MindFlow database seeded successfully with Admin, Faculty, and 20 Students!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
