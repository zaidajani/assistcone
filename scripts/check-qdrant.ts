import * as dotenv from 'dotenv';
import * as path from 'path';
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

import { QdrantClient } from '@qdrant/js-client-rest';

async function check() {
  try {
    console.log('Env loaded from:', envPath);
    console.log('QDRANT_URL from env:', process.env.QDRANT_URL);
    
    const client = new QdrantClient({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
    });
    
    const COLLECTION_NAME = 'assistcone_knowledge';
    
    console.log('Checking collection:', COLLECTION_NAME);
    const info = await client.getCollection(COLLECTION_NAME);
    console.log('Collection Info:', JSON.stringify(info, null, 2));

    if (!info.payload_schema?.agentId) {
        console.log('Creating payload index for agentId...');
        await client.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'agentId',
            field_schema: 'keyword',
        });
        console.log('Created payload index!');
    } else {
        console.log('Payload index for agentId already exists.');
    }

    const collections = await client.getCollections();
    console.log('Collections:', collections);
    
    for (const c of collections.collections) {
        const info = await client.getCollection(c.name);
        // already logged above
    }
  } catch (err) {
    console.error('Error checking Qdrant:', err);
  }
}

check();
