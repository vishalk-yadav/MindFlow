const prisma = require('../config/db');
const { generateAIResponse } = require('../services/aiService');

const chat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // Get or create conversation
    let conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: { userId, title: 'MindFlow Wellbeing Chat' },
      });
    }

    // Fetch previous messages in this conversation for context memory
    const recentMessages = await prisma.aIMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const conversationHistory = [];
    const ordered = recentMessages.reverse();
    for (const m of ordered) {
      const role = m.sender === 'USER' ? 'user' : 'model';
      // Gemini history must start with 'user'
      if (conversationHistory.length === 0 && role !== 'user') continue;
      // Merge consecutive same-role messages
      if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === role) {
        conversationHistory[conversationHistory.length - 1].parts[0].text += `\n${m.content}`;
      } else {
        conversationHistory.push({ role, parts: [{ text: m.content }] });
      }
    }

    // Record user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        content: message.trim(),
      },
    });

    // Generate response with full conversational memory
    const aiResult = await generateAIResponse(userId, message.trim(), conversationHistory);

    // Record assistant message
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        sender: 'ASSISTANT',
        content: aiResult.reply,
        structuredData: aiResult.structuredData || null,
      },
    });

    res.json({
      message: assistantMessage,
      burnoutContext: aiResult.burnoutContext,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat message.' });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });

    if (!conversation) {
      return res.json({ messages: [] });
    }

    res.json({ messages: conversation.messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI conversation history.' });
  }
};

const getStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const burnout = await prisma.burnoutScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
    const checkIn = await prisma.dailyCheckIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    res.json({
      burnoutRisk: {
        score: burnout ? burnout.score : 64,
        riskLevel: burnout ? (burnout.riskLevel === 'HIGH' ? 'High' : burnout.riskLevel === 'MODERATE' ? 'Moderate' : 'Low') : 'Moderate',
      },
      todayMood: checkIn ? checkIn.mood : 'Good',
      stressLevel: checkIn ? `${checkIn.stressLevel}/10` : '6/10',
      sleepLastNight: checkIn ? `${checkIn.sleepHours} hrs` : '6.2 hrs',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status.' });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversation = await prisma.aIConversation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (conversation) {
      await prisma.aIMessage.deleteMany({
        where: { conversationId: conversation.id },
      });
    }
    res.json({ success: true, message: 'Chat history cleared successfully.' });
  } catch (error) {
    console.error('Clear chat error:', error);
    res.status(500).json({ error: 'Failed to clear chat history.' });
  }
};

module.exports = { chat, getHistory, getStatus, clearHistory };
