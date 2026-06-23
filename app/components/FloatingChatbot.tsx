"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm EduAgent AI, your personal study assistant. What are we learning today?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", height: "500px", width: "360px" }}
            className="mb-4 rounded-3xl border border-white/10 bg-black/40 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden"
          >
            {/* Messages Area — grows to fill space */}
            <div
              style={{ flex: "1 1 0", overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "12px 20px",
                      fontSize: "0.9rem",
                      lineHeight: "1.6",
                      borderRadius: msg.role === "user" ? "24px 24px 4px 24px" : "24px 24px 24px 4px",
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                        : "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "14px 20px", borderRadius: "24px 24px 24px 4px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <motion.div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(124,58,237,0.8)" }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(124,58,237,0.8)" }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(124,58,237,0.8)" }} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input — fixed at bottom, never grows */}
            <div
              style={{
                flexShrink: 0,
                padding: "16px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <form onSubmit={handleChatSubmit} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  style={{
                    width: "100%",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "14px 56px 14px 20px",
                    fontSize: "0.875rem",
                    color: "white",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={isTyping || !chatInput.trim()}
                  style={{
                    position: "absolute",
                    right: "6px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    opacity: isTyping || !chatInput.trim() ? 0.5 : 1,
                  }}
                >
                  <Send style={{ width: 16, height: 16 }} strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: isOpen ? "rgba(0,0,0,0.4)" : "linear-gradient(135deg, #7c3aed, #4ade80)",
          border: isOpen ? "1px solid rgba(255,255,255,0.1)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
          boxShadow: "0 0 30px rgba(124,58,237,0.3)",
        }}
      >
        {isOpen ? <X style={{ width: 24, height: 24 }} /> : <MessageSquare style={{ width: 24, height: 24 }} />}
      </motion.button>
    </div>
  );
}
