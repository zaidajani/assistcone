import { NextResponse } from 'next/server';
import { crawlWebsite } from '@/lib/crawler';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url, agentId, maxPages = 50 } = body;

    if (!url || !agentId) {
      return NextResponse.json({ error: 'Missing url or agentId' }, { status: 400 });
    }

    // Since crawling is a long-running process, we typically shouldn't block the request.
    // In a production environment, this should be sent to a queue (like Inngest, BullMQ, or AWS SQS).
    // For this prototype, we'll start it asynchronously and return immediately.
    
    crawlWebsite(url, agentId, maxPages).catch((err: any) => {
      console.error('Crawler background job failed:', err);
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Crawling job started successfully',
      agentId,
      url,
      maxPages
    });

  } catch (error: any) {
    console.error('Error starting crawl:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
