import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'assistcone_knowledge';

async function checkData() {
    console.log('--- Checking Qdrant Data Store ---');
    try {
        const collections = await qdrantClient.getCollections();
        console.log('Available Collections:', collections.collections.map(c => c.name));

        const info = await qdrantClient.getCollection(COLLECTION_NAME);
        console.log(`Points in ${COLLECTION_NAME}:`, info.points_count);

        // Peek at a few points to see agentIds
        const scroll = await qdrantClient.scroll(COLLECTION_NAME, {
            limit: 10,
            with_payload: true,
        });

        console.log('\nLast 10 points payload summary:');
        scroll.points.forEach(p => {
            console.log(`ID: ${p.id}, AgentId: ${p.payload?.agentId}, URL: ${p.payload?.url}`);
        });

        // Search specifically for the agentId from the screenshot
        const screenshotAgentId = '71ba33b2-8dd7-482b-bca2-8a27898cb326';
        const count = await qdrantClient.count(COLLECTION_NAME, {
            filter: {
                must: [{ key: 'agentId', match: { value: screenshotAgentId } }]
            }
        });
        console.log(`\nPoints found for AgentId ${screenshotAgentId}:`, count.count);

    } catch (err: any) {
        console.error('Error peeking at Qdrant:', err);
    }
}

checkData();
