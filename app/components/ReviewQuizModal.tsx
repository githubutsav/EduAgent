"use client";

import { useState, useEffect } from "react";
import { QuizQuestion } from "../../lib/firestore";
import { toast } from "react-toastify";

interface ReviewQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestions: QuizQuestion[];
  onPublish: (title: string, questions: QuizQuestion[]) => Promise<void>;
  isPublishing: boolean;
}

export default function ReviewQuizModal({
  isOpen,
  onClose,
  initialQuestions,
  onPublish,
  isPublishing
}: ReviewQuizModalProps) {
  const [quizTitle, setQuizTitle] = useState("Auto-Generated Lecture Quiz");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuestions(JSON.parse(JSON.stringify(initialQuestions)));
      setQuizTitle("Auto-Generated Lecture Quiz");
    }
  }, [isOpen, initialQuestions]);

  if (!isOpen) return null;

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].question = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    const oldVal = updated[qIdx].options[optIdx];
    updated[qIdx].options[optIdx] = val;
    
    // Auto-update correct answer string if it was matching the old option text
    if (updated[qIdx].correctAnswer === oldVal) {
      updated[qIdx].correctAnswer = val;
    }
    setQuestions(updated);
  };

  const handleSelectCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].correctAnswer = updated[qIdx].options[optIdx];
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) {
      toast.warning("A quiz must have at least one question.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handlePublishClick = async () => {
    // 1. Validations
    if (!quizTitle.trim()) {
      toast.error("Quiz title cannot be empty.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          toast.error(`Option ${o + 1} for Question ${i + 1} cannot be empty.`);
          return;
        }
      }
      if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) {
        toast.error(`Please select the correct answer for Question ${i + 1}.`);
        return;
      }
    }

    try {
      await onPublish(quizTitle.trim(), questions);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish quiz.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(9, 10, 15, 0.75)",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal Container */}
      <div
        className="glass-card"
        style={{
          position: "relative",
          maxWidth: "750px",
          width: "100%",
          borderRadius: "16px",
          background: "#121318",
          border: "1px solid rgba(160, 124, 254, 0.25)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxHeight: "90vh",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>auto_awesome</span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Review & Edit AI Quiz</h3>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#cbc3d5", margin: 0 }}>
              Adjust questions, modify answer choices, and verify correctness before publishing to students.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            style={{
              background: "none",
              border: "none",
              color: "#948e9f",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#948e9f"}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Editor Container */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Title Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ccc3d4", letterSpacing: "0.05em" }}>QUIZ TITLE</label>
            <input
              type="text"
              placeholder="e.g. Lecture Core Concepts Quiz"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                color: "#e2e1eb",
                fontSize: "0.875rem",
                outline: "none"
              }}
            />
          </div>

          {/* List of Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  position: "relative"
                }}
              >
                {/* Delete Question Button */}
                <button
                  onClick={() => handleRemoveQuestion(idx)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    color: "#f87171",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    transition: "color 0.2s"
                  }}
                  title="Remove Question"
                  onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "#f87171"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                </button>

                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cfbcff", letterSpacing: "0.05em" }}>
                  QUESTION {idx + 1}
                </span>

                {/* Question Input */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#968e9d" }}>QUESTION TEXT</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      color: "#e2e1eb",
                      fontSize: "0.875rem",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Options Input list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#968e9d" }}>OPTIONS & CORRECT ANSWER</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctAnswer === opt && opt.trim() !== "";
                      return (
                        <div
                          key={optIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "8px",
                            padding: "4px 8px 4px 12px",
                            gap: "8px",
                            transition: "border 0.2s",
                            borderColor: isCorrect ? "rgba(160, 124, 254, 0.4)" : "rgba(255, 255, 255, 0.06)"
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#968e9d" }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px 0",
                              background: "none",
                              border: "none",
                              color: "#e2e1eb",
                              fontSize: "0.85rem",
                              outline: "none"
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          />
                          <button
                            onClick={() => handleSelectCorrectOption(idx, optIdx)}
                            disabled={!opt.trim()}
                            style={{
                              background: isCorrect ? "rgba(160, 124, 254, 0.15)" : "transparent",
                              color: isCorrect ? "#cfbcff" : "#5d5469",
                              border: "1px solid",
                              borderColor: isCorrect ? "rgba(160, 124, 254, 0.3)" : "rgba(255, 255, 255, 0.08)",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              cursor: opt.trim() ? "pointer" : "not-allowed",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                              {isCorrect ? "check_circle" : "circle"}
                            </span>
                            Correct
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            onClick={handleAddQuestion}
            style={{
              background: "rgba(160, 124, 254, 0.05)",
              color: "#cfbcff",
              border: "1px dashed rgba(160, 124, 254, 0.25)",
              borderRadius: "10px",
              padding: "14px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(160, 124, 254, 0.08)";
              e.currentTarget.style.borderColor = "rgba(160, 124, 254, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(160, 124, 254, 0.05)";
              e.currentTarget.style.borderColor = "rgba(160, 124, 254, 0.25)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
            Add Custom Question
          </button>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "20px",
            marginTop: "4px"
          }}
        >
          <button
            onClick={onClose}
            disabled={isPublishing}
            style={{
              flex: 1,
              background: "rgba(255, 255, 255, 0.03)",
              color: "#e3e1e9",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "12px 0",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
          >
            Discard Quiz
          </button>
          <button
            onClick={handlePublishClick}
            disabled={isPublishing}
            style={{
              flex: 2,
              background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
              color: "#090A0F",
              border: "none",
              borderRadius: "8px",
              padding: "12px 0",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: isPublishing ? "not-allowed" : "pointer",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 0 16px rgba(160, 124, 254, 0.25)",
              opacity: isPublishing ? 0.8 : 1,
              transition: "all 0.2s"
            }}
          >
            {isPublishing ? (
              <>
                <div style={{ width: "16px", height: "16px", border: "2px solid #090A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Publishing Quiz...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>publish</span>
                Publish Quiz to Students
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
