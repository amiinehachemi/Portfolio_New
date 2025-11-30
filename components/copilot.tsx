'use client';

import * as React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, X, Send, Sparkles, Briefcase, Code, Award, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageSuggestion {
  title: string;
  href: string;
  description?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedPages?: PageSuggestion[] | undefined;
  isStreaming?: boolean | undefined;
}

const suggestedQuestions = [
  { 
    text: "Key skills", 
    icon: Code,
    category: "Skills"
  },
  { 
    text: "Intelswift experience", 
    icon: Briefcase,
    category: "Experience"
  },
  { 
    text: "Projects", 
    icon: Code,
    category: "Projects"
  },
  { 
    text: "Technologies", 
    icon: Award,
    category: "Tech Stack"
  },
];

export function Copilot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hey! 👋 I'm **Amine Buddy**, your friendly guide to Amine's portfolio.

I know all about his:
- **Skills** & technologies
- **Experience** at Intelswift
- **Projects** & achievements

Whether you're a *CEO*, *recruiter*, or just exploring — ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = React.useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user is near the bottom (within 100px threshold)
  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100;
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Handle scroll events to track if user has scrolled up
  const handleScroll = () => {
    shouldAutoScrollRef.current = isNearBottom();
  };

  React.useEffect(() => {
    // Only auto-scroll if user is near the bottom
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  React.useEffect(() => {
    // Refocus input when loading completes
    if (!isLoading && isOpen && inputRef.current) {
      // Small delay to ensure the input is enabled
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, isOpen]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        buttonContainerRef.current &&
        !buttonContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleQuestionClick = (question: string) => {
    // Map short question to full question
    const questionMap: Record<string, string> = {
      "Key skills": "What are Amine's key skills?",
      "Intelswift experience": "Tell me about Amine's experience at Intelswift",
      "Projects": "What projects has Amine worked on?",
      "Technologies": "What technologies does Amine specialize in?",
    };
    
    const fullQuestion = questionMap[question] || question;
    setInput(fullQuestion);
    // Auto-submit after a brief delay to show the question was selected
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const questionToSubmit = input.trim();
    if (!questionToSubmit || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: questionToSubmit,
      timestamp: new Date(),
    };

    const assistantMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    // Reset auto-scroll when user sends a new message
    shouldAutoScrollRef.current = true;

    // Create an initial empty assistant message for streaming
    const streamingMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      const response = await fetch('/api/rag-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: questionToSubmit }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let suggestedPages: PageSuggestion[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'chunk' && data.content) {
                  accumulatedContent += data.content;
                  // Update the streaming message with new content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                } else if (data.type === 'suggestions' && data.pages) {
                  suggestedPages = data.pages;
                } else if (data.type === 'error') {
                  throw new Error(data.message);
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      // Finalize the message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: accumulatedContent || 'I apologize, but I could not generate a response. Please try rephrasing your question.',
                isStreaming: false,
                suggestedPages: suggestedPages.length > 0 ? suggestedPages : undefined,
              }
            : msg
        )
      );
    } catch (error) {
      // Update the streaming message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'I apologize, but I encountered an error while processing your request. Please try again, or feel free to explore the portfolio pages for more information.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button with Label */}
      <div
        ref={buttonContainerRef}
        className={cn(
          'fixed z-50 flex items-center gap-3',
          'md:bottom-6 md:right-6',
          'bottom-4 right-4',
          'transition-all duration-300 ease-in-out',
          isOpen && 'opacity-0 pointer-events-none'
        )}
      >
        {/* Label */}
        <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm text-foreground whitespace-nowrap">
            I will answer you about Amine
          </p>
        </div>
        
        {/* Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'transition-all duration-300 ease-in-out',
            'hover:scale-110 active:scale-95',
            'ring-2 ring-primary/20',
            'flex-shrink-0'
          )}
          aria-label="Open Amine Buddy - AI Copilot"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Chat Window */}
      <div
        ref={widgetRef}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-[400px] max-w-[calc(100vw-3rem)]',
          'h-[650px] max-h-[calc(100vh-8rem)]',
          'bg-card border border-border rounded-lg shadow-2xl',
          'flex flex-col transition-all duration-300 ease-in-out',
          'backdrop-blur-sm',
          'overflow-hidden',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none',
          'md:bottom-6 md:right-6',
          'bottom-4 right-4'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="h-5 w-5 text-primary" />
              <Sparkles className="absolute -top-0.5 -right-0.5 h-2 w-2 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="font-semibold text-sm">Amine Buddy</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
            aria-label="Close Amine Buddy"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0"
        >
          {messages.length === 1 && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Suggested Questions:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((suggestion, idx) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(suggestion.text)}
                      className={cn(
                        'text-left px-2.5 py-1.5 rounded-md border border-border bg-muted/50',
                        'hover:bg-muted hover:border-primary/50',
                        'transition-all duration-200',
                        'flex items-center gap-1.5',
                        'group',
                        'text-xs'
                      )}
                    >
                      <Icon className="h-3 w-3 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                        {suggestion.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                    'word-break break-words'
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-wrap-anywhere leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {message.content ? (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                ) : (
                                  <code className="block bg-background/50 p-2 rounded text-xs font-mono overflow-x-auto my-2">{children}</code>
                                );
                              },
                              pre: ({ children }) => <pre className="bg-background/50 p-2 rounded overflow-x-auto my-2">{children}</pre>,
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                                  {children}
                                </a>
                              ),
                              h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-primary/50 pl-3 italic my-2">{children}</blockquote>
                              ),
                              hr: () => <hr className="border-border my-3" />,
                              table: ({ children }) => (
                                <div className="overflow-x-auto my-2">
                                  <table className="min-w-full border-collapse text-xs">{children}</table>
                                </div>
                              ),
                              th: ({ children }) => <th className="border border-border px-2 py-1 bg-background/50 font-semibold">{children}</th>,
                              td: ({ children }) => <td className="border border-border px-2 py-1">{children}</td>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-middle rounded-sm" />
                          )}
                        </>
                      ) : message.isStreaming ? (
                        <span className="inline-block w-1.5 h-4 bg-primary animate-pulse rounded-sm" />
                      ) : null}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-primary" />
                  </div>
                )}
              </div>
              {/* Page Suggestions */}
              {message.role === 'assistant' && message.suggestedPages && message.suggestedPages.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-11">
                  {message.suggestedPages.map((page, idx) => (
                    <Link
                      key={idx}
                      href={page.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md',
                        'text-xs border border-border bg-card hover:bg-muted',
                        'hover:border-primary/50 transition-all duration-200',
                        'group'
                      )}
                    >
                      <span className="text-foreground group-hover:text-primary transition-colors">
                        {page.title}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && !messages.some(m => m.isStreaming && m.content) && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30 rounded-b-lg">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

