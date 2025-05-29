
import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  return (
    <main className="flex h-dvh flex-col items-center bg-muted text-foreground">
      {/* This div constrains ChatInterface on md+ screens and provides vertical padding */}
      <div className="w-full h-full md:max-w-3xl md:flex md:items-center md:justify-center md:py-4">
        <ChatInterface />
      </div>
    </main>
  );
}
