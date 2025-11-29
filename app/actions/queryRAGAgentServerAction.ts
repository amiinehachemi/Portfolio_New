'use server';

import { queryRAGAgent } from '@/rag-agent';

export async function queryRAGAgentServerAction(question: string) {
  try {
    const result = await queryRAGAgent(question);
    return { 
      success: true, 
      answer: result.answer,
      suggestedPages: result.suggestedPages 
    };
  } catch (error) {
    console.error('RAG Agent Query Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

