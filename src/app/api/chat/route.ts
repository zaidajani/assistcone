import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { qdrantClient, COLLECTION_NAME } from '@/lib/qdrant';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function logToFile(msg: string) {
  const logPath = path.join(process.cwd(), 'debug.log');
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
}

// Simple Mongoose models for tracking
// Normally these would be in their own files in /models
const MessageSchema = new mongoose.Schema({
  conversationId: String,
  role: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});
const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const ConversationSchema = new mongoose.Schema({
  agentId: String,
  userId: String, // visitor ID
  status: { type: String, default: 'active' }, // active, escalated, resolved
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, agentId, conversationId, visitorId = 'anonymous' } = body;
    logToFile(`Request: ${JSON.stringify({ agentId, message, conversationId })}`);
    logToFile(`QDRANT_URL: ${process.env.QDRANT_URL}`);

    if (!message || !agentId) {
      return NextResponse.json({ error: 'Missing message or agentId' }, { status: 400 });
    }

    await dbConnect();
    
    // Manage Conversation state
    let convoId = conversationId;
    if (!convoId) {
       const newConvo = await ConversationModel.create({ agentId, userId: visitorId });
       convoId = newConvo._id.toString();
    } else {
       try {
         await ConversationModel.findByIdAndUpdate(convoId, { updatedAt: new Date() });
       } catch (err) {
         const newConvo = await ConversationModel.create({ agentId, userId: visitorId });
         convoId = newConvo._id.toString();
       }
    }

    // Save User Message
    await MessageModel.create({
      conversationId: convoId,
      role: 'user',
      content: message,
    });

    // RAG Pipeline
    // 1. Embed user query
    let queryVector;
    try {
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: message,
        encoding_format: "float",
      });
      queryVector = embeddingRes.data[0].embedding;
    } catch (err: any) {
      console.error('[CHAT API] OpenAI Embedding Error:', err);
      throw new Error(`OpenAI Embedding fetch failed: ${err.message}`);
    }

    // 2. Retrieve relevant context from Qdrant
    let contextText = '';
    let qdrantRes = [];
    try {
      qdrantRes = await qdrantClient.search(COLLECTION_NAME, {
        vector: queryVector,
        filter: {
          must: [{ key: 'agentId', match: { value: agentId } }]
        },
        limit: 3,
        with_payload: true,
      });
      if (qdrantRes && qdrantRes.length > 0) {
        contextText = qdrantRes.map((hit: any) => hit.payload.text).join('\n\n');
      }
    } catch (err: any) {
      console.error('[CHAT API] Qdrant Search Error:', err);
      // Don't throw here, just proceed without context if it's a non-fatal Qdrant error
      // or throw if it's a connection error. For now, let's see.
      console.warn('[CHAT API] Continuing without context due to Qdrant error');
    }

    // 3. Fetch conversation history (last 5 messages)
    const history = await MessageModel.find({ conversationId: convoId })
      .sort({ createdAt: -1 })
      .limit(6) // +1 for the one we just inserted
      .lean();
    
    const formattedHistory = history.reverse().slice(0, -1).map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }));

    // 4. Build prompt and query LLM
    const systemPrompt = `You are a helpful AI support agent. Use the following pieces of retrieved context to answer the user's question. 
    If you don't know the answer based on the context, just say that you don't know or offer to escalate to a human.
    Context:
    ${contextText}`;

    let aiResponse;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.3,
      });
      aiResponse = completion.choices[0].message.content || 'Sorry, I encountered an error.';
    } catch (err: any) {
      console.error('[CHAT API] OpenAI Completion Error:', err);
      throw new Error(`OpenAI Completion fetch failed: ${err.message}`);
    }

    // Save AI Message
    await MessageModel.create({
      conversationId: convoId,
      role: 'assistant',
      content: aiResponse,
    });

    return NextResponse.json({ 
      response: aiResponse,
      conversationId: convoId,
      debug: {
        sourcesRetrieved: qdrantRes.length,
        contextLength: contextText.length,
      }
    });

  } catch (error: any) {
    logToFile(`ERROR: ${error.message}`);
    if (error.stack) logToFile(`STACK: ${error.stack}`);
    if (error.cause) logToFile(`CAUSE: ${JSON.stringify(error.cause)}`);
    
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      // Adding cause if available for extreme debugging
      cause: error.cause ? error.cause.message || error.cause : undefined
    }, { status: 500 });
  }
}
