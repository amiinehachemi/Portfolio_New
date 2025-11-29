/**
 * Function to insert data into Pinecone index
 * Uses LangChain text splitter to split documents before embedding
 * 
 * IMPORTANT: Install @langchain/text-splitters package first:
 * npm install @langchain/text-splitters
 */

import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { ragConfig } from './config';

/**
 * Simple text splitter fallback (used if @langchain/text-splitters is not installed)
 */
class SimpleTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  
  constructor(options: { chunkSize: number; chunkOverlap: number }) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap;
  }
  
  async createDocuments(texts: string[], metadatas?: Record<string, any>[]): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    const documents: Array<{ pageContent: string; metadata: Record<string, any> }> = [];
    
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const metadata = metadatas?.[i] || {};
      
      // Simple character-based splitting with overlap
      for (let start = 0; start < text.length; start += this.chunkSize - this.chunkOverlap) {
        const end = Math.min(start + this.chunkSize, text.length);
        const chunk = text.slice(start, end);
        
        if (chunk.trim().length > 0) {
          documents.push({
            pageContent: chunk,
            metadata: { ...metadata, chunkIndex: documents.length }
          });
        }
      }
    }
    
    return documents;
  }
}

/**
 * Get text splitter - tries to use LangChain's RecursiveCharacterTextSplitter,
 * falls back to SimpleTextSplitter if package is not installed
 */
async function getTextSplitter(chunkSize: number, chunkOverlap: number) {
  try {
    // Try to import @langchain/text-splitters (optional dependency)
    // @ts-ignore - Optional dependency, fallback available
    const { RecursiveCharacterTextSplitter } = await import('@langchain/text-splitters');
    return new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
  } catch (error) {
    // Fallback to simple text splitter if package is not installed
    console.warn('⚠️  @langchain/text-splitters not found. Using simple text splitter.');
    console.warn('   Install it for better chunking: npm install @langchain/text-splitters');
    return new SimpleTextSplitter({ chunkSize, chunkOverlap });
  }
}

/**
 * YOUR DATA GOES HERE
 * Replace this with your actual data
 * 
 * Option 1: Single long string
 * const dummyData = [
 *   {
 *     content: `YOUR LONG STRING GOES HERE...`,
 *     metadata: { source: 'your_source', type: 'your_type' }
 *   }
 * ];
 * 
 * Option 2: Multiple documents
 * const dummyData = [
 *   {
 *     content: `First document content...`,
 *     metadata: { source: 'source1', type: 'type1' }
 *   },
 *   {
 *     content: `Second document content...`,
 *     metadata: { source: 'source2', type: 'type2' }
 *   }
 * ];
 */
const dummyData = [
  {
    content: `YOUR LONG STRING DATA GOES HERE. Replace this entire string with your actual data. It can be as long as you need - the text splitter will automatically break it into smaller chunks.`,
    metadata: { source: 'portfolio', type: 'content' }
  }
];

/**
 * Initialize Pinecone client
 */
async function getPineconeClient(): Promise<Pinecone> {
  if (!ragConfig.pinecone.apiKey) {
    throw new Error('PINECONE_API_KEY is not set in environment variables');
  }

  return new Pinecone({
    apiKey: ragConfig.pinecone.apiKey,
  });
}

/**
 * Insert data into Pinecone index
 * @param documents - Array of documents with content and optional metadata
 * @param options - Optional configuration for text splitting
 */
export async function insertDataToPinecone(
  documents: Array<{ content: string; metadata?: Record<string, any> }> = dummyData,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    namespace?: string;
  }
) {
  try {
    console.log('Starting data insertion to Pinecone...');

    // Validate configuration
    if (!ragConfig.pinecone.indexName) {
      throw new Error('PINECONE_INDEX_NAME is not set in environment variables');
    }

    if (!ragConfig.model.apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    // Initialize embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: ragConfig.model.apiKey,
    });

    // Initialize Pinecone client
    const pineconeClient = await getPineconeClient();
    const index = pineconeClient.Index(ragConfig.pinecone.indexName);

    // Get text splitter (with fallback)
    const textSplitter = await getTextSplitter(
      options?.chunkSize || 1000,
      options?.chunkOverlap || 200
    );

    console.log(`Splitting ${documents.length} document(s) into chunks...`);

    // Split all documents into chunks
    const allChunks: Array<{ pageContent: string; metadata: Record<string, any> }> = [];
    
    for (const doc of documents) {
      const chunks = await textSplitter.createDocuments(
        [doc.content],
        doc.metadata ? [doc.metadata] : []
      );
      allChunks.push(...chunks);
    }

    console.log(`Created ${allChunks.length} chunks from ${documents.length} document(s)`);

    // Create or get vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    // Add documents to vector store
    console.log('Adding documents to Pinecone...');
    await vectorStore.addDocuments(allChunks);

    console.log(`✅ Successfully inserted ${allChunks.length} chunks into Pinecone index: ${ragConfig.pinecone.indexName}`);
    
    return {
      success: true,
      chunksInserted: allChunks.length,
      documentsProcessed: documents.length,
    };
  } catch (error) {
    console.error('Error inserting data to Pinecone:', error);
    throw new Error(
      `Failed to insert data to Pinecone: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper function to insert a single text document
 */
export async function insertTextToPinecone(
  text: string,
  metadata?: Record<string, any>,
  options?: {
    chunkSize?: number;
    chunkOverlap?: number;
    namespace?: string;
  }
) {
  const doc: { content: string; metadata?: Record<string, any> } = { content: text };
  if (metadata) {
    doc.metadata = metadata;
  }
  return insertDataToPinecone([doc], options);
}
