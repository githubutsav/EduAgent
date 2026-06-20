"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClassroom, getTeacherClassrooms, getTeacherStudentsAnalytics, Classroom, getClassroomQuizzes, Quiz, updateClassroomQuiz, QuizQuestion } from "../../lib/firestore";
import DashboardNav from "../components/DashboardNav";
import PageLoader from "../components/PageLoader";

// The mockStudents array has been removed as we are now using real analytics data

const statCards = [
  { label: "Class Engagement", value: "94.2%", delta: "+0.8%", deltaColor: "#4ade80", sub: "vs weekly benchmark (93.4%)", icon: "groups" },
  { label: "AI Adaptive Plans", value: "48", delta: "12 new", deltaColor: "#cfbcff", sub: "Tailored adjustments applied", icon: "insights" },
  { label: "Active Curriculums", value: "8", delta: "Active", deltaColor: "#968e9d", sub: "Dynamic courses synced", icon: "menu_book" },
  { label: "Performance Score", value: "87.4%", delta: "+2.1%", deltaColor: "#4ade80", sub: "Growth over term average", icon: "monitoring" },
];

export default function TeacherDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [subject, setSubject] = useState("Mathematics");
  const [focusArea, setFocusArea] = useState("Algebra foundations & equations");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // Real Firestore Data States
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<any[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  
  // Quiz Creation States
  const [selectedClassroomForQuiz, setSelectedClassroomForQuiz] = useState<Classroom | null>(null);
  const [quizzesMap, setQuizzesMap] = useState<Record<string, Quiz[]>>({});
  const [activeViewQuiz, setActiveViewQuiz] = useState<Quiz | null>(null);
  
  // Quiz Editing States
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [editingQuizTitle, setEditingQuizTitle] = useState("");
  const [editingQuestions, setEditingQuestions] = useState<QuizQuestion[]>([]);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [editingError, setEditingError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getTeacherClassrooms(user.uid).then(setClassrooms).catch(console.error);
      getTeacherStudentsAnalytics(user.uid).then(data => {
        setStudentAnalytics(data);
        if (data.length > 0) setSelectedStudent(data[0]);
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (classrooms.length > 0) {
      classrooms.forEach(c => {
        getClassroomQuizzes(c.id).then(quizzes => {
          setQuizzesMap(prev => ({ ...prev, [c.id]: quizzes }));
        }).catch(console.error);
      });
    }
  }, [classrooms]);

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomForQuiz) {
      setSelectedClassroomForQuiz(classrooms[0]);
    }
  }, [classrooms, selectedClassroomForQuiz]);

  if (loading || !user) return <PageLoader message="Verifying secure session..." />;

  const handleCreateClassroom = async () => {
    if (!user || !newRoomName.trim()) return;
    setIsCreatingRoom(true);
    try {
      const newClass = await createClassroom(
        newRoomName.trim(), 
        "A dynamically created classroom", 
        user.uid, 
        user.displayName || "Educator"
      );
      setClassrooms([newClass, ...classrooms]);
      setNewRoomName("");
    } catch (error) {
      alert("Error creating room: " + (error as Error).message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleQuickQuizClick = async () => {
    if (!user) return;
    if (classrooms.length === 0) {
      setIsCreatingRoom(true);
      try {
        const newClass = await createClassroom(
          "My First Class", 
          "A default classroom created to host quizzes.", 
          user.uid, 
          user.displayName || "Educator"
        );
        setClassrooms([newClass]);
        setSelectedClassroomForQuiz(newClass);
        router.push(`/create-quiz/${newClass.roomCode}`);
      } catch (error) {
        alert("Failed to auto-create classroom: " + (error as Error).message);
      } finally {
        setIsCreatingRoom(false);
      }
    } else {
      if (selectedClassroomForQuiz) {
        router.push(`/create-quiz/${selectedClassroomForQuiz.roomCode}`);
      }
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusArea.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedPlan("");

    try {
      const prompt = `You are an expert AI curriculum planner. A teacher wants an adaptive curriculum for ${subject}. 
      The focus area is: ${focusArea}. 
      Provide a brief, actionable 3-step recommendation plan. Estimate an engagement boost percentage. Use Markdown format. Keep it extremely concise.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });

      if (!res.ok) throw new Error("Failed to generate plan");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          const finalChunk = decoder.decode();
          if (finalChunk) {
            setGeneratedPlan(prev => (prev || "") + finalChunk);
          }
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setGeneratedPlan(prev => (prev || "") + chunk);
        }
      }
    } catch (error) {
      console.error(error);
      setGeneratedPlan("⚠️ Failed to generate curriculum. Please check your AI API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ─── Quiz Editing Handlers ───────────────────────────────────── */
  const handleUpdateQuestionText = (index: number, val: string) => {
    const updated = [...editingQuestions];
    updated[index].question = val;
    setEditingQuestions(updated);
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...editingQuestions];
    const oldVal = updated[qIndex].options[optIndex];
    updated[qIndex].options[optIndex] = val;
    if (updated[qIndex].correctAnswer === oldVal) {
      updated[qIndex].correctAnswer = val;
    }
    setEditingQuestions(updated);
  };

  const handleUpdateCorrectAnswer = (qIndex: number, val: string) => {
    const updated = [...editingQuestions];
    updated[qIndex].correctAnswer = val;
    setEditingQuestions(updated);
  };

  const handleAddQuestionToQuiz = () => {
    setEditingQuestions([
      ...editingQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" }
    ]);
  };

  const handleRemoveQuestionFromQuiz = (index: number) => {
    if (editingQuestions.length === 1) return;
    setEditingQuestions(editingQuestions.filter((_, i) => i !== index));
  };

  const handleSaveQuizEdit = async () => {
    if (!activeViewQuiz) return;
    setEditingError("");
    
    if (!editingQuizTitle.trim()) {
      setEditingError("Quiz Title cannot be empty.");
      return;
    }

    for (let i = 0; i < editingQuestions.length; i++) {
      const q = editingQuestions[i];
      if (!q.question.trim()) {
        setEditingError(`Question ${i + 1} text cannot be empty.`);
        return;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) {
          setEditingError(`Option ${o + 1} for Question ${i + 1} cannot be empty.`);
          return;
        }
      }
      if (!q.correctAnswer) {
        setEditingError(`Please select the correct answer for Question ${i + 1}.`);
        return;
      }
    }

    setIsSavingQuiz(true);
    try {
      await updateClassroomQuiz(activeViewQuiz.roomId, activeViewQuiz.id!, editingQuizTitle.trim(), editingQuestions);
      
      const updatedQuiz = {
        ...activeViewQuiz,
        title: editingQuizTitle.trim(),
        questions: editingQuestions
      };
      
      const classroom = classrooms.find(c => c.roomCode === activeViewQuiz.roomId);
      if (classroom) {
        setQuizzesMap(prev => {
          const classroomQuizzes = prev[classroom.id] || [];
          const updatedList = classroomQuizzes.map(q => q.id === activeViewQuiz.id ? updatedQuiz : q);
          return { ...prev, [classroom.id]: updatedList };
        });
      }
      
      setActiveViewQuiz(updatedQuiz);
      setIsEditingQuiz(false);
    } catch (err: any) {
      console.error(err);
      setEditingError(err.message || "Failed to save quiz changes.");
    } finally {
      setIsSavingQuiz(false);
    }
  };

  /* ─── Shared button styles ─────────────────────────────────────── */
  const primaryBtn: React.CSSProperties = {
    background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
    color: "#090A0F", border: "none", borderRadius: "8px", padding: "10px 20px",
    fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s",
    boxShadow: "0 0 16px rgba(160,124,254,0.25)",
  };

  return (
    <div style={{ background: "#121318", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DashboardNav />

      <main style={{ flex: 1, padding: "32px", maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* ── Welcome Banner ──────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{ borderRadius: "16px", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px", boxShadow: "0 0 40px rgba(160,124,254,0.08)" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.68rem", color: "#cfbcff", background: "rgba(160,124,254,0.1)", border: "1px solid rgba(160,124,254,0.25)", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Educator Dashboard
              </span>
            </div>
            <h1 className="signature-gradient" style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Welcome, {user.displayName ? user.displayName.split(" ")[0] : "Educator"}!
            </h1>
            <p style={{ color: "#cbc3d5", fontSize: "0.95rem", marginTop: "6px", marginBottom: 0 }}>
              What's your plans for students today?
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={primaryBtn} onClick={() => alert("Classroom sync trigger simulated!")}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sync</span>
              Sync Roster
            </button>
          </div>
        </div>

        {/* ── Real Classrooms Widget ───────────────────────────────── */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(160,124,254,0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(160,124,254,0.25)" }}>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "26px" }}>video_chat</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>My Active Classrooms</h3>
                <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: "4px 0 0 0" }}>Create and manage real classrooms hosted on your database.</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="New Class Name (e.g. Physics 101)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                style={{ padding: "10px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", fontSize: "0.875rem", outline: "none", width: "250px" }}
              />
              <button onClick={handleCreateClassroom} disabled={isCreatingRoom || !newRoomName.trim()} style={{ ...primaryBtn, opacity: (isCreatingRoom || !newRoomName.trim()) ? 0.7 : 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_box</span>
                {isCreatingRoom ? "Creating..." : "Create Class"}
              </button>
            </div>
          </div>
          
          {classrooms.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "10px" }}>
              {classrooms.map(c => (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(160,124,254,0.2)", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>{c.name}</h4>
                    <span style={{ fontSize: "0.7rem", color: "#cfbcff", background: "rgba(160,124,254,0.1)", padding: "2px 8px", borderRadius: "4px", fontWeight: 600 }}>{c.students?.length || 0} Students</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "#cbc3d5", background: "rgba(0,0,0,0.2)", padding: "6px 10px", borderRadius: "6px", width: "fit-content" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#948e9f" }}>vpn_key</span>
                    Room Code: <strong style={{ color: "#4ade80", letterSpacing: "1px" }}>{c.roomCode}</strong>
                  </div>
                  <button onClick={() => router.push(`/classroom/${c.roomCode}`)} style={{ background: "rgba(160,124,254,0.1)", color: "#cfbcff", border: "1px solid rgba(160,124,254,0.2)", borderRadius: "6px", padding: "8px", fontSize: "0.825rem", fontWeight: 600, cursor: "pointer", width: "100%", marginTop: "4px", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,124,254,0.2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160,124,254,0.1)")}>
                    Enter Classroom
                  </button>
                  {quizzesMap[c.id] && quizzesMap[c.id].length > 0 ? (
                    <button
                      onClick={() => {
                        const q = quizzesMap[c.id][0];
                        setActiveViewQuiz(q);
                        setEditingQuizTitle(q.title);
                        setEditingQuestions(JSON.parse(JSON.stringify(q.questions)));
                        setIsEditingQuiz(false);
                        setEditingError("");
                      }}
                      style={{
                        background: "rgba(74, 222, 128, 0.15)",
                        color: "#4ade80",
                        border: "1px solid rgba(74, 222, 128, 0.35)",
                        borderRadius: "6px",
                        padding: "8px",
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        marginTop: "4px"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74, 222, 128, 0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(74, 222, 128, 0.15)")}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>visibility</span>
                      View Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        router.push(`/create-quiz/${c.roomCode}`);
                      }}
                      style={{
                        background: "rgba(160, 124, 254, 0.15)",
                        color: "#cfbcff",
                        border: "1px solid rgba(160, 124, 254, 0.35)",
                        borderRadius: "6px",
                        padding: "8px",
                        fontSize: "0.825rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        marginTop: "4px"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160, 124, 254, 0.25)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160, 124, 254, 0.15)")}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>assignment_add</span>
                      Generate Quiz
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "#948e9f", fontSize: "0.9rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px", marginTop: "10px" }}>
              You haven't created any classrooms yet. Use the form above to create one!
            </div>
          )}
        </div>

        {/* ── Generate Quiz Action Card ────────────────────────────── */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", border: "1px solid rgba(160,124,254,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(160,124,254,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(160,124,254,0.3)" }}>
              <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "26px" }}>assignment_add</span>
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Quick Quiz Creator</h3>
              <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: "4px 0 0 0" }}>Draft questions manually or auto-generate a quiz for any of your classrooms.</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {classrooms.length > 0 && (
              <select 
                onChange={(e) => {
                  const selected = classrooms.find(c => c.id === e.target.value);
                  if (selected) setSelectedClassroomForQuiz(selected);
                }}
                value={selectedClassroomForQuiz?.id || ""}
                style={{ padding: "10px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", fontSize: "0.875rem", outline: "none", width: "220px", cursor: "pointer" }}
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id} style={{ background: "#1a1b21" }}>{c.name}</option>
                ))}
              </select>
            )}
            <button 
              onClick={handleQuickQuizClick}
              disabled={isCreatingRoom}
              style={primaryBtn}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>bolt</span>
              {isCreatingRoom && classrooms.length === 0 ? "Creating Classroom..." : "Generate Quiz"}
            </button>
          </div>
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

        {/* ── AI Generator + Analytics ────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }} className="lg:grid-cols-2">

          {/* AI Curriculum Generator */}
          <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>psychology</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>AI Adaptive Plan Generator</h2>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Generate customized intervention scripts for distinct student segments.</p>
            </div>

            <form onSubmit={handleGeneratePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#cbc3d5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Select Subject</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", padding: "10px", fontSize: "0.875rem", outline: "none", cursor: "pointer" }}>
                    <option value="Mathematics" style={{ background: "#1a1b21" }}>Mathematics</option>
                    <option value="Science" style={{ background: "#1a1b21" }}>Science</option>
                    <option value="Literature" style={{ background: "#1a1b21" }}>Literature</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#cbc3d5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Classroom Size</label>
                  <input type="text" disabled value="24 Students" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px", color: "#948e9f", padding: "10px", fontSize: "0.875rem", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#cbc3d5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Focus Concepts</label>
                <input type="text" value={focusArea} onChange={(e) => setFocusArea(e.target.value)} placeholder="e.g. Algebra foundations" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e3e1e9", padding: "10px 12px", fontSize: "0.875rem", outline: "none" }} />
              </div>

              <button type="submit" disabled={isGenerating || !focusArea.trim()} style={{ ...primaryBtn, justifyContent: "center", padding: "12px", opacity: (isGenerating || !focusArea.trim()) ? 0.7 : 1, cursor: (isGenerating || !focusArea.trim()) ? "not-allowed" : "pointer" }}>
                {isGenerating ? (
                  <><div style={{ width: "18px", height: "18px", border: "2px solid #090A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Formulating Plan...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: "18px" }}>bolt</span> Generate AI Insight Plan</>
                )}
              </button>
            </form>

            {generatedPlan && (
              <div style={{ background: "rgba(160,124,254,0.05)", border: "1px solid rgba(160,124,254,0.2)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#cbc3d5", lineHeight: "1.6" }}>
                  {generatedPlan.split("\n").map((line, idx) => {
                    if (line.startsWith("###")) return <h4 key={idx} style={{ color: "#e3e1e9", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0" }}>{line.replace("###", "").trim()}</h4>;
                    if (line.startsWith("**Focus Area:**") || line.startsWith("**Recommended Actions:**")) return <p key={idx} style={{ margin: "6px 0", color: "#e3e1e9" }}><strong>{line.split("**")[1]}:</strong>{line.split("**")[2]}</p>;
                    if (/^\d\./.test(line)) return <div key={idx} style={{ display: "flex", gap: "8px", margin: "6px 0 6px 12px" }}><span style={{ color: "#cfbcff", fontWeight: 600 }}>{line.substring(0, 2)}</span><span>{line.substring(2).trim()}</span></div>;
                    if (line.startsWith("*Estimated")) return <p key={idx} style={{ margin: "14px 0 0 0", color: "#4ade80", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>trending_up</span>{line.replace(/\*/g, "")}</p>;
                    return <p key={idx} style={{ margin: "6px 0" }}>{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart Analytics */}
          <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>bar_chart</span>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Classroom Performance Analytics</h2>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#948e9f" }}>Weekly Avg</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Click a bar to set focus subject for AI plan generation.</p>
            </div>

            <div style={{ position: "relative", padding: "10px 0" }}>
              <svg viewBox="0 0 450 180" style={{ width: "100%", height: "auto" }}>
                <line x1="40" y1="20" x2="420" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="420" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="420" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="420" y2="150" stroke="rgba(255,255,255,0.15)" />
                <text x="30" y="25" fill="#948e9f" fontSize="10" textAnchor="end">100</text>
                <text x="30" y="75" fill="#948e9f" fontSize="10" textAnchor="end">50</text>
                <text x="30" y="125" fill="#948e9f" fontSize="10" textAnchor="end">20</text>
                <text x="30" y="155" fill="#948e9f" fontSize="10" textAnchor="end">0</text>
                <defs>
                  <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a07cfe" /><stop offset="100%" stopColor="rgba(160,124,254,0.15)" /></linearGradient>
                  <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cfbcff" /><stop offset="100%" stopColor="rgba(207,188,255,0.1)" /></linearGradient>
                </defs>
                {[
                  { x: 75, y: 44, h: 106, label: "Math", pct: "88%", grad: "bg1", sub: "Mathematics" },
                  { x: 155, y: 38, h: 112, label: "Science", pct: "91%", grad: "bg2", sub: "Science" },
                  { x: 235, y: 60, h: 90, label: "Lit", pct: "76%", grad: "bg1", sub: "Literature" },
                  { x: 315, y: 30, h: 120, label: "Tech", pct: "95%", grad: "bg2", sub: "Technology" },
                  { x: 395, y: 52, h: 98, label: "Arts", pct: "82%", grad: "bg1", sub: "Arts" },
                ].map((bar) => (
                  <g key={bar.label} style={{ cursor: "pointer" }} onClick={() => setSubject(bar.sub)}>
                    <rect x={bar.x} y={bar.y} width="36" height={bar.h} rx="4" fill={`url(#${bar.grad})`} />
                    <text x={bar.x + 18} y={bar.y - 8} fill="#cfbcff" fontSize="10" fontWeight="bold" textAnchor="middle">{bar.pct}</text>
                    <text x={bar.x + 18} y="168" fill="#cbc3d5" fontSize="11" textAnchor="middle">{bar.label}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "0.75rem", color: "#948e9f" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#a07cfe" }} /> Core Subjects
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#cfbcff" }} /> Specializations
              </div>
            </div>
          </div>
        </div>

        {/* ── Student Roster ─────────────────────────────────────── */}
        <div className="glass-card" style={{ borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>group</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Student Performance Tracking</h2>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#cbc3d5", background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.08)" }}>{studentAnalytics.length} Profiles</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#cbc3d5", margin: 0 }}>Review real-time student metrics based on auto-generated quiz results.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {studentAnalytics.length > 0 ? studentAnalytics.map((st: any) => (
              <div
                key={st.studentId}
                onClick={() => setSelectedStudent(st)}
                style={{
                  background: selectedStudent?.studentId === st.studentId ? "rgba(160,124,254,0.07)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selectedStudent?.studentId === st.studentId ? "rgba(160,124,254,0.3)" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center",
                  justifyContent: "space-between", cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (selectedStudent?.studentId !== st.studentId) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                onMouseLeave={(e) => { if (selectedStudent?.studentId !== st.studentId) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "240px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(st.avatarSeed)}`} alt={st.name} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(160,124,254,0.1)", border: "1px solid rgba(160,124,254,0.2)" }} />
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e3e1e9" }}>{st.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#948e9f" }}>Average Score: {st.progress}%</div>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", padding: "0 24px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#cbc3d5", width: "32px", textAlign: "right" }}>{st.progress}%</span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: `${st.progress}%`, height: "100%", background: "linear-gradient(90deg, #a07cfe 0%, #cfbcff 100%)", borderRadius: "3px" }} />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: "0.68rem", color: "#948e9f", fontWeight: 600, textTransform: "uppercase" }}>Activity</span>
                    <span style={{ fontSize: "0.875rem", color: "#e3e1e9", fontWeight: 600 }}>{st.engagement}</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: st.statusColor, background: `${st.statusColor}18`, padding: "4px 10px", borderRadius: "6px", border: `1px solid ${st.statusColor}30`, width: "100px", textAlign: "center" }}>
                    {st.status}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#948e9f", fontSize: "0.85rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px" }}>
                No student data available yet. Students need to complete auto-generated quizzes first.
              </div>
            )}
          </div>

          {selectedStudent && (
            <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#cfbcff", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Selected Student Dossier</span>
                <h4 style={{ fontSize: "1rem", color: "#e3e1e9", fontWeight: 700, margin: "4px 0" }}>{selectedStudent.name} — {selectedStudent.status}</h4>
                <p style={{ fontSize: "0.8rem", color: "#cbc3d5", margin: 0 }}>4 completed objectives. AI recommends scheduling an intervention script.</p>
              </div>
              <button
                onClick={() => { setFocusArea(`Targeted review for ${selectedStudent.name}`); alert(`Focus set to ${selectedStudent.name}! Generate an AI plan above.`); }}
                style={{ background: "rgba(160,124,254,0.1)", color: "#cfbcff", border: "1px solid rgba(160,124,254,0.25)", borderRadius: "8px", padding: "8px 16px", fontSize: "0.825rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160,124,254,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160,124,254,0.1)")}
              >
                Auto-Select for Focus Area
              </button>
            </div>
          )}
        </div>

      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 32px", textAlign: "center" }}>
        <span style={{ fontSize: "0.72rem", color: "#948e9f" }}>© 2026 EduAgent AI. Secured workspace portal.</span>
      </footer>

      {activeViewQuiz && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(9, 10, 15, 0.8)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: "20px"
        }}>
          <div className="glass-card" style={{
            maxWidth: "600px", width: "100%", borderRadius: "16px",
            border: "1px solid rgba(160, 124, 254, 0.25)",
            background: "#121318", padding: "32px", display: "flex", flexDirection: "column",
            gap: "24px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
              <div>
                <span style={{ fontSize: "0.68rem", color: "#cfbcff", background: "rgba(160,124,254,0.1)", border: "1px solid rgba(160,124,254,0.25)", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {isEditingQuiz ? "Editing Classroom Quiz" : "Classroom Quiz"}
                </span>
                {isEditingQuiz ? (
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e3e1e9", margin: "8px 0 0 0" }}>Edit Mode</h3>
                ) : (
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#e3e1e9", margin: "8px 0 0 0" }}>{activeViewQuiz.title}</h3>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveViewQuiz(null);
                  setIsEditingQuiz(false);
                }}
                disabled={isSavingQuiz}
                style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#cbc3d5", cursor: isSavingQuiz ? "not-allowed" : "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { if (!isSavingQuiz) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { if (!isSavingQuiz) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
              </button>
            </div>

            {/* Content Area */}
            {isEditingQuiz ? (
              /* --- Edit Mode --- */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {editingError && (
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#f87171", borderRadius: "8px", padding: "12px 16px", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>error</span>
                    <span>{editingError}</span>
                  </div>
                )}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>QUIZ TITLE</label>
                  <input
                    type="text"
                    value={editingQuizTitle}
                    onChange={(e) => setEditingQuizTitle(e.target.value)}
                    style={{
                      width: "100%", padding: "12px 16px", background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                      color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                    }}
                  />
                </div>

                {/* Questions List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {editingQuestions.map((q, idx) => (
                    <div key={idx} style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                      
                      {/* Delete Q Button */}
                      {editingQuestions.length > 1 && (
                        <button
                          onClick={() => handleRemoveQuestionFromQuiz(idx)}
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
                          value={q.question}
                          onChange={(e) => handleUpdateQuestionText(idx, e.target.value)}
                          style={{
                            width: "100%", padding: "12px 14px", background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px",
                            color: "#e2e1eb", fontSize: "0.875rem", outline: "none"
                          }}
                        />
                      </div>

                      {/* Options */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <label style={{ fontSize: "0.68rem", fontWeight: 600, color: "#968e9d" }}>OPTION {String.fromCharCode(65 + optIdx)}</label>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
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
                          onChange={(e) => handleUpdateCorrectAnswer(idx, e.target.value)}
                          style={{
                            width: "100%", padding: "12px", background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                            color: "#e3e1e9", fontSize: "0.875rem", outline: "none", cursor: "pointer"
                          }}
                        >
                          <option value="" style={{ background: "#1a1b21" }}>-- Select correct option --</option>
                          {q.options.map((opt: string, optIdx: number) => (
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
                  onClick={handleAddQuestionToQuiz}
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
              </div>
            ) : (
              /* --- View Mode --- */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {activeViewQuiz.questions.map((q, idx) => (
                  <div key={idx} style={{
                    background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px"
                  }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ color: "#cfbcff", fontWeight: 700, fontSize: "0.9rem" }}>{idx + 1}.</span>
                      <p style={{ color: "#e3e1e9", fontWeight: 600, fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>{q.question}</p>
                    </div>
                    
                    {/* Options */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginLeft: "20px" }}>
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div key={oIdx} style={{
                            padding: "8px 12px", borderRadius: "6px", fontSize: "0.825rem",
                            background: isCorrect ? "rgba(74, 222, 128, 0.08)" : "rgba(255, 255, 255, 0.02)",
                            border: `1px solid ${isCorrect ? "rgba(74, 222, 128, 0.25)" : "rgba(255, 255, 255, 0.05)"}`,
                            color: isCorrect ? "#4ade80" : "#cbc3d5",
                            display: "flex", alignItems: "center", gap: "6px"
                          }}>
                            <span style={{
                              width: "18px", height: "18px", borderRadius: "50%",
                              background: isCorrect ? "#4ade80" : "rgba(255,255,255,0.05)",
                              color: isCorrect ? "#090A0F" : "#968e9d",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "0.68rem", fontWeight: 700
                            }}>
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isCorrect && (
                              <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#4ade80" }}>check_circle</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions / Footer */}
            {isEditingQuiz ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => {
                    setIsEditingQuiz(false);
                    setEditingQuizTitle(activeViewQuiz.title);
                    setEditingQuestions(JSON.parse(JSON.stringify(activeViewQuiz.questions)));
                    setEditingError("");
                  }}
                  disabled={isSavingQuiz}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)", color: "#e3e1e9",
                    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                    padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: isSavingQuiz ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!isSavingQuiz) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { if (!isSavingQuiz) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuizEdit}
                  disabled={isSavingQuiz}
                  style={{
                    background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
                    color: "#090A0F", border: "none", borderRadius: "8px", padding: "10px 24px",
                    fontSize: "0.875rem", fontWeight: 700, cursor: isSavingQuiz ? "not-allowed" : "pointer",
                    transition: "all 0.2s", opacity: isSavingQuiz ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  {isSavingQuiz ? (
                    <>
                      <div style={{ width: "16px", height: "16px", border: "2px solid #090A0F", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button
                  onClick={() => {
                    setIsEditingQuiz(true);
                  }}
                  style={{
                    background: "rgba(160, 124, 254, 0.1)", color: "#cfbcff",
                    border: "1px solid rgba(160, 124, 254, 0.25)", borderRadius: "8px",
                    padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(160, 124, 254, 0.18)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(160, 124, 254, 0.1)")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>edit</span>
                  Edit Quiz
                </button>
                <button
                  onClick={() => setActiveViewQuiz(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)", color: "#e3e1e9",
                    border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px",
                    padding: "10px 24px", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                >
                  Close View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
