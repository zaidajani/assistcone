import { PlaywrightCrawler, Dataset } from 'crawlee';
import { ensureCollectionExists, qdrantClient, COLLECTION_NAME } from './qdrant';
import { openai } from './openai';

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

// Simple chunking function
export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

export async function processAndStoreDocument(agentId: string, page: CrawledPage) {
  await ensureCollectionExists();
  
  const chunks = chunkText(page.content);
  console.log(`Processing ${chunks.length} chunks for ${page.url}`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Generate embedding
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk,
      encoding_format: "float",
    });
    
    const vector = response.data[0].embedding;
    
    // Store in Qdrant
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: crypto.randomUUID(),
          vector: vector,
          payload: {
            agentId: agentId,
            url: page.url,
            title: page.title,
            text: chunk,
            chunkIndex: i,
          }
        }
      ]
    });
  }
}

export async function crawlWebsite(startUrl: string, agentId: string, maxPages: number = 10) {
  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: maxPages,
    async requestHandler({ page, request, enqueueLinks }) {
      console.log(`Processing ${request.url}...`);
      
      // Wait for network idle to ensure dynamic content loads
      await page.waitForLoadState('networkidle');
      
      const title = await page.title();
      
      // Extract main text content. We try to grab the body or main element text, stripping out scripts/styles
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        const elementsToRemove = document.querySelectorAll('script, style, nav, footer, iframe, noscript');
        elementsToRemove.forEach(el => el.remove());
        
        // Try to get main content or fallback to body
        const main = document.querySelector('main') || document.querySelector('article') || document.body;
        return main.innerText.replace(/\s+/g, ' ').trim();
      });

      if (content.length > 100) {
        await processAndStoreDocument(agentId, { url: request.url, title, content });
      }

      // Find links on the same domain and enqueue them
      const baseUrl = new URL(startUrl);
      await enqueueLinks({
        strategy: 'same-hostname',
        transformRequestFunction(req) {
          // Ignore external links or non-html resources
          if (!req.url.startsWith(baseUrl.origin) || req.url.match(/\.(png|jpg|jpeg|gif|css|js|pdf|zip)$/i)) {
            return false;
          }
          return req;
        },
      });
    },
    failedRequestHandler({ request, log }) {
      log.error(`Request ${request.url} failed too many times.`);
    },
  });

  await crawler.run([startUrl]);
}
