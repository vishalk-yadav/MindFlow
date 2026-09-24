const prisma = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Wellbeing Assistant Service for Engineering Students
 * Supports continuous multi-turn conversations powered by Gemini API
 */
async function generateAIResponse(userId, userMessage, conversationHistory = []) {
  // 1. Fetch user context from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      academicProfile: true,
      tasks: { where: { completed: false }, take: 10 },
      checkIns: { orderBy: { date: 'desc' }, take: 3 },
      burnoutScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      examPreps: true,
    },
  });

  const burnout = user?.burnoutScores?.[0] || { score: 48, riskLevel: 'MODERATE' };
  const latestCheckIn = user?.checkIns?.[0] || { mood: 'Good', stressLevel: 5, sleepHours: 6.5 };
  const pendingTasksList = user?.tasks?.map((t) => `${t.title} (${t.priority} priority, ${t.category})`).join(', ') || 'No urgent tasks';
  const branch = user?.academicProfile?.branch || 'Computer Science & Engineering';
  const subjects = user?.academicProfile?.currentSubjects?.join(', ') || 'DSA, DBMS, OS, Mathematics';

  const studentContext = `
STUDENT BACKGROUND CONTEXT:
- Student Name: ${user?.name || 'Student'}
- Engineering Branch: ${branch}
- Core Subjects: ${subjects}
- Current Burnout Risk: ${burnout.score}/100 (${burnout.riskLevel})
- Today's Check-in: Mood ${latestCheckIn.mood}, Stress ${latestCheckIn.stressLevel}/10, Sleep ${latestCheckIn.sleepHours} hrs
- Current Pending Tasks: ${pendingTasksList}
`;

  const systemInstruction = `You are MindFlow's AI Wellbeing and Academic Assistant for engineering students.
You are having an ongoing, natural conversation with this student.

${studentContext}

CRITICAL CONVERSATION RULES:
1. ANSWER THE USER'S ACTUAL MESSAGE: Focus directly on what the student is saying or asking in this specific turn.
2. DO NOT REPEAT GREETINGS OR STATS: If this is an ongoing chat or follow-up, do NOT re-introduce yourself, do NOT say "Hii Vipin, I'm glad you're starting the day...", and do NOT recite their entire profile (burnout score, sleep hours, subjects) unless it is directly relevant to what they just asked.
3. CONVERSATIONAL & NATURAL:
   - If the user says hello, asks how you are, makes a casual remark, or asks a simple question: Respond conversationally, concisely, and warmly in 1-2 short paragraphs. Do NOT provide a 4-step list.
   - ONLY provide numbered steps (1., 2., 3., etc.) if the student asks for a plan, steps to solve a problem, advice on how to do something, or study/revision strategy.
4. PRACTICAL & ACTIONABLE: When advising on engineering challenges (coding, debugging, exam prep, stress), provide realistic, bite-sized strategies.
5. ETHICAL & NON-CLINICAL: Never give medical or psychiatric diagnoses. Focus on workload distribution, healthy rest, and academic encouragement.`;

  const apiKey = (process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

  // 2. Try Gemini if API key exists
  if (apiKey) {
    const candidateModels = [
      process.env.AI_MODEL || 'gemini-3.6-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];
    const uniqueModels = [...new Set(candidateModels)];
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of uniqueModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        let replyText = null;

        // If we have sanitized conversation history, use multi-turn chat
        if (conversationHistory && conversationHistory.length > 0) {
          const chat = model.startChat({
            history: conversationHistory,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
            },
          });
          const result = await chat.sendMessage(userMessage);
          replyText = result?.response?.text?.();
        } else {
          const result = await model.generateContent(userMessage);
          replyText = result?.response?.text?.();
        }

        if (replyText) {
          const structuredPlan = extractStructuredPlan(replyText, burnout, userMessage);
          return {
            reply: replyText,
            structuredData: structuredPlan,
            burnoutContext: {
              score: burnout.score,
              riskLevel: burnout.riskLevel.toLowerCase(),
            },
          };
        }
      } catch (err) {
        const isTransient = err.message && (err.message.includes('503') || err.message.includes('high demand') || err.message.includes('429'));
        if (isTransient) {
          console.warn(`[Gemini API] Model ${modelName} temporarily busy (503/high demand), seamlessly switching to next model...`);
        } else {
          console.warn(`[Gemini API] Model ${modelName} fallback triggered: ${err.message}`);
        }
      }
    }
  }

  // 3. Fallback to local intelligent response if API key is absent or offline
  return generateFallbackResponse(userMessage, user, burnout, latestCheckIn, conversationHistory);
}

/**
 * Intelligent Deterministic Engineering Student Fallback Engine
 */
function generateFallbackResponse(message, user, burnout, checkIn, conversationHistory = []) {
  const lower = message.toLowerCase();
  const isFollowUp = conversationHistory && conversationHistory.length > 0;

  // 1. Casual / Greetings / Acknowledgements
  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.includes('how are you') || lower.includes('whats up') || lower.includes("what's up")) {
    if (isFollowUp) {
      return {
        reply: `Hey ${user?.name || 'there'}! What would you like to focus on right now? We can review your tasks, build a study plan, or take a quick break.`,
        structuredData: null,
        burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
      };
    }
    return {
      reply: `Hi ${user?.name || 'Vipin'}! How's your day going? Whether you need help organizing your tasks or resetting after a long study block, I'm here to help.`,
      structuredData: null,
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  if (lower.includes('thank') || lower === 'ok' || lower === 'okay' || lower === 'got it' || lower === 'sure') {
    return {
      reply: "You're very welcome! Keep up the great work, and remember to take short breaks so your focus stays sharp. Let me know whenever you need anything else!",
      structuredData: null,
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  // 2. Overwhelmed / multiple assignments / study plan query
  if (lower.includes('assignment') || lower.includes('overwhelm') || lower.includes('plan') || lower.includes('schedule')) {
    return {
      reply: "I understand — balancing engineering deadlines can feel intense. Let's break this down into realistic blocks so you make steady progress without burning out. 💙",
      structuredData: {
        title: "Suggested Study Plan:",
        steps: [
          "Rank assignments by due date and credit weight",
          "Work in 45-minute focused blocks with 10-minute mindful breaks",
          "Tackle the highest cognitive task early when your mind is fresh",
          "Aim for at least 7 hours of sleep tonight to consolidate memory",
        ],
        burnoutNotice: `Your current burnout risk is ${burnout.riskLevel.toLowerCase()} (${burnout.score}/100). Pacing yourself prevents mental exhaustion.`,
        actions: [
          { label: "Create Study Plan", action: "CREATE_PLAN", variant: "primary" },
          { label: "Take 5-min Break", action: "START_BREAK", variant: "secondary" },
        ],
      },
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  // 3. High burnout risk explanation
  if (lower.includes('burnout') || lower.includes('score') || lower.includes('why')) {
    return {
      reply: `Your burnout-risk indicator is currently at **${burnout.score}/100 (${burnout.riskLevel})**. This reflects your current pending workload (${user?.tasks?.length || 4} tasks), recent sleep average of ${checkIn.sleepHours || 6.2} hours, and reported stress level of ${checkIn.stressLevel || 5}/10.\n\nProtecting 7+ hours of sleep and stepping away from your screen for 5 minutes every hour can noticeably lower your fatigue within 48 hours.`,
      structuredData: {
        title: "Burnout Recovery Recommendations:",
        steps: [
          "Defer non-urgent tasks to next week",
          "Take a 5-minute screen-free eye rest",
          "Aim for 7.5 hours of sleep tonight",
          "Complete one quick win task to rebuild momentum",
        ],
        burnoutNotice: `Calculated from your recent check-in and task completion data.`,
        actions: [
          { label: "Open Breathing Exercise", action: "OPEN_BREATHING", variant: "primary" },
        ],
      },
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  // 4. Coding fatigue / long coding session
  if (lower.includes('coding') || lower.includes('dsa') || lower.includes('hours') || lower.includes('leetcode') || lower.includes('debug')) {
    return {
      reply: "Coding requires intense working memory. Long continuous debugging sessions lead to mental fatigue and diminishing returns.\n\nTry stepping away for 10 minutes — often the algorithmic insight strikes once your brain enters default-mode network rest!",
      structuredData: {
        title: "Engineering Focus Recommendation:",
        steps: [
          "Save your progress and step away from the IDE",
          "Hydrate and stretch your neck and shoulders",
          "Take a 10-minute walk or try a quick focus game",
          "Resume with a 25-minute Pomodoro block",
        ],
        actions: [
          { label: "Start 5-min Break", action: "START_BREAK", variant: "primary" },
          { label: "Play Reset Game", action: "PLAY_GAME", variant: "secondary" },
        ],
      },
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  // 5. Stress reduction / Calming down mood / Breathing
  if (lower.includes('stress') || lower.includes('breath') || lower.includes('relax') || lower.includes('anxious') || lower.includes('calm') || lower.includes('mood') || lower.includes('tired') || lower.includes('frustrated') || lower.includes('down')) {
    return {
      reply: `I hear you, ${user?.name || 'Vipin'}. Engineering coursework can feel heavy, but you don't have to carry all the pressure at once. Let's take a quick moment to reset your nervous system.`,
      structuredData: {
        title: "Quick 2-Minute Reset:",
        steps: [
          "Close your eyes and release the tension in your jaw and shoulders",
          "Inhale deeply through your nose for 4 seconds",
          "Hold your breath gently for 4 seconds",
          "Exhale slowly through your mouth for 6 seconds",
          "Drink a glass of water and look away from all screens",
        ],
        actions: [
          { label: "Start Guided Breathing", action: "OPEN_BREATHING", variant: "primary" },
          { label: "Take 5-min Break", action: "START_BREAK", variant: "secondary" },
        ],
      },
      burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
    };
  }

  // 6. Generic thoughtful answer
  return {
    reply: `I'm here to support you, ${user?.name || 'Vipin'}. Let me know if you want to organize your tasks, review any concept, or take a quick mental break.`,
    structuredData: null,
    burnoutContext: { score: burnout.score, riskLevel: burnout.riskLevel.toLowerCase() },
  };
}

/**
 * Extract structured steps into UI cards ONLY if the response warrants it
 */
function extractStructuredPlan(text, burnout, userMessage = '') {
  const lower = (userMessage + ' ' + text).toLowerCase();

  // Only attach action cards if the query or reply is about planning, steps, stress, or advice
  const isPlanQuery = lower.includes('plan') || lower.includes('schedule') || lower.includes('step') ||
                     lower.includes('how to') || lower.includes('how do i') || lower.includes('calm') ||
                     lower.includes('stress') || lower.includes('breath') || lower.includes('burnout') ||
                     lower.includes('study') || lower.includes('advice');

  if (!isPlanQuery) {
    return null;
  }

  const lines = text.split('\n');
  const steps = [];

  for (const line of lines) {
    const match = line.match(/^\d+[\.\)]\s+(.*)/);
    if (match) {
      const stepText = match[1].replace(/\*\*/g, '').trim();
      if (stepText) steps.push(stepText);
    }
  }

  if (steps.length >= 2) {
    const actions = [];

    if (lower.includes('plan') || lower.includes('schedule') || lower.includes('assignment')) {
      actions.push({ label: "Create Study Plan", action: "CREATE_PLAN", variant: "primary" });
    }

    if (lower.includes('calm') || lower.includes('stress') || lower.includes('breath') || lower.includes('mood') || lower.includes('relax')) {
      actions.push({ label: "Start Breathing Exercise", action: "OPEN_BREATHING", variant: "primary" });
      actions.push({ label: "Take 5-min Break", action: "START_BREAK", variant: "secondary" });
    } else {
      actions.push({ label: "Start Focus Session", action: "START_BREAK", variant: "secondary" });
    }

    return {
      title: "Recommended Action Plan:",
      steps: steps.slice(0, 5),
      burnoutNotice: `Current Burnout Risk: ${burnout.score}/100 (${burnout.riskLevel}).`,
      actions: actions.slice(0, 2),
    };
  }

  return null;
}

module.exports = { generateAIResponse };