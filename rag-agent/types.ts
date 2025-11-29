/**
 * Types for the RAG Agent
 */

export interface PageSuggestion {
  title: string;
  href: string;
  description?: string;
}

export interface RAGQueryResult {
  answer: string;
  suggestedPages?: PageSuggestion[];
  sources?: Array<{
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface RAGAgentConfig {
  model?: string;
  temperature?: number;
  topK?: number;
}

