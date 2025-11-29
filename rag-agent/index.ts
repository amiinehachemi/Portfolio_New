/**
 * Main RAG Agent
 * Simple RAG agent that retrieves information from Pinecone and answers questions
 */

import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createRetrievalTool } from './retrieval-tool';
import { ragConfig } from './config';
import type { RAGQueryResult, RAGAgentConfig } from './types';
import { suggestPages } from '@/lib/page-suggestions';

let agentInstance: Awaited<ReturnType<typeof createAgent>> | null = null;

/**
 * Initialize the RAG agent
 */
export async function initializeRAGAgent(config?: RAGAgentConfig) {
  if (agentInstance) {
    return agentInstance;
  }

  // Validate configuration
  if (!ragConfig.model.apiKey) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  // Initialize model
  const model = new ChatOpenAI({
    model: config?.model || ragConfig.model.modelName,
    temperature: config?.temperature ?? ragConfig.model.temperature,
    openAIApiKey: ragConfig.model.apiKey,
  });

  // Create retrieval tool
  const retrievalTool = await createRetrievalTool();

  // Create agent with retrieval tool
  agentInstance = createAgent({
    model,
    tools: [retrievalTool],
    systemPrompt: `You are an AI assistant for Amine Hachemi's portfolio website. You help visitors (CEOs, HR professionals, recruiters, and other users) learn about Amine's professional background, skills, experience, and projects.

About Amine:
- Tech Lead & Software Engineer at Intelswift
- Specializes in AI integrations, backend systems, microservices, and multi-channel communication platforms
- Experienced with RAG, AI agents, vector databases, and building scalable systems
- Strong background in Node.js, TypeScript, React, Next.js, and cloud technologies

Your role:
1. Use the search_knowledge_base tool to find relevant information about Amine's portfolio
2. Answer questions about his skills, experience, projects, education, and technical expertise
3. Be professional, concise, and helpful - you're representing Amine to potential employers and collaborators
4. If information isn't available in the knowledge base, politely say so and suggest they explore the portfolio pages
5. Highlight relevant experience, technologies, and achievements when appropriate
6. Maintain a friendly but professional tone suitable for business contexts`,
  });

  return agentInstance;
}

/**
 * Query the RAG agent with a question
 */
export async function queryRAGAgent(
  question: string,
  config?: RAGAgentConfig
): Promise<RAGQueryResult> {
  try {
    const agent = await initializeRAGAgent(config);

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
    });

    // Extract the final answer from the messages
    const lastMessage = result.messages[result.messages.length - 1];
    const answer = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : JSON.stringify(lastMessage.content);

    // Suggest relevant pages based on the query
    const suggestedPages = suggestPages(question);

    const queryResult: RAGQueryResult = {
      answer,
    };

    if (suggestedPages.length > 0) {
      queryResult.suggestedPages = suggestedPages;
    }

    return queryResult;
  } catch (error) {
    console.error('RAG Agent query error:', error);
    throw new Error(
      `Failed to query RAG agent: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Stream responses from the RAG agent
 */
export async function* streamRAGAgent(
  question: string,
  config?: RAGAgentConfig
): AsyncGenerator<string, void, unknown> {
  try {
    const agent = await initializeRAGAgent(config);

    const stream = await agent.stream(
      {
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      },
      { streamMode: 'messages' }
    );

    for await (const chunk of stream) {
      const chunkContent = (chunk as any).content;
      if (chunkContent) {
        const content = typeof chunkContent === 'string' 
          ? chunkContent 
          : JSON.stringify(chunkContent);
        yield content;
      }
    }
  } catch (error) {
    console.error('RAG Agent stream error:', error);
    throw new Error(
      `Failed to stream RAG agent: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Reset the agent instance (useful for testing or reconfiguration)
 */
export function resetRAGAgent() {
  agentInstance = null;
}

