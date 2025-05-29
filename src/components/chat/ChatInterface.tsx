
"use client";

import type { FormEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '@/ai/flows/generate-response';
import { Textarea } from '@/components/ui/textarea'; // Changed from Input
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Copy, Bot as BotIcon, User as UserIcon, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-greeting',
      role: 'assistant',
      content: "Hello! I'm ProdakBot. How can I help you today?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Changed from inputRef

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.firstChild as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height for textarea, e.g., 8rem (128px if 1rem=16px) or 5 rows
      const maxHeight = 5 * 24; // Assuming line height around 24px
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async (e?: FormEvent) => { // Allow calling without event for Enter key
    if (e) e.preventDefault();
    const messageContent = inputValue.trim();
    if (!messageContent) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    try {
      const aiResponse = await generateResponse({ message: messageContent });
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Sorry, I couldn't get a response. Please try again.",
      });
      const lastUserMessageIndex = messages.length; // before new user message was added
      // Optional: remove the user message if AI fails or add an error message from bot
      // For now, we keep the user message and show a toast.
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  };
  
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyResponse = (text: string) => {
    if (!navigator.clipboard) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Clipboard API not available in this browser.",
      });
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Response copied to clipboard.",
          className: "bg-accent text-accent-foreground border-accent"
        });
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy response to clipboard.",
        });
      });
  };

  return (
    <Card className="w-full h-full flex flex-col bg-card md:shadow-xl md:rounded-xl overflow-hidden border-border md:border">
      <CardHeader className="bg-card p-3 sm:p-4 border-b border-border">
        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <BotIcon size={24} /> ProdakBot
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 sm:p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2.5 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="w-7 h-7 border border-border shadow-sm shrink-0 mt-0.5">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <BotIcon size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`relative max-w-[85%] p-2.5 px-3.5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-lg' 
                    : 'bg-secondary text-secondary-foreground rounded-bl-lg border border-border/70'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.role === 'assistant' && msg.id !== 'initial-greeting' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-70 focus-visible:opacity-100 transition-opacity duration-150"
                      onClick={() => handleCopyResponse(msg.content)}
                      aria-label="Copy response"
                    >
                      <Copy size={13} />
                    </Button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="w-7 h-7 border border-border shadow-sm shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">
                      <UserIcon size={16} className="text-primary"/>
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start">
                 <Avatar className="w-7 h-7 border border-border shadow-sm shrink-0 mt-0.5">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <BotIcon size={16} />
                    </AvatarFallback>
                  </Avatar>
                <div className="max-w-[85%] p-2.5 px-3.5 rounded-2xl bg-secondary text-secondary-foreground border border-border/70 flex items-center space-x-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">ProdakBot is thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 border-t border-border bg-card/80 backdrop-blur-sm flex items-end gap-2 sm:gap-2.5">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Ask ProdakBot anything..."
          className="flex-1 text-sm py-2.5 px-3.5 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary resize-none overflow-y-auto max-h-36 leading-relaxed" // Changed overflow-y-hidden to auto and max-h
          rows={1}
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="rounded-lg w-9 h-9 shrink-0 self-end mb-[3px]">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </Card>
  );
}
