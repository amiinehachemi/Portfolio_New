/**
 * Configuration for the RAG Agent
 * Set these environment variables in your .env file
 */

// Load environment variables if running as a script (not in Next.js)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  try {
    const { config } = require('dotenv');
    const { resolve } = require('path');
    config({ path: resolve(process.cwd(), '.env.local') });
  } catch (e) {
    // dotenv not available or already loaded
  }
}

export const ragConfig = {
  // Pinecone configuration
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || '',
    // Note: environment is only needed for legacy Pinecone, not serverless
    environment: process.env.PINECONE_ENVIRONMENT || '',
  },
  
  // Model configuration
  model: {
    provider: process.env.LLM_PROVIDER || 'openai',
    modelName: process.env.LLM_MODEL_NAME || 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY || '',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },
  
  // Retrieval configuration
  retrieval: {
    topK: parseInt(process.env.RETRIEVAL_TOP_K || '5', 10),
  },
};

