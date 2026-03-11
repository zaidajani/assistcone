import mongoose from 'mongoose';

const CrawlPageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  status: { type: String, enum: ['Processing', 'Completed', 'Failed'], default: 'Processing' },
  error: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const CrawlStatusSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  startUrl: { type: String, required: true },
  totalFound: { type: Number, default: 0 },
  isFinished: { type: Boolean, default: false },
  pages: [CrawlPageSchema]
}, { timestamps: true });

export const CrawlStatus = mongoose.models.CrawlStatus || mongoose.model('CrawlStatus', CrawlStatusSchema);
