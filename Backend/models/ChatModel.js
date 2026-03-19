import mongoose from "mongoose";

// models/Chat.js


const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "bot"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  messages: [MessageSchema]
});

const ChatSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  sessions: [SessionSchema]
});

export default mongoose.model("Chat", ChatSchema);
