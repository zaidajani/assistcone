import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import { Agent } from '@/lib/models/Agent';

export async function GET(req: Request, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agentId } = await context.params;

    await dbConnect();
    const agent = await Agent.findOne({ agentId, userId });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
