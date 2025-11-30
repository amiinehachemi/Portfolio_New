'use client';

import * as React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose 
} from '@/components/ui/drawer';
import { Bot, X, Send, Sparkles, Briefcase, Code, Award, ExternalLink, ChevronDown, MessageCircle } from 'lucide-react';
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
    fullText: "What are Amine's key skills?",
    icon: Code,
    category: "Skills"
  },
  { 
    text: "Intelswift experience", 
    fullText: "Tell me about Amine's experience at Intelswift",
    icon: Briefcase,
    category: "Experience"
  },
  { 
    text: "Projects", 
    fullText: "What projects has Amine worked on?",
    icon: Code,
    category: "Projects"
  },
  { 
    text: "Technologies", 
    fullText: "What technologies does Amine specialize in?",
    icon: Award,
    category: "Tech Stack"
  },
];

// Reusable Message Bubble Component
function MessageBubble({ message, isMobile = false }: { message: Message; isMobile?: boolean }) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex gap-3',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        )}
      >
        {message.role === 'assistant' && (
          <div className={cn(
            "flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10",
            isMobile ? "h-9 w-9" : "h-8 w-8"
          )}>
            <Bot className={cn("text-primary", isMobile ? "h-5 w-5" : "h-4 w-4")} />
          </div>
        )}
        <div
          className={cn(
            'max-w-[85%] rounded-2xl text-sm',
            isMobile ? 'px-4 py-3' : 'px-3 py-2',
            message.role === 'user'
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md',
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
          <div className={cn(
            "flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center",
            isMobile ? "h-9 w-9" : "h-8 w-8"
          )}>
            <div className={cn("rounded-full bg-primary-foreground", isMobile ? "h-4 w-4" : "h-3 w-3")} />
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Page Suggestions Component
function PageSuggestions({ 
  pages, 
  onClose, 
  isMobile = false 
}: { 
  pages: PageSuggestion[]; 
  onClose: () => void; 
  isMobile?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", isMobile ? "ml-12" : "ml-11")}>
      {pages.map((page, idx) => (
        <Link
          key={idx}
          href={page.href}
          onClick={onClose}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full',
            'border border-border bg-card hover:bg-muted',
            'hover:border-primary/50 transition-all duration-200',
            'active:scale-95',
            'group',
            isMobile ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
          )}
        >
          <span className="text-foreground group-hover:text-primary transition-colors">
            {page.title}
          </span>
          <ExternalLink className={cn(
            "text-muted-foreground group-hover:text-primary transition-colors",
            isMobile ? "h-4 w-4" : "h-3 w-3"
          )} />
        </Link>
      ))}
    </div>
  );
}

// Loading Indicator Component
function LoadingIndicator({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="flex gap-3 justify-start">
      <div className={cn(
        "flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10",
        isMobile ? "h-9 w-9" : "h-8 w-8"
      )}>
        <Bot className={cn("text-primary", isMobile ? "h-5 w-5" : "h-4 w-4")} />
      </div>
      <div className={cn("bg-muted rounded-2xl rounded-bl-md", isMobile ? "px-5 py-3" : "px-4 py-2")}>
        <div className="flex gap-1.5">
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]", isMobile ? "h-2.5 w-2.5" : "h-2 w-2")} />
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]", isMobile ? "h-2.5 w-2.5" : "h-2 w-2")} />
          <div className={cn("bg-muted-foreground/60 rounded-full animate-bounce", isMobile ? "h-2.5 w-2.5" : "h-2 w-2")} />
        </div>
      </div>
    </div>
  );
}

// Suggested Questions Component
function SuggestedQuestions({ 
  onSelect, 
  isMobile = false 
}: { 
  onSelect: (text: string) => void; 
  isMobile?: boolean;
}) {
  return (
    <div className="space-y-3 mb-4">
      <p className={cn(
        "font-medium text-muted-foreground px-1",
        isMobile ? "text-sm" : "text-xs"
      )}>
        Quick questions:
      </p>
      <div className={cn(
        "grid gap-2",
        isMobile ? "grid-cols-2" : "flex flex-wrap gap-1.5"
      )}>
        {suggestedQuestions.map((suggestion, idx) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelect(suggestion.fullText)}
              className={cn(
                'text-left rounded-xl border border-border bg-muted/50',
                'hover:bg-muted hover:border-primary/50',
                'active:scale-[0.98]',
                'transition-all duration-200',
                'flex items-center gap-2',
                'group',
                isMobile 
                  ? 'px-4 py-3 text-sm' 
                  : 'px-2.5 py-1.5 text-xs rounded-md'
              )}
            >
              <div className={cn(
                "rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors",
                isMobile ? "p-2" : "p-1"
              )}>
                <Icon className={cn(
                  "text-primary shrink-0 group-hover:scale-110 transition-transform",
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                )} />
              </div>
              <span className="text-foreground group-hover:text-primary transition-colors">
                {suggestion.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const [isMobile, setIsMobile] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mobileInputRef = React.useRef<HTMLInputElement>(null);
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = React.useRef(true);

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMobile) {
          mobileInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, isMobile]);

  React.useEffect(() => {
    // Refocus input when loading completes
    if (!isLoading && isOpen) {
      const timer = setTimeout(() => {
        if (isMobile) {
          mobileInputRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, isOpen, isMobile]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !isMobile &&
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        buttonContainerRef.current &&
        !buttonContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile]);

  const handleQuestionClick = (question: string) => {
    setInput(question);
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSubmitWithQuestion(question);
    }, 100);
  };

  const handleSubmitWithQuestion = async (questionOverride?: string) => {
    const questionToSubmit = (questionOverride || input).trim();
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
    shouldAutoScrollRef.current = true;

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
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

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
    } catch {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithQuestion();
  };

  // Mobile Drawer Content
  const MobileDrawerContent = () => (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar"
      >
        {messages.length === 1 && (
          <SuggestedQuestions onSelect={handleQuestionClick} isMobile={true} />
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <MessageBubble message={message} isMobile={true} />
            {message.role === 'assistant' && message.suggestedPages && message.suggestedPages.length > 0 && (
              <PageSuggestions 
                pages={message.suggestedPages} 
                onClose={() => setIsOpen(false)} 
                isMobile={true}
              />
            )}
          </div>
        ))}
        {isLoading && !messages.some(m => m.isStreaming && m.content) && (
          <LoadingIndicator isMobile={true} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            ref={mobileInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Amine..."
            disabled={isLoading}
            className="flex-1 h-12 text-base rounded-full px-5 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
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
            className="h-12 w-12 rounded-full shrink-0 shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );

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
        {/* Label - Hidden on mobile */}
        <div className="hidden md:block bg-card border border-border rounded-full px-4 py-2 shadow-lg">
          <p className="text-sm text-foreground whitespace-nowrap flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Ask about Amine
          </p>
        </div>
        
        {/* Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'rounded-full shadow-xl',
            'bg-primary hover:bg-primary/90 text-primary-foreground',
            'transition-all duration-300 ease-in-out',
            'hover:scale-110 active:scale-95',
            'ring-2 ring-primary/20 ring-offset-2 ring-offset-background',
            'flex-shrink-0',
            // Larger on mobile for better touch target
            'h-14 w-14 md:h-14 md:w-14'
          )}
          aria-label="Open Amine Buddy - AI Copilot"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
          </div>
        </Button>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[85vh] max-h-[85vh]">
            <DrawerHeader className="border-b border-border pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <Sparkles className="absolute -top-0.5 -right-0.5 h-3 w-3 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <DrawerTitle className="text-base">Amine Buddy</DrawerTitle>
                    <p className="text-xs text-muted-foreground">Your portfolio guide</p>
                  </div>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <MobileDrawerContent />
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop Chat Window */}
      {!isMobile && (
        <div
          ref={widgetRef}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-[400px] max-w-[calc(100vw-3rem)]',
            'h-[650px] max-h-[calc(100vh-8rem)]',
            'bg-card border border-border rounded-2xl shadow-2xl',
            'flex flex-col transition-all duration-300 ease-in-out',
            'backdrop-blur-sm',
            'overflow-hidden',
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <Sparkles className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-yellow-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Amine Buddy</h3>
                <p className="text-xs text-muted-foreground">Ask me anything</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
              aria-label="Close Amine Buddy"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div 
            ref={!isMobile ? messagesContainerRef : undefined}
            onScroll={!isMobile ? handleScroll : undefined}
            className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0"
          >
            {messages.length === 1 && (
              <SuggestedQuestions onSelect={handleQuestionClick} isMobile={false} />
            )}
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <MessageBubble message={message} isMobile={false} />
                {message.role === 'assistant' && message.suggestedPages && message.suggestedPages.length > 0 && (
                  <PageSuggestions 
                    pages={message.suggestedPages} 
                    onClose={() => setIsOpen(false)} 
                    isMobile={false}
                  />
                )}
              </div>
            ))}
            {isLoading && !messages.some(m => m.isStreaming && m.content) && (
              <LoadingIndicator isMobile={false} />
            )}
            <div ref={!isMobile ? messagesEndRef : undefined} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-muted/30 rounded-b-2xl">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 rounded-full px-4"
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
                className="shrink-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
