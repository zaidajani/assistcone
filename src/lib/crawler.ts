import { CheerioCrawler } from '@crawlee/cheerio';
import crypto from 'node:crypto';
import { openai } from './openai';
import { qdrantClient, COLLECTION_NAME, initQdrant } from './qdrant';

// Helper to chunk text
function chunkText(text: string, chunkSize: number = 1000): string[] {
  const words = text.split(/\\s+/);
  const chunks = [];
  let currentChunk = [];

  for (const word of words) {
    currentChunk.push(word);
    if (currentChunk.join(' ').length >= chunkSize) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }
  return chunks;
}

import { CrawlStatus } from './models/CrawlStatus';
import dbConnect from './mongodb';

export async function crawlWebsite(startUrl: string, agentId: string, maxPages: number = 50) {
  console.log(`Starting crawl for ${startUrl} (agent: ${agentId})`);
  await dbConnect();
  await initQdrant();

  // Initialize or Reset status
  await CrawlStatus.findOneAndUpdate(
    { agentId },
    { 
      agentId, 
      startUrl, 
      totalFound: 0, 
      isFinished: false, 
      pages: [] 
    },
    { upsert: true }
  );

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: maxPages,
    async requestHandler({ request, $, log }) {
      log.info(`Processing ${request.url}...`);
      
      // Update DB that we found/started this page
      await CrawlStatus.findOneAndUpdate(
        { agentId },
        { 
          $push: { pages: { url: request.url, status: 'Processing' } },
          $inc: { totalFound: 1 }
        }
      );
      
      // Extract text from the page (naive extraction)
      $('script, style, nav, footer, header, iframe, noscript').remove();
      const textContent = $('body').text();
      const cleanedText = textContent.replace(/\\s+/g, ' ').trim();
      
      if (cleanedText.length < 50) {
         log.warning(`Not enough content on ${request.url}`);
         await CrawlStatus.findOneAndUpdate(
           { agentId, 'pages.url': request.url },
           { $set: { 'pages.$.status': 'Completed', 'pages.$.error': 'Low content' } }
         );
         return;
      }

      const chunks = chunkText(cleanedText, 1000);
      
      for (const [idx, chunk] of chunks.entries()) {
         try {
           const embeddingRes = await openai.embeddings.create({
             model: "text-embedding-3-small",
             input: chunk,
             encoding_format: "float",
           });
           
           const vector = embeddingRes.data[0].embedding;
           
           await qdrantClient.upsert(COLLECTION_NAME, {
             wait: true,
             points: [
               {
                 id: crypto.randomUUID(),
                 vector,
                 payload: {
                   agentId,
                   url: request.url,
                   chunkIndex: idx,
                   text: chunk
                 }
               }
             ]
           });
         } catch (e: any) {
           log.error(`Failed to embed chunk ${idx} for ${request.url}`, { error: e.message });
         }
      }

      // Mark page as completed
      await CrawlStatus.findOneAndUpdate(
        { agentId, 'pages.url': request.url },
        { $set: { 'pages.$.status': 'Completed' } }
      );
    },
    failedRequestHandler({ request, log }) {
      log.error(`Request ${request.url} failed completely.`);
      CrawlStatus.findOneAndUpdate(
        { agentId, 'pages.url': request.url },
        { $set: { 'pages.$.status': 'Failed' } }
      ).catch(e => console.error(e));
    },
  });

  await crawler.run([startUrl]);
  
  await CrawlStatus.findOneAndUpdate(
    { agentId },
    { $set: { isFinished: true } }
  );

  console.log(`Crawl finished for ${startUrl}`);
}
