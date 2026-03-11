import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import { Agent } from '@/lib/models/Agent';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      agentId,
      model,
      tone,
      features,
      escalationSettings,
      widgetSettings,
      sources 
    } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    await dbConnect();

    // Check if agent already exists or create new
    const agent = await Agent.findOneAndUpdate(
      { agentId, userId },
      {
        model,
        tone,
        features,
        escalationSettings,
        widgetSettings,
        sources,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      agentId: agent.agentId,
      message: 'Agent saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving agent:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const agents = await Agent.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ agents });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
