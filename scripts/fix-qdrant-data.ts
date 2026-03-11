import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'assistcone_knowledge';

async function fixData() {
    const targetAgentId = '71ba33b2-8dd7-482b-bca2-8a27898cb326';
    console.log(`--- Migrating Qdrant Data to AgentId: ${targetAgentId} ---`);
    
    try {
        console.log('Fetching points...');
        // Find all points that don't have the target agentId
        const scroll = await qdrantClient.scroll(COLLECTION_NAME, {
            filter: {
                must_not: [{ key: 'agentId', match: { value: targetAgentId } }]
            },
            limit: 100,
            with_payload: true,
        });
        console.log(`Scroll result: ${scroll.points.length} points found.`);

        for (const point of scroll.points) {
            console.log(`Updating point ${point.id} (current agentId: ${point.payload?.agentId})`);
            await qdrantClient.setPayload(COLLECTION_NAME, {
                payload: {
                    agentId: targetAgentId,
                },
                points: [point.id],
                wait: true,
            });
        }

        console.log('Migration complete!');

        // Verify count
        const count = await qdrantClient.count(COLLECTION_NAME, {
            filter: {
                must: [{ key: 'agentId', match: { value: targetAgentId } }]
            }
        });
        console.log(`Points now found for AgentId ${targetAgentId}:`, count.count);

    } catch (err: any) {
        console.error('Error fixing Qdrant data:', err);
    }
}

fixData();
