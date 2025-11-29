/**
 * Example script to insert data into Pinecone
 * Run this script to populate your Pinecone index with data
 * 
 * Usage:
 *   npx tsx rag-agent/insert-data-example.ts
 *   or
 *   ts-node rag-agent/insert-data-example.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { insertDataToPinecone, insertTextToPinecone } from './insert-data';

/**
 * Example 1: Insert dummy data (default)
 */
async function exampleInsertDummyData() {
  console.log('Example 1: Inserting dummy data...\n');
  
  try {
    const result = await insertDataToPinecone();
    console.log('\nResult:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Insert custom data
 */
async function exampleInsertCustomData() {
  console.log('Example 2: Inserting custom data...\n');
  
  const customData = [
    {
      content: `This is a custom document about React and Next.js. React is a JavaScript library for building user interfaces, and Next.js is a React framework for production.`,
      metadata: { source: 'custom', topic: 'react' }
    },
    {
      content: `TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type definitions to JavaScript, helping catch errors early.`,
      metadata: { source: 'custom', topic: 'typescript' }
    }
  ];

  try {
    const result = await insertDataToPinecone(customData, {
      chunkSize: 500,
      chunkOverlap: 100,
    });
    console.log('\nResult:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Insert a single long text document (RECOMMENDED FOR YOUR USE CASE)
 * This is the easiest way to insert your long string
 */
async function exampleInsertSingleText() {
  console.log('Example 3: Inserting single text document...\n');
  
  // REPLACE THIS WITH YOUR ACTUAL LONG STRING
  const longText = `
1. Personal Information

full_name: Amine Hachemi
title: Software Engineer and Technical Lead specializing in backend architecture and AI systems

linkedin: https://www.linkedin.com/in/amiinehachemi/

github: https://github.com/amiinehachemi

professional_identity:
Engineer focused on scalable backend platforms, distributed systems, AI driven automation pipelines, and enterprise grade communication frameworks. Works across backend, AI infrastructure, and multi channel integrations. Experienced in leading technical direction and cross functional teams.

2. Professional Summary (Detailed, Not Short)

Architect and builder of backend platforms designed for large scale customer service automation across messaging channels such as WhatsApp, Telegram, Messenger, Instagram, Viber, and web based widgets.

Specialized in AI integrations including retrieval augmented generation (RAG), agent architectures, vector database pipelines, and secure data ingestion workflows.

Designs microservices and API ecosystems that meet enterprise requirements for scalability, security, and compliance with standards like SOC 2 and GDPR.

Leads development teams to deliver production ready AI features capable of reasoning over enterprise knowledge, interacting with APIs, and automating support tasks.

Builds multi tenant systems with strict data isolation, caching layers, event driven processing, job queues, and real time communication pipelines through RabbitMQ and Kafka.

Experienced in both backend architecture and helping shape frontend interactions when needed to deliver unified product experiences.

Integrates security, privacy, and compliance into the engineering lifecycle based on legal and policy background.

3. Skills
Backend Engineering

API architecture

REST and microservices

Distributed systems design

Multi tenant infrastructure

Role based access control (RBAC)

Server side performance optimization

Monitoring and observability

Queue based asynchronous workflows

Event driven pipelines

Cloud deployment and scaling

Programming Languages

Python

JavaScript

TypeScript

Node.js

Frameworks and Technologies

Flask

FastAPI

Express.js

React

Next.js

Tailwind CSS

Docker

Gunicorn

Vercel

AI and Data Engineering

Retrieval augmented generation

Vector embedding pipelines

Pinecone

LangChain

AI agent tooling

Tool calling architectures

Structured data retrieval

Prompt engineering

Domain grounded AI reasoning

Messaging and Channel Integrations

WhatsApp Business API

Telegram Bot API

Messenger API

Instagram Messaging API

Viber API

Web widgets, chat interfaces

Infrastructure and DevOps

Docker based deployments

CI/CD pipelines

AWS

Environment configuration

Server configuration

System reliability and uptime handling

Security and Compliance

SOC 2 practices

GDPR principles

Data isolation and tenancy

Secure API authentication

Transport encryption

Credential management

Tools and External Services Integrated

Google Calendar API

Gmail SMTP

Tavily Search API

Apify web scraping

Alpha Vantage stock API

DALL E image generation

SQLite

RabbitMQ

Kafka

Soft Skills

Technical leadership

Cross functional collaboration

Systems thinking

User focused design mindset

Architecture communication

Codebase stewardship

4. Experience (Fully Detailed)
Technical Lead — Intelswift

Nov 2025 to Present

Role Scope

Oversees technical direction of a large customer service automation platform.

Shapes architecture across backend services, AI reasoning components, messaging pipelines, and data flows.

Responsible for multi channel communication architecture integrating WhatsApp, Telegram, Messenger, Instagram, Viber, and custom web widgets.

Leads AI strategy across RAG pipelines, vector database architecture, agent design, and automation logic.

Works with product, design, and engineering teams to deliver user centered features.

Core Responsibilities

Leadership of AI integrations across the entire communication ecosystem.

Architecture of cross channel AI powered communication systems for customer support.

Integration of enterprise knowledge into secure vector databases with structured ingestion and isolation.

Development and maintenance of AI agents that interact with internal and external APIs to automate tasks.

Ensuring compliance with SOC 2 and GDPR requirements at the system architecture and code level.

Managing multi tenant data flows while maintaining strict isolation and tenant level permissions.

Setting development standards for backend services, including validation, error handling, and scalability.

Coordinating cross functional teams to ensure reliable, cohesive product delivery.

Software Engineer — Intelswift

May 2023 to Nov 2025

System Development Contributions

Implementation of advanced AI features including RAG pipelines, contextual retrieval workflows, and agent tool calling.

Designed and shipped modular social media integration frameworks enabling clients to connect their own messaging apps directly to the platform.

Built secure APIs with robust validation, authentication, and role based access control to support enterprise use cases.

Architected multi tenant infrastructure ensuring data isolation, per tenant processing, and scalable onboarding.

Created microservices supporting real time communication, metrics processing, and automation workloads.

Performance and Reliability Work

Added caching layers to reduce latency and increase system responsiveness.

Created asynchronous background job processors for repetitive or large scale tasks.

Implemented RabbitMQ and Kafka pipelines for reliable message transfer between backend components and AI engines.

Ensured resilience and failover procedures in communication channels.

AI Automation Impact

Connected backend systems to vector databases for intelligent retrieval.

Built AI agents capable of interacting with tools and APIs to automate support workflows.

Reduced manual support workload and improved customer response times through automation pipelines.

5. Projects (Fully Detailed)
Ecommerce AI Assistant

Category: AI powered terminal assistant
Stack: Python, LangChain, SQLite, CLI
Core Features:

AI chatbot grounded in a real product catalog stored in SQLite.

Structured tool calling for product lookup, order lookup, and quote generation.

Automatic database seeding from products.json on startup.

Terminal based chat loop for testing grounded AI interactions.

Domain specific system prompt ensures accurate reasoning and minimal hallucination.

Architecture designed for extension to UI or messaging channels.

Files and Modules:

app.py: CLI runner and database seeding

agent.py: Agent configuration with model and tool bindings

tools.py: Product listing, order retrieval, quote generation tools

products.json: Initial catalog

Separate SQLite databases for products and orders

Clara Conversational Scheduler and Mailer

Category: Appointment booking AI
Stack: Next.js, Tailwind, Google Calendar API, OpenAI GPT with function calling
Capabilities:

AI powered agent that can read calendar availability, list schedules, and create appointments.

Conversation interface for natural booking flow.

Secure OAuth2 integration with Google Calendar.

Real time calendar updates and booking logic.

Modern responsive UI built with Next.js 15.

Multi tool agent design with system level function calling.

Tools Exposed to AI:

Check availability

Create appointment

List appointments

Verify appointment

Get current date

AI Chatbot Service (RAG)

Category: Backend AI service
Stack: Python, Flask, Pinecone, OpenAI
Core Functions:

Website ingestion for vector embeddings.

Text ingestion for direct embedding into Pinecone.

Retrieval augmented generation API endpoints.

Conversational mode with optional chat history.

Health checks and REST based service design.

Docker support for deployment.

End Points:

POST /train/website

POST /train/inputs

POST /query

GET /health

Synthea AI Assistant Backend

Category: Multi tool AI backend
Stack: Python, Flask, LangChain, external APIs
Capabilities:

Multi tool agent performing:
• Web search
• Stock quotes
• Web scraping
• Gmail email sending
• Calendly scheduling
• DALL E image generation

Session management with per session rate limits.

Secure environment variable based configuration.

Tool definitions in modular structure.

Designed to support any frontend via /query endpoint.

AI Trial Hub — Marketplace Landing Page

Category: Marketing site for AI app trials
Stack: Next.js 15, Tailwind CSS v4
Pages and Features:

Hero section with value proposition

How It Works explanation

Curated AI apps grid with search, filters, and pagination

Founder story page

Signup experience with FAQs and benefit sections

Fully responsive design

Clean structure for easy branding updates

6. Education (Detailed)
Bachelor of Law — International Law and Legal Studies

Université Dr Moulay Tahar de Saida (2018 to 2021)
Key Benefits to Engineering:

Analytical reasoning

Structured analysis

Compliance understanding

Security and privacy principles

Zero To Mastery Academy

Certified Full Stack Developer (2022 to 2023)
Focus Areas:

Node.js backend

Python backends

API architecture

Database design

Deployment workflows

Project based learning

FreeCodeCamp

Certified Responsive Web Developer (2022 to 2023)
Covered:

HTML, CSS, JavaScript

React

Backend with Node.js, Express.js

Data structures and algorithms

Scrimba

Certified Frontend Developer (2021 to 2022)
Skills Built:

React component architecture

Routing, hooks, state management

UI logic and layouts

7. Awards

First Prize, Intelswift Hackathon

8. Additional Professional Attributes

Strong leadership in technical environments

Ability to translate complex architecture into usable product features

Skilled in mentoring junior developers

Product oriented engineering mindset

Deep experience navigating enterprise constraints

Comfortable context switching between backend, AI, and frontend when necessary
  `;

  try {
    const result = await insertTextToPinecone(
      longText,
      { source: 'portfolio', type: 'content' }, // Optional: add metadata
      {
        chunkSize: 2000,  // Size of each chunk (adjust as needed)
        chunkOverlap: 400, // Overlap between chunks (adjust as needed)
      }
    );
    console.log('\nResult:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run examples (uncomment the one you want to run)
// exampleInsertDummyData();
// exampleInsertCustomData();
exampleInsertSingleText(); // <-- Use this one for a single long string

// If running directly
if (require.main === module) {
  console.log('🚀 Starting data insertion examples...\n');
  exampleInsertDummyData()
    .then(() => {
      console.log('\n✅ Example completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Example failed:', error);
      process.exit(1);
    });
}

