'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { queryRAGAgentServerAction } from '@/app/actions/queryRAGAgentServerAction';
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
  suggestedPages?: PageSuggestion[];
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
      content: `Hey! 👋 I'm Amine Buddy, your friendly guide to Amine's portfolio. I know all about his skills, experience at Intelswift, projects, and the tech he works with.\n\nWhether you're a CEO, recruiter, or just exploring ask me anything! What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const buttonContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await queryRAGAgentServerAction(questionToSubmit);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.success 
          ? (result.answer || 'I apologize, but I could not generate a response. Please try rephrasing your question.')
          : `I apologize, but I encountered an issue: ${result.error}. Please try rephrasing your question or explore the portfolio pages directly.`,
        timestamp: new Date(),
      };

      if (result.success && result.suggestedPages) {
        assistantMessage.suggestedPages = result.suggestedPages;
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again, or feel free to explore the portfolio pages for more information.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0">
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
                  <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">{message.content}</p>
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
          {isLoading && (
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

