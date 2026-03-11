import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import { CrawlStatus } from '@/lib/models/CrawlStatus';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    await dbConnect();
    const status = await CrawlStatus.findOne({ agentId });

    if (!status) {
      return NextResponse.json({ pages: [], isFinished: true, totalFound: 0 });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error fetching crawl status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
