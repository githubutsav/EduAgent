import { useState } from "react";
import { Quiz, submitQuizResult } from "../../lib/firestore";
import { useAuth } from "../context/AuthContext";

interface TakeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  onQuizSubmitted: () => void;
}

export default function TakeQuizModal({ isOpen, onClose, quiz, onQuizSubmitted }: TakeQuizModalProps) {
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !quiz || !user) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let correctCount = 0;
    const answersToSave = quiz.questions.map((q, idx) => {
      const studentAnswer = selectedAnswers[idx] || "";
      const isCorrect = studentAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        question: q.question,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    try {
      await submitQuizResult(
        quiz.id!, 
        quiz.roomId, 
        user.uid, 
        user.displayName || "Student", 
        score, 
        answersToSave
      );
      
      setIsSubmitting(false);
      onQuizSubmitted(); // Parent component will refresh data
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit quiz. Please try again.");
      setIsSubmitting(false);
    }
  };

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === quiz.questions.length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(3, 3, 5, 0.8)", backdropFilter: "blur(8px)" }} />
      
      <div className="glass-card" style={{ position: "relative", width: "100%", maxWidth: "600px", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        
        {/* Header */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>{quiz.title}</h2>
            <span style={{ fontSize: "0.85rem", color: "#cfbcff", background: "rgba(160,124,254,0.15)", padding: "4px 10px", borderRadius: "12px", fontWeight: 600 }}>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #A07CFE, #cfbcff)", borderRadius: "3px", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Question Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "10px" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#e3e1e9", lineHeight: "1.5", fontWeight: 500, margin: 0 }}>
            {currentQuestion.question}
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {currentQuestion.options.map((opt, i) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === opt;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: opt }))}
                  style={{
                    textAlign: "left",
                    padding: "16px 20px",
                    background: isSelected ? "rgba(160,124,254,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSelected ? "rgba(160,124,254,0.5)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px",
                    color: isSelected ? "#cfbcff" : "#e3e1e9",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div style={{ 
                    width: "20px", height: "20px", borderRadius: "50%", 
                    border: `2px solid ${isSelected ? "#cfbcff" : "rgba(255,255,255,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {isSelected && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#cfbcff" }} />}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
            style={{ 
              background: "none", border: "none", color: currentQuestionIndex === 0 ? "rgba(255,255,255,0.2)" : "#cfbcff", 
              fontSize: "0.9rem", fontWeight: 600, cursor: currentQuestionIndex === 0 ? "default" : "pointer",
              display: "flex", alignItems: "center", gap: "4px"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span> Previous
          </button>
          
          {!isLastQuestion ? (
            <button 
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestionIndex]}
              style={{
                background: "rgba(160,124,254,0.1)", color: "#cfbcff", border: "1px solid rgba(160,124,254,0.25)",
                borderRadius: "8px", padding: "8px 20px", fontSize: "0.9rem", fontWeight: 600, 
                cursor: !selectedAnswers[currentQuestionIndex] ? "not-allowed" : "pointer",
                opacity: !selectedAnswers[currentQuestionIndex] ? 0.5 : 1, display: "flex", alignItems: "center", gap: "4px"
              }}
            >
              Next <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              style={{
                background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
                color: "#090A0F", border: "none", borderRadius: "8px", padding: "8px 20px", 
                fontSize: "0.9rem", fontWeight: 700, 
                cursor: (!allQuestionsAnswered || isSubmitting) ? "not-allowed" : "pointer",
                opacity: (!allQuestionsAnswered || isSubmitting) ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
              {!isSubmitting && <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
