import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', new mongoose.Schema({
  agentId: String,
  userId: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));

const MessageModel = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({
  conversationId: String,
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
}));

export async function POST(req: Request) {
  try {
    const { conversationId, userEmail, agentId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    await dbConnect();
    
    // 1. Update Conversation Status
    await ConversationModel.findByIdAndUpdate(conversationId, { 
      status: 'escalated',
      updatedAt: new Date()
    });

    // 2. Fetch Chat History
    const history = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean();
    
    const formattedHistory = history.map(msg => `**${msg.role.toUpperCase()}:** ${msg.content}`).join('\\n\\n');

    // 3. Send Email via Resend
    // In production, the "to" address would be dynamic based on the Agent's settings
    const supportEmail = 'support@assistcone.com'; 

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Assistcone Escalatons <escalations@assistcone.com>',
        to: [supportEmail],
        subject: `[ESCALATION] Action Required: New Support Ticket (${conversationId.substring(0, 8)})`,
        text: `A user has requested human assistance. \\n\\nUser Email provided: ${userEmail || 'Not provided'}\\nAgent ID: ${agentId}\\nConversation Link: https://assistcone.com/conversations/${conversationId}\\n\\n--- Chat History ---\\n\\n${formattedHistory}`,
      });
    } else {
      console.log('Mocking email send since RESEND_API_KEY is not configured', formattedHistory);
    }

    // 4. Record the escalation system message in the chat
    await MessageModel.create({
      conversationId,
      role: 'system',
      content: 'Conversation has been escalated to human support.',
    });

    return NextResponse.json({ success: true, message: 'Support team notified' });

  } catch (error: any) {
    console.error('Escalation API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
