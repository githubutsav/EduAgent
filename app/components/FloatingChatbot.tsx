"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI Study Assistant. What are we learning today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMsg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const apiMessages = [...messages, { role: "user", text: userMsg }]
        .filter((m, idx) => !(idx === 0 && m.role === "ai"))
        .map((m) => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.text,
        }));

      apiMessages.unshift({
        role: "system",
        content: "You are a helpful, encouraging AI Study Assistant. Explain concepts simply and guide the student.",
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      setMessages((prev) => [...prev, { role: "ai", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            setMessages((prev) => {
              const newMsgs = [...prev];
              const lastIndex = newMsgs.length - 1;
              newMsgs[lastIndex] = { ...newMsgs[lastIndex], text: newMsgs[lastIndex].text + finalChunk };
              return newMsgs;
            });
          }
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMessages((prev) => {
            const newMsgs = [...prev];
            const lastIndex = newMsgs.length - 1;
            newMsgs[lastIndex] = { ...newMsgs[lastIndex], text: newMsgs[lastIndex].text + chunk };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl backdrop-blur-xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-container to-secondary shadow-inner">
                  <Bot className="h-5 w-5 text-background-deep" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-tertiary" /> Always here to help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-primary text-background-deep rounded-br-sm"
                        : "bg-white/5 text-on-surface rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[85%] items-center gap-1 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-on-surface-variant">
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-on-surface-variant"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-on-surface-variant"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-on-surface-variant"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleChatSubmit} className="border-t border-white/10 bg-background/50 p-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-5 pr-12 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                />
                <button
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-background-deep transition-transform hover:scale-105 disabled:scale-100 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 -ml-0.5" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-surface border border-white/10" : "bg-gradient-to-tr from-primary-container to-secondary"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-background-deep" />
        )}
      </motion.button>
    </div>
  );
}
