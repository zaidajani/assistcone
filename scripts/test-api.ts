import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { OpenAI } from 'openai';
import { QdrantClient } from '@qdrant/js-client-rest';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'assistcone_knowledge';

async function test() {
    console.log('--- Testing OpenAI Embedding ---');
    try {
        const res = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: "hi",
        });
        console.log('OpenAI Embedding Success');
    } catch (err: any) {
        console.error('OpenAI Embedding Failed:', err);
    }

    console.log('\n--- Testing Qdrant Search ---');
    try {
        const res = await qdrantClient.search(COLLECTION_NAME, {
            vector: new Array(1536).fill(0),
            limit: 1,
        });
        console.log('Qdrant Search Success');
    } catch (err: any) {
        console.error('Qdrant Search Failed:', err);
    }
    
    console.log('\n--- Testing OpenAI Chat ---');
    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: 'user', content: 'hi' }],
        });
        console.log('OpenAI Chat Success:', res.choices[0].message.content);
    } catch (err: any) {
        console.error('OpenAI Chat Failed:', err);
    }
}

test();
