
import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <ChatInterface />
    </main>
  );
}
