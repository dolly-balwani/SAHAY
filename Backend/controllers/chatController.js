import Chat from "../models/ChatModel.js";
import axios from "axios";
import mongoose from "mongoose";

const STACK_API_URL = "https://api.stack-ai.com/inference/v0/run/451d41e9-d95f-4ebb-8371-6d10b86fab68/68d0ff331b22506911cab3a3";
const STACK_API_KEY = "b612108c-000a-4dc3-b5e0-67aac28479ce"; 

// Handle chat messages
const chatting = async (req, res) => {
  const { userId, sessionId, userMessage } = req.body;
  
  if (!userId || !userMessage || !sessionId) {
    return res.status(400).json({ error: "userId, sessionId and userMessage are required" });
  }

  try {
    // 1️⃣ Send message to StackAI API
    const stackResponse = await axios.post(
      STACK_API_URL,
      { "in-0": userMessage },
      {
        headers: {
          Authorization: `Bearer ${STACK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let botReply = stackResponse.data?.outputs?.["out-0"] || "No reply";
    // Replace ManasVeda with SahayBot in the bot's response
    botReply = botReply.replace(/ManasVeda/gi, 'SahayBot');

    // 2️⃣ Save to MongoDB under the session
    const chat = await Chat.findOne({ userId });

    const messagePair = [
      { role: "user", content: userMessage },
      { role: "bot", content: botReply }
    ];

    if (chat) {
      // Check if session exists
      const session = chat.sessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.messages.push(...messagePair);
      } else {
        // Create new session
        chat.sessions.push({
          sessionId,
          startedAt: new Date(),
          messages: messagePair
        });
      }
      await chat.save();
    } else {
      // Create new user with session
      await Chat.create({
        userId,
        sessions: [
          {
            sessionId,
            startedAt: new Date(),
            messages: messagePair
          }
        ]
      });
    }

    // 3️⃣ Return bot response
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Error chatting:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Chat failed" });
  }
};

// Start a new chat session
const startSession = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const sessionId = new mongoose.Types.ObjectId(); // Generate unique session ID
    
    // Update or create user with new session
    await Chat.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          sessions: { 
            sessionId, 
            startedAt: new Date(), 
            messages: [] 
          } 
        } 
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      sessionId: sessionId.toString(),
      message: 'Session started' 
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
};

// End a chat session
const endSession = async (req, res) => {
  const { userId, sessionId } = req.body;

  if (!userId || !sessionId) {
    return res.status(400).json({ error: "userId and sessionId are required" });
  }

  try {
    const result = await Chat.updateOne(
      { userId, "sessions.sessionId": sessionId },
      { $set: { "sessions.$.endedAt": new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({ 
      success: true, 
      message: 'Session ended' 
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
};

// Helper function to add message to session
const addMessageToSession = async (userId, sessionId, role, content) => {
  return Chat.updateOne(
    { userId, "sessions.sessionId": sessionId },
    { $push: { "sessions.$.messages": { role, content } } }
  );
};

export { 
  chatting, 
  startSession, 
  endSession,
  addMessageToSession 
};
