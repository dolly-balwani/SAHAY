import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'sahaay'], required: true },
  timestamp: { type: Date, default: Date.now },
  emotionalTone: {
    score: { type: Number, min: 1, max: 10 },
    primaryEmotion: String,
    secondaryEmotion: String
  },
  distressScore: { type: Number, min: 1, max: 4 },
  interventionType: { type: String, enum: ['CBT', 'DBT', 'grounding', 'crisis', 'general'] }
});

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  messages: [messageSchema],
  initialDistressScore: { type: Number, min: 1, max: 10 },
  finalDistressScore: { type: Number, min: 1, max: 10 },
  crisisFlag: { type: Boolean, default: false },
  crisisIntervention: {
    triggered: Boolean,
    timestamp: Date,
    actionTaken: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String
  }
}, { timestamps: true });

// Add method to calculate session duration
sessionSchema.virtual('duration').get(function() {
  const end = this.endTime || new Date();
  return Math.round((end - this.startTime) / 1000); // in seconds
});

// Add method to get distress trend
sessionSchema.methods.getDistressTrend = function() {
  if (this.messages.length < 2) return 'stable';
  
  const firstHalf = this.messages
    .slice(0, Math.floor(this.messages.length / 2))
    .filter(m => m.distressScore)
    .reduce((sum, m) => sum + m.distressScore, 0);
    
  const secondHalf = this.messages
    .slice(Math.floor(this.messages.length / 2))
    .filter(m => m.distressScore)
    .reduce((sum, m) => sum + m.distressScore, 0);
    
  const avgFirst = firstHalf / (this.messages.length / 2);
  const avgSecond = secondHalf / (this.messages.length / 2);
  
  if (avgSecond < avgFirst - 0.5) return 'decreasing';
  if (avgSecond > avgFirst + 0.5) return 'increasing';
  return 'stable';
};

export default mongoose.model('Session', sessionSchema);
