"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../Firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Classroom, saveGeneratedQuiz, QuizQuestion, getRoomTranscripts } from "../../../lib/firestore";
import DashboardNav from "../../components/DashboardNav";
import PageLoader from "../../components/PageLoader";

export default function CreateQuizPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"manual" | "llm">("manual");
  const [quizTitle, setQuizTitle] = useState("");
  
  // Manual Quiz State
  const [manualQuestions, setManualQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: "" }
  ]);
  
  // LLM Quiz State
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Authenticate and load classroom
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    async function loadClassroom() {
      try {
        setLoading(true);
        let roomData = null;

        if (db) {
          const q = query(collection(db, "classrooms"), where("roomCode", "==", roomCode));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            roomData = querySnapshot.docs[0].data() as Classroom;
          }
        } else {
          // Fallback demo rooms
          const savedRooms = localStorage.getItem("mindhub_demo_rooms");
          const rooms = savedRooms ? JSON.parse(savedRooms) : {};
          if (rooms[roomCode]) {
            roomData = rooms[roomCode] as Classroom;
          }
        }

        if (!roomData) {
          setError("Classroom not found.");
          setLoading(false);
          return;
        }

        // Only the teacher who created the classroom can build quizzes
        if (!user || roomData.teacherId !== user.uid) {
          setError("Access Denied: Only the class educator can create quizzes.");
          setLoading(false);
          return;
        }

        setClassroom(roomData);
        setQuizTitle(`${roomData.name} Quiz`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load classroom details.");
      } finally {
        setLoading(false);
      }
    }

    loadClassroom();
  }, [roomCode, user, authLoading, router]);

  if (loading || authLoading) {
    return <PageLoader message="Initializing Quiz Builder..." />;
  }

  if (error || !classroom) {
    return (
      <div style={{ background: "#121318", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <DashboardNav />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", borderRadius: "16px", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", marginBottom: "20px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>error</span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 12px 0", color: "#e3e1e9" }}>Error</h2>
            <p style={{ fontSize: "0.875rem", color: "#cbc3d5", lineHeight: "1.6", margin: "0 0 28px 0" }}>{error}</p>
            <button onClick={() => router.push("/dashboard")} style={{ background: "#cfbcff", color: "#090A0F", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Add question to manual quiz list
  const handleAddQuestion = () => {
    setManualQuestions([
      ...manualQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);
  };

  // Remove question from manual quiz list
  const handleRemoveQuestion = (index: number) => {
    if (manualQuestions.length === 1) return;
    setManualQuestions(manualQuestions.filter((_, i) => i !== index));
  };

  // Handle inputs for manual quiz questions
  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...manualQuestions];
    updated[index].question = val;
    setManualQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[optIndex] = val;
    setManualQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIndex: number, val: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].correctAnswer = val;
    setManualQuestions(updated);
  };

  // Submit manual quiz
  const handlePublishManualQuiz = async () => {
    setError("");
    if (!quizTitle.trim()) {
      setError("Please provide a Quiz Title.");
      return;
    }

    // Validate questions
    for (let i = 0; i < manualQuestions.length; i++) {
      const q = manualQuestions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          setError(`Option ${o + 1} for Question ${i + 1} cannot be empty.`);
          return;
        }
      }
      if (!q.correctAnswer) {
        setError(`Please select the correct answer for Question ${i + 1}.`);
        return;
      }
    }

    setIsGenerating(true);
    try {
      await saveGeneratedQuiz(classroom.roomCode, quizTitle.trim(), manualQuestions);
      setSuccess("Quiz published successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to publish quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate quiz using LLM
  const handleGenerateLLMQuiz = async () => {
    setError("");
    setSuccess("");
    setIsGenerating(true);
    try {
      // 1. Always fetch transcripts client-side
      const transcripts = await getRoomTranscripts(classroom.roomCode);
      if (transcripts.length === 0) {
        throw new Error("No transcription data available for this classroom. Please make sure the educator has spoken during the live session before generating a quiz.");
      }
      const transcriptsText = transcripts.map(t => `${t.speakerName}: ${t.text}`).join("\n");

      // 2. Fetch generated questions from API
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: classroom.roomCode,
          topic: topic.trim() || undefined,
          numQuestions: Number(numQuestions),
          transcriptsText
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      // 3. Save quiz to Firestore client-side where we have auth credentials
      const generatedTitle = topic.trim() ? `AI Quiz - ${topic.trim()}` : "Auto-Generated Lecture Quiz";
      await saveGeneratedQuiz(classroom.roomCode, generatedTitle, data.questions);

      setSuccess("Quiz generated and published successfully using AI!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate AI quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryBtn = {
    background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
    color: "#090A0F", border: "none", borderRadius: "8px", padding: "12px 24px",
    fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
    boxShadow: "0 0 16px rgba(160,124,254,0.25)",
  };

  const ghostBtn = {
    background: "rgba(255,255,255,0.03)", color: "#e3e1e9",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
    padding: "12px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
  };

  return (
    <div style={{ background: "#121318", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DashboardNav />

      <main style={{ flex: 1, padding: "32px", maxWidth: "800px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.68rem", color: "#cfbcff", background: "rgba(160,124,254,0.1)", border: "1px solid rgba(160,124,254,0.25)", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Quiz Builder
              </span>
            </div>
            <h1 className="signature-gradient" style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Create or Generate Quiz
            </h1>
            <p style={{ color: "#cbc3d5", fontSize: "0.95rem", marginTop: "6px", marginBottom: 0 }}>
              Classroom: <strong style={{ color: "#e3e1e9" }}>{classroom.name}</strong> · Room Code: <code style={{ color: "#cfbcff" }}>{classroom.roomCode}</code>
            </p>
          </div>
          <button onClick={() => router.push("/dashboard")} style={ghostBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
            Back to Dashboard
          </button>
        </div>

        {/* Method Toggle Segment Buttons */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "4px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <button
            onClick={() => { setMode("manual"); setError(""); setSuccess(""); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600,
              border: "none", cursor: "pointer",
              background: mode === "manual" ? "rgba(160, 124, 254, 0.15)" : "transparent",
              color: mode === "manual" ? "#cfbcff" : "#ccc3d4",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit_note</span>
            Create Yourself (Manual)
          </button>
          <button
            onClick={() => { setMode("llm"); setError(""); setSuccess(""); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "6px", fontSize: "0.875rem", fontWeight: 600,
              border: "none", cursor: "pointer",
              background: mode === "llm" ? "rgba(160, 124, 254, 0.15)" : "transparent",
              color: mode === "llm" ? "#cfbcff" : "#ccc3d4",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>psychology</span>
            Generate using AI (LLM)
          </button>
        </div>

        {/* Error/Success alerts */}
        {error && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#f87171", borderRadius: "8px", padding: "12px 16px", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>error</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid rgba(74, 222, 128, 0.25)", color: "#4ade80", borderRadius: "8px", padding: "12px 16px", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>check_circle</span>
            <span>{success}</span>
          </div>
        )}

        {/* Main Form container */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Manual Quiz Form */}
          {mode === "manual" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>QUIZ TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Core Concepts Quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  style={{
                    width: "100%", padding: "12px 16px", background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                    color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                  }}
                />
              </div>

              {/* Questions List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {manualQuestions.map((q, idx) => (
                  <div key={idx} style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                    
                    {/* Delete Q Button */}
                    {manualQuestions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(idx)}
                        style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "#f87171", cursor: "pointer", display: "flex" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>delete</span>
                      </button>
                    )}

                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#cfbcff", letterSpacing: "0.05em" }}>QUESTION {idx + 1}</span>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#968e9d" }}>QUESTION TEXT</label>
                      <input
                        type="text"
                        placeholder="e.g. What is Newton's first law of motion?"
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                        style={{
                          width: "100%", padding: "12px 14px", background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px",
                          color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                        }}
                      />
                    </div>

                    {/* Options */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#968e9d" }}>OPTION {String.fromCharCode(65 + optIdx)}</label>
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                            style={{
                              width: "100%", padding: "10px 14px", background: "rgba(255, 255, 255, 0.02)",
                              border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px",
                              color: "#e2e1eb", fontSize: "0.85rem", outline: "none"
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer Selector */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                      <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#968e9d" }}>CORRECT ANSWER</label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleCorrectAnswerSelect(idx, e.target.value)}
                        style={{
                          width: "100%", padding: "12px", background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                          color: "#e3e1e9", fontSize: "0.875rem", outline: "none", cursor: "pointer"
                        }}
                      >
                        <option value="" style={{ background: "#1a1b21" }}>-- Select correct option --</option>
                        {q.options.map((opt, optIdx) => (
                          <option
                            key={optIdx}
                            value={opt}
                            disabled={!opt.trim()}
                            style={{ background: "#1a1b21" }}
                          >
                            Option {String.fromCharCode(65 + optIdx)} {opt.trim() ? `(${opt.substring(0, 30)})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                style={{
                  background: "rgba(160, 124, 254, 0.08)", color: "#cfbcff",
                  border: "1px dashed rgba(160, 124, 254, 0.3)", borderRadius: "8px",
                  padding: "12px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                Add Another Question
              </button>

              {/* Actions */}
              <div style={{ display: "flex", gap: "16px", width: "100%", marginTop: "12px" }}>
                <button
                  onClick={() => router.push("/dashboard")}
                  disabled={isGenerating}
                  style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishManualQuiz}
                  disabled={isGenerating}
                  style={{ ...primaryBtn, flex: 2, justifyContent: "center" }}
                >
                  {isGenerating ? "Publishing..." : "Publish Quiz"}
                </button>
              </div>
            </div>
          )}

          {/* LLM Quiz Form */}
          {mode === "llm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>QUIZ TOPIC / KEYWORDS (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. Mitosis, Factoring Quadratics, Periodic Table..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  style={{
                    width: "100%", padding: "14px 16px", background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                    color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                  }}
                />
                <span style={{ fontSize: "0.775rem", color: "#968e9d", lineHeight: "1.5" }}>
                  The quiz will be generated strictly using the recorded lecture transcripts. Specify a topic or keywords to focus the questions on relevant parts of the transcript, or leave blank to cover all spoken topics.
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>NUMBER OF QUESTIONS (1-20)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                  style={{
                    width: "100%", padding: "14px 16px", background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                    color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "16px", width: "100%", marginTop: "12px" }}>
                <button
                  onClick={() => router.push("/dashboard")}
                  disabled={isGenerating}
                  style={{ ...ghostBtn, flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateLLMQuiz}
                  disabled={isGenerating}
                  style={{ ...primaryBtn, flex: 2, justifyContent: "center" }}
                >
                  {isGenerating ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid #090A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Generating AI Quiz...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
                      Generate AI Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
