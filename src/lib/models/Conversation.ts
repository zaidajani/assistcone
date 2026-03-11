import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
  visitorId: { type: String, required: true }, // Auto-generated UUID from widget
  status: { type: String, enum: ['active', 'closed', 'escalated'], default: 'active' },
  metadata: {
    browser: String,
    os: String,
    url: String,
    startedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
