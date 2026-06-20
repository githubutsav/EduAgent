"use client";

import { useState, useEffect, useRef } from "react";

import { QuizResult } from "../../lib/firestore";

interface QuizReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizResult | null;
}

export default function QuizReviewModal({ isOpen, onClose, quiz }: QuizReviewModalProps) {
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const contentEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll AI analysis
  useEffect(() => {
    if (contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysis]);

  const generateAnalysis = async (quizData: QuizResult) => {
    setIsAnalyzing(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch("/api/analyze-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizTitle: quizData.title, questions: quizData.answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to AI server.");
      }

      if (!response.body) throw new Error("No response body");

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) setAnalysis((prev) => prev + finalChunk);
          break;
        }
        const chunkValue = decoder.decode(value, { stream: true });
        if (chunkValue) setAnalysis((prev) => prev + chunkValue);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong generating the analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (isOpen && quiz && !analysis && !isAnalyzing) {
      generateAnalysis(quiz);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, quiz]);

  if (!isOpen || !quiz) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      />

      <div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1100px",
          height: "85vh",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(160,124,254,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>
              {quiz.title} <span style={{ color: "#948e9f", fontWeight: 500, fontSize: "1rem" }}>Review</span>
            </h2>
            <div style={{ fontSize: "0.85rem", color: "#cbc3d5", marginTop: "4px" }}>
              Score: <span style={{ color: quiz.score >= 70 ? "#4ade80" : "#f87171", fontWeight: 700 }}>{quiz.score}%</span> • {quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'Recently'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", border: "none", color: "#e3e1e9",
              width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Content area: Two Columns */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* Left Column: Questions Revisit */}
          <div style={{ flex: "1 1 50%", padding: "24px 32px", overflowY: "auto", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#cfbcff", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>fact_check</span>
              Your Answers
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {quiz.answers.map((q, idx) => (
                <div key={idx} style={{ 
                  background: q.isCorrect ? "rgba(74, 222, 128, 0.05)" : "rgba(248, 113, 113, 0.05)",
                  border: `1px solid ${q.isCorrect ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"}`,
                  borderRadius: "12px", padding: "16px"
                }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "0.95rem", color: "#e3e1e9", lineHeight: "1.4" }}>
                    <strong>Q{idx + 1}.</strong> {q.question}
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "#948e9f", width: "80px" }}>You answered:</span>
                      <span style={{ color: q.isCorrect ? "#4ade80" : "#f87171", fontWeight: 600 }}>{q.studentAnswer}</span>
                    </div>
                    
                    {!q.isCorrect && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{ color: "#948e9f", width: "80px" }}>Correct:</span>
                        <span style={{ color: "#4ade80", fontWeight: 600 }}>{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Groq AI Analysis */}
          <div style={{ flex: "1 1 50%", padding: "24px 32px", overflowY: "auto", background: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#38bdf8", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>auto_awesome</span>
              AI Tutor Analysis
            </h3>

            {error ? (
              <div style={{ background: "rgba(248, 113, 113, 0.1)", color: "#f87171", padding: "16px", borderRadius: "12px", border: "1px solid rgba(248, 113, 113, 0.2)" }}>
                {error}
              </div>
            ) : (
              <div style={{ 
                color: "#e3e1e9", fontSize: "0.95rem", lineHeight: "1.6", 
                whiteSpace: "pre-wrap", paddingBottom: "20px" 
              }}>
                {analysis}
                {isAnalyzing && (
                  <span style={{ 
                    display: "inline-block", width: "8px", height: "16px", 
                    background: "#38bdf8", marginLeft: "4px", animation: "blink 1s infinite" 
                  }} />
                )}
                <div ref={contentEndRef} />
              </div>
            )}
          </div>

        </div>
      </div>
      <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}
