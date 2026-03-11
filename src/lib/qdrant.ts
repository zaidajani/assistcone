import { QdrantClient } from '@qdrant/js-client-rest';

console.log('[QDRANT] Initializing client with URL:', process.env.QDRANT_URL || 'http://localhost:6333');
export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTION_NAME = 'assistcone_knowledge';

// Initialize collection if it doesn't exist
export async function initQdrant() {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.find((c: any) => c.name === COLLECTION_NAME);
    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536, // size for text-embedding-3-small
          distance: 'Cosine',
        },
      });
      
      // Create payload index for agentId to allow filtered search in strict mode
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'agentId',
        field_schema: 'keyword',
      });
      console.log(`[QDRANT] Collection ${COLLECTION_NAME} initialized with payload index on agentId`);
    } else {
      // Even if collection exists, ensure the payload index is there
      // Check payload indexes
      const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
      if (!collectionInfo.payload_schema?.agentId) {
          await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'agentId',
            field_schema: 'keyword',
          });
          console.log(`[QDRANT] Added missing payload index for agentId to ${COLLECTION_NAME}`);
      }
    }
  } catch (error) {
    console.error('Qdrant Init Error:', error);
  }
}
