import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema({
  url: { type: String, required: true },
  status: { type: String, enum: ['Syncing', 'Synced', 'Failed'], default: 'Syncing' },
  words: { type: String, default: '...' }
});

const AgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true }, // generated from frontend
  userId: { type: String, required: true }, // Clerk user ID
  model: { type: String, enum: ['mini', 'premium'], default: 'mini' },
  tone: { type: String, default: 'Friendly' },
  features: {
    imageSupport: { type: Boolean, default: true },
    sourceCitations: { type: Boolean, default: true },
    conversationMemory: { type: Boolean, default: true },
    humanEscalation: { type: Boolean, default: true }
  },
  escalationSettings: {
    toggleVisibility: { type: Boolean, default: true },
    supportEmail: { type: String, default: 'support@yourcompany.com' },
    buttonText: { type: String, default: 'Speak to an agent' }
  },
  widgetSettings: {
    agentName: { type: String, default: 'AI Support Assistant' },
    brandColor: { type: String, default: '#5b13ec' },
    greetingMessage: { type: String, default: "Hi! I'm your AI support assistant. Ask me anything." }
  },
  sources: [SourceSchema],
}, { timestamps: true });

export const Agent = mongoose.models.Agent || mongoose.model('Agent', AgentSchema);
