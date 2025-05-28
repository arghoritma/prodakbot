
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
// Import the generateResponse function; it's a server action, so it can be imported directly.
import { generateResponse } from '@/ai/flows/generate-response';
import { Input } from '@/components/ui/input';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      // The viewport is the first child of the ScrollArea's root element
      const viewport = scrollAreaRef.current.firstChild as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
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

    try {
      const aiResponse = await generateResponse({ message: messageContent });
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(), // Ensure unique ID
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
    } finally {
      setIsLoading(false);
       setTimeout(() => inputRef.current?.focus(), 0);
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
    <Card className="w-full max-w-2xl flex-1 flex flex-col rounded-xl overflow-hidden border-border shadow-2xl min-h-[350px] sm:min-h-[450px]">
      <CardHeader className="bg-primary text-primary-foreground p-4 border-b border-primary-foreground/20">
        <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-3">
          <BotIcon size={28} /> ProdakBot
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden bg-background">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 sm:p-6 space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <BotIcon size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] p-3 rounded-lg shadow-md transition-all duration-300 ease-in-out ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-card text-card-foreground border border-border rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.role === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-2 -ml-1 h-7 w-7 text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100"
                      onClick={() => handleCopyResponse(msg.content)}
                      aria-label="Copy response"
                    >
                      <Copy size={14} />
                    </Button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <UserIcon size={18} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2.5 justify-start">
                 <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <BotIcon size={18} />
                    </AvatarFallback>
                  </Avatar>
                <div className="max-w-[75%] p-3 rounded-lg bg-card text-card-foreground border border-border rounded-bl-none flex items-center space-x-2 shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">ProdakBot is thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2 sm:gap-3">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask ProdakBot anything..."
          className="flex-1 text-sm h-10 bg-background focus:bg-card transition-colors"
          disabled={isLoading}
          aria-label="Chat input"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="rounded-full w-10 h-10 shrink-0">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </Card>
  );
}
