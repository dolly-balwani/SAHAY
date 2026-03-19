import express from 'express';
import Session from '../models/Session.js';
import { analyzeTone, detectDistressLevel, generateResponse } from '../services/sahaayService.js';

const router = express.Router();

// Start a new session
router.post('/start_session', async (req, res) => {
  try {
    const { userId, initialDistressScore, metadata = {} } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const session = new Session({
      userId,
      initialDistressScore,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        ...metadata
      }
    });

    await session.save();

    // Generate welcome message
    const welcomeMessage = {
      text: "Namaste! I'm Sahaay, your emotional wellbeing companion. I'm here to listen and support you. How are you feeling today?",
      sender: 'sahaay',
      timestamp: new Date(),
      interventionType: 'general',
      emotionalTone: {
        primaryEmotion: 'neutral',
        score: 5
      },
      distressScore: 1
    };

    session.messages.push(welcomeMessage);
    await session.save();

    res.status(201).json({
      sessionId: session._id,
      message: welcomeMessage
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Handle chat messages
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;

    if (!sessionId || !userId || !message?.trim()) {
      return res.status(400).json({ error: 'Session ID, user ID, and message are required' });
    }

    // Find session by either _id or sessionId field
    const session = await Session.findOne({
      $or: [
        { _id: sessionId },
        { sessionId: sessionId }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Analyze the user's message
    const toneAnalysis = await analyzeTone(message);
    const distressLevel = detectDistressLevel(message, toneAnalysis);

    // Save user message
    const userMessage = {
      text: message,
      sender: 'user',
      timestamp: new Date(),
      emotionalTone: {
        score: toneAnalysis.score,
        primaryEmotion: toneAnalysis.primaryEmotion,
        secondaryEmotion: toneAnalysis.secondaryEmotion
      },
      distressScore: distressLevel
    };

    session.messages.push(userMessage);

    // Generate response based on the message and distress level
    const botResponse = await generateResponse(message, distressLevel, session.messages);

    // Save bot response
    const botMessage = {
      text: botResponse.text,
      sender: 'sahaay',
      timestamp: new Date(),
      interventionType: botResponse.interventionType,
      emotionalTone: {
        score: 5, // Neutral bot tone
        primaryEmotion: 'neutral'
      },
      distressScore: distressLevel
    };

    session.messages.push(botMessage);

    // Check for crisis situation
    if (distressLevel >= 4) {
      session.crisisFlag = true;
      session.crisisIntervention = {
        triggered: true,
        timestamp: new Date(),
        actionTaken: 'Provided crisis resources and emergency contacts'
      };
    }

    await session.save();

    res.json({
      response: botMessage,
      distressLevel,
      crisisIntervention: session.crisisFlag ? session.crisisIntervention : null
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// End a session
router.post('/end_session', async (req, res) => {
  try {
    const { sessionId, userId, finalDistressScore } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'Session ID and user ID are required' });
    }

    // Find session by either _id or sessionId field
    const session = await Session.findOne({
      $or: [
        { _id: sessionId },
        { sessionId: sessionId }
      ]
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    session.endTime = new Date();
    if (finalDistressScore) {
      session.finalDistressScore = finalDistressScore;
    }

    await session.save();

    res.json({
      message: 'Session ended successfully',
      sessionId: session._id,
      duration: session.duration,
      messageCount: session.messages.length
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

export default router;
