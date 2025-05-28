
import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center min-h-dvh bg-background text-foreground p-2 sm:p-4">
      <ChatInterface />
    </main>
  );
}
