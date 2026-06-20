"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStudentClassrooms, joinClassroom, getStudentQuizzes, getStudentQuizResults, Classroom, Quiz, QuizResult } from "../../lib/firestore";
import DashboardNav from "./DashboardNav";
import PageLoader from "./PageLoader";
import QuickAlert from "./QuickAlert";
import QuizReviewModal from "./QuizReviewModal";
import TakeQuizModal from "./TakeQuizModal";

const statCards = [
  { label: "Learning Streak", value: "14 Days", delta: "+2 Days", deltaColor: "#4ade80", sub: "Personal Best: 21 Days", icon: "local_fire_department" },
  { label: "Assignments Completed", value: "48", delta: "3 This Week", deltaColor: "#cfbcff", sub: "On track for term goal", icon: "task_alt" },
  { label: "Average Score", value: "92%", delta: "+4%", deltaColor: "#4ade80", sub: "Compared to last month", icon: "leaderboard" },
  { label: "Attendance", value: "98%", delta: "Excellent", deltaColor: "#cfbcff", sub: "Perfect this week", icon: "event_available" },
];



export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [pastQuizzes, setPastQuizzes] = useState<QuizResult[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your AI Study Assistant. What are we learning today?" }
  ]);

  const [showAlert, setShowAlert] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  const refreshData = () => {
    if (user) {
      getStudentClassrooms(user.uid).then(setClassrooms).catch(console.error);
      getStudentQuizzes(user.uid).then(setUpcomingQuizzes).catch(console.error);
      getStudentQuizResults(user.uid).then(setPastQuizzes).catch(console.error);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setShowAlert(true), 1500);
      refreshData();
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Filter out quizzes that the student has already taken
  const pendingQuizzes = upcomingQuizzes.filter(
    (q) => !pastQuizzes.some((pq) => pq.quizId === q.id)
  );

  if (loading || !user) return <PageLoader message="Loading your dashboard..." />;

  const handleJoinClassroom = async () => {
    if (!joinRoomId.trim() || !user) return;
    setIsJoining(true);
    try {
      await joinClassroom(joinRoomId, user.uid);
      // Wait for join, then redirect to the room.
      router.push(`/classroom/${joinRoomId.trim().toLowerCase()}`);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    
    try {
      const apiMessages = [...messages, { role: 'user', text: userMsg }]
        .filter((m, idx) => !(idx === 0 && m.role === 'ai'))
        .map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text
        }));

      // Prepend system message for context and API compliance
      apiMessages.unshift({
        role: 'system',
        content: 'You are a helpful, encouraging AI Study Assistant. Explain concepts simply and guide the student.'
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      setMessages(prev => [...prev, { role: 'ai', text: "" }]); // Add empty AI message to stream into

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            setMessages(prev => {
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
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastIndex = newMsgs.length - 1;
            newMsgs[lastIndex] = { ...newMsgs[lastIndex], text: newMsgs[lastIndex].text + chunk };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const primaryBtn: React.CSSProperties = {
    background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
    color: "#090A0F", border: "none", borderRadius: "8px", padding: "10px 20px",
    fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
    boxShadow: "0 0 16px rgba(160,124,254,0.25)",
  };
  const ghostBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)", color: "#e3e1e9",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
    padding: "10px 20px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
  };

  return (
    <div style={{ background: "#121318", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DashboardNav />

      {showAlert && (
        <QuickAlert 
          title="New AI Insights Ready!" 
          message="Your Algebra Foundations Quiz analysis is ready to review. Let's tackle those weak areas!"
          onClose={() => setShowAlert(false)}
          duration={8000}
        />
      )}

      <QuizReviewModal 
        isOpen={!!selectedQuiz} 
        onClose={() => setSelectedQuiz(null)} 
        quiz={selectedQuiz} 
      />

      <TakeQuizModal
        isOpen={!!takingQuiz}
        onClose={() => setTakingQuiz(null)}
        quiz={takingQuiz}
        onQuizSubmitted={refreshData}
      />

      <main style={{ flex: 1, padding: "32px", maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* ── Welcome Banner ──────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{ borderRadius: "16px", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", boxShadow: "0 0 40px rgba(160,124,254,0.08)" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.68rem", color: "#38bdf8", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Student Dashboard
              </span>
            </div>
            <h1 className="signature-gradient" style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Welcome, {user.displayName ? user.displayName.split(" ")[0] : "Student"}!
            </h1>
            <p style={{ color: "#cbc3d5", fontSize: "0.95rem", marginTop: "6px", marginBottom: 0 }}>
              What will you learn today?
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/" style={{ ...ghostBtn, textDecoration: "none" } as React.CSSProperties}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>home</span>
              Home
            </Link>
          </div>
        </div>

        {/* ── Real Enrolled Classrooms Widget ───────────────────────────────── */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(56, 189, 248, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(56, 189, 248, 0.25)" }}>
                <span className="material-symbols-outlined" style={{ color: "#38bdf8", fontSize: "26px" }}>school</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>My Enrolled Classes</h3>
                <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: "4px 0 0 0" }}>Enter a code to join a new live class.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ position: "absolute", left: "12px", fontSize: "18px", color: "#948e9f" }}>key</span>
                <input
                  type="text"
                  placeholder="Room code (e.g. math-101)"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  style={{ padding: "10px 16px 10px 38px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", fontSize: "0.875rem", outline: "none", width: "230px" }}
                />
              </div>
              <button onClick={handleJoinClassroom} disabled={isJoining || !joinRoomId.trim()} style={{ ...primaryBtn, opacity: (isJoining || !joinRoomId.trim()) ? 0.5 : 1, cursor: (isJoining || !joinRoomId.trim()) ? "not-allowed" : "pointer" }}>
                {isJoining ? "Joining..." : "Join Class"}
              </button>
            </div>
          </div>

          {classrooms.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "10px" }}>
              {classrooms.map(c => (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>{c.name}</h4>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#948e9f" }}>Teacher: <strong style={{ color: "#e3e1e9" }}>{c.teacherName}</strong></div>
                  
                  <button onClick={() => router.push(`/classroom/${c.roomCode}`)} style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "6px", padding: "8px", fontSize: "0.825rem", fontWeight: 600, cursor: "pointer", width: "100%", marginTop: "auto", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)")}>
                    Enter Classroom
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "#948e9f", fontSize: "0.9rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px", marginTop: "10px" }}>
              You haven't enrolled in any classrooms yet. Use a code from your teacher to join!
            </div>
          )}
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {statCards.map((c) => (
            <div key={c.label} className="glass-card" style={{ borderRadius: "12px", padding: "24px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: "radial-gradient(circle, rgba(160,124,254,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#cbc3d5", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.label}</span>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>{c.icon}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
                <span style={{ fontSize: "1.875rem", fontWeight: 800, color: "#e3e1e9" }}>{c.value}</span>
                <span style={{ fontSize: "0.75rem", color: c.deltaColor, fontWeight: 600 }}>{c.delta}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#948e9f", marginTop: "8px" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }} className="lg:grid-cols-2">
          
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* ── Upcoming Assignments ──────────────────────────────────────────── */}
            <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>assignment</span>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Upcoming Assignments</h2>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Auto-generated quizzes from your recent live classes.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pendingQuizzes.length > 0 ? pendingQuizzes.map((quiz, i) => (
                  <div key={quiz.id || i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", color: "#e3e1e9", fontWeight: 600, margin: "0 0 4px 0" }}>{quiz.title}</h4>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "#948e9f" }}>
                        <span style={{ color: '#cfbcff' }}>{quiz.questions.length} Questions</span>
                        <span>•</span>
                        <span>Generated: {quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTakingQuiz(quiz)}
                      style={{ ...ghostBtn, padding: "8px 16px", fontSize: "0.8rem", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.2)", background: "rgba(74, 222, 128, 0.05)" }}
                    >
                      Start
                    </button>
                  </div>
                )) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#948e9f", fontSize: "0.85rem" }}>
                    No pending assignments. You are all caught up!
                  </div>
                )}
              </div>
            </div>

            {/* ── Quiz History & Analytics ──────────────────────────────────────── */}
            <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#4ade80", fontSize: "20px" }}>history</span>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Quiz History & Analytics</h2>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Review your performance and get AI-powered insights.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pastQuizzes.length > 0 ? pastQuizzes.map((quiz, i) => (
                  <div key={quiz.id || i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", color: "#e3e1e9", fontWeight: 600, margin: "0 0 4px 0" }}>{quiz.title}</h4>
                      <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", color: "#948e9f" }}>
                        <span>{quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                        <span>•</span>
                        <span style={{ color: quiz.score >= 70 ? "#4ade80" : "#f87171", fontWeight: 600 }}>Score: {quiz.score}%</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedQuiz(quiz)}
                      style={{ 
                        ...ghostBtn, padding: "8px 16px", fontSize: "0.8rem", 
                        background: quiz.score < 70 ? "rgba(160,124,254,0.15)" : "rgba(255,255,255,0.03)",
                        border: quiz.score < 70 ? "1px solid rgba(160,124,254,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        color: quiz.score < 70 ? "#cfbcff" : "#e3e1e9"
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>auto_awesome</span>
                      Analyze
                    </button>
                  </div>
                )) : (
                  <div style={{ padding: "20px", textAlign: "center", color: "#948e9f", fontSize: "0.85rem" }}>
                    No quiz history yet. Complete an upcoming assignment to see your results!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── AI Study Assistant ──────────────────────────────────────────── */}
          <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>smart_toy</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>AI Study Assistant</h2>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Ask questions or request concept explanations.</p>
            </div>

            <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "400px", overflowY: "auto" }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: "80%", 
                    padding: "10px 14px", 
                    borderRadius: "12px", 
                    background: msg.role === 'user' ? "rgba(160,124,254,0.2)" : "rgba(255,255,255,0.05)",
                    border: msg.role === 'user' ? "1px solid rgba(160,124,254,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    color: "#e3e1e9",
                    fontSize: "0.85rem",
                    borderBottomRightRadius: msg.role === 'user' ? "4px" : "12px",
                    borderBottomLeftRadius: msg.role === 'ai' ? "4px" : "12px"
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#948e9f", fontSize: "0.85rem" }}>
                    typing...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask me anything..." 
                style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", padding: "10px 16px", fontSize: "0.875rem", outline: "none" }}
              />
              <button type="submit" style={{ ...primaryBtn, padding: "10px" }} disabled={isTyping || !chatInput.trim()}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", margin: 0 }}>send</span>
              </button>
            </form>
          </div>
        </div>

      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 32px", textAlign: "center", marginTop: "auto" }}>
        <span style={{ fontSize: "0.72rem", color: "#948e9f" }}>© 2026 EduAgent AI. Secured workspace portal.</span>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
