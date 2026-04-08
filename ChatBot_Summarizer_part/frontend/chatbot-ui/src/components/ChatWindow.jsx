import { useEffect, useRef, useState } from "react";
import MessageBlock from "./MessageBlock";

function ChatWindow({ messages, loading }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Detect whether user is at bottom
  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      const threshold = 100; // px tolerance
      const atBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        threshold;
      setIsAtBottom(atBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll only if user is already near bottom
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isAtBottom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50"
    >
      <div className="space-y-8">

        {messages.map((msg) => (
          <MessageBlock key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-lg px-6 py-5 shadow-sm border-l-4 border-l-blue-500">
            <div className="text-sm text-slate-600 animate-pulse">
              Retrieving information from patient record...
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </div>
    </div>
  );
}

export default ChatWindow;
