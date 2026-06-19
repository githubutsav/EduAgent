"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "../../Firebaseconfig";
import { doc, setDoc } from "firebase/firestore";


interface Student {
  name: string;
  avatarSeed: string;
  progress: number;
  engagement: string;
  status: "Exceling" | "On Track" | "Needs Focus";
  statusColor: string;
}

const mockStudents: Student[] = [
  { name: "Emily Watson", avatarSeed: "Emily", progress: 94, engagement: "98%", status: "Exceling", statusColor: "#4ade80" },
  { name: "Marcus Chen", avatarSeed: "Marcus", progress: 88, engagement: "92%", status: "On Track", statusColor: "#60a5fa" },
  { name: "Sophia Martinez", avatarSeed: "Sophia", progress: 74, engagement: "85%", status: "On Track", statusColor: "#60a5fa" },
  { name: "Oliver Bennett", avatarSeed: "Oliver", progress: 58, engagement: "64%", status: "Needs Focus", statusColor: "#f87171" },
  { name: "Liam O'Connor", avatarSeed: "Liam", progress: 91, engagement: "95%", status: "Exceling", statusColor: "#4ade80" },
];

export default function Dashboard() {
  const { user, loading, logout, isDemoMode } = useAuth();
  const router = useRouter();
  
  // AI Generator state
  const [subject, setSubject] = useState("Mathematics");
  const [focusArea, setFocusArea] = useState("Algebra foundations & equations");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  // Active student selection state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(mockStudents[0]);

  // LiveKit Call State
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleCreateClassroom = async () => {
    if (!user) return;
    setIsCreatingRoom(true);
    
    const randomSlug = Math.random().toString(36).substring(2, 7);
    const newRoomId = `classroom-${randomSlug}`;

    try {
      if (db) {
        const roomRef = doc(db, "classrooms", newRoomId);
        await setDoc(roomRef, {
          roomId: newRoomId,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          isActive: true,
          creatorName: user.displayName || "Educator",
        });
      } else {
        const savedRooms = localStorage.getItem("mindhub_demo_rooms");
        const rooms = savedRooms ? JSON.parse(savedRooms) : {};
        rooms[newRoomId] = {
          roomId: newRoomId,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          isActive: true,
          creatorName: user.displayName || "Educator",
        };
        localStorage.setItem("mindhub_demo_rooms", JSON.stringify(rooms));
      }

      router.push(`/classroom/${newRoomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Error creating call room: " + (error as Error).message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinClassroom = () => {
    if (!joinRoomId.trim()) return;
    router.push(`/classroom/${joinRoomId.trim().toLowerCase()}`);
  };


  // Protect route client-side
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080B",
          color: "#e2e1eb",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "3px solid #d6baff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px",
            }}
          />
          <p style={{ fontSize: "0.875rem", color: "#ccc3d4", fontWeight: 500 }}>
            Verifying secure session...
          </p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedPlan(null);
    
    // Simulate complex AI calculation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const plans: Record<string, string> = {
      Mathematics: `### AI Adaptive Curriculum: Mathematics
**Focus Area:** ${focusArea}
**Recommended Actions:**
1. **Interactive Sandbox:** Launch the visual quadratic resolver for spatial thinkers.
2. **Scaffolded Practice:** Assign 5 foundational polynomial equations with immediate step-by-step visual hints.
3. **Adaptive Quiz:** Dynamically scale difficulty from Level 2 (Simple solving) to Level 4 (Application modeling) based on student response latency.
*Estimated Engagement Boost:* **+14%**`,
      Science: `### AI Adaptive Curriculum: Science
**Focus Area:** ${focusArea}
**Recommended Actions:**
1. **Interactive Simulation:** Assign the virtual molecule assembler dashboard to explore covalent bonding.
2. **Concept Anchoring:** Short 2-minute video overview on atomic forces, followed by active recall prompts.
3. **Peer Collaboration:** Auto-group students into micro-channels of 3 to solve the state transition puzzle.
*Estimated Engagement Boost:* **+18%**`,
      Literature: `### AI Adaptive Curriculum: Literature
**Focus Area:** ${focusArea}
**Recommended Actions:**
1. **Comparative Analysis:** Contrast modern themes with context historical articles using AI side-by-side highlighter.
2. **Vocabulary Scaffold:** Auto-translate advanced terms in text to simplified contextual synonyms.
3. **Synthesis Prompt:** Write a 100-word perspective summary; AI provides stylistic and tone feedback.
*Estimated Engagement Boost:* **+12%**`,
    };

    const matchedPlan = plans[subject] || `### AI Adaptive Curriculum: Customized
**Focus Area:** ${focusArea}
**Recommended Actions:**
1. **Targeted Assessment:** Introduce diagnostic quizzes targeting conceptual weak points.
2. **Differentiated Reading:** Deliver reading material adjusted to the individual reading comprehension levels.
3. **Real-time Intervention:** Notify instructor for a 1-on-1 tutoring sync on the next checkpoint.
*Estimated Engagement Boost:* **+15%**`;

    setGeneratedPlan(matchedPlan);
    setIsGenerating(false);
  };

  return (
    <div style={{ backgroundColor: "#08080B", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Dashboard Top Navigation */}
      <header
        className="nav-blur"
        style={{
          borderBottom: "1px solid rgba(74,68,82,0.3)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            height: "72px",
            maxWidth: "1440px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Brand/Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span
              className="material-symbols-outlined"
              style={{ color: "#d6baff", fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#e2e1eb", letterSpacing: "-0.02em" }}>
              MindHub AI
            </span>
            <span
              style={{
                fontSize: "0.675rem",
                background: "rgba(214, 186, 255, 0.1)",
                color: "#d6baff",
                padding: "2px 8px",
                borderRadius: "9999px",
                fontWeight: 600,
                border: "1px solid rgba(214, 186, 255, 0.15)",
                marginLeft: "8px",
              }}
            >
              Workspace
            </span>
          </Link>

          {/* User profile dropdown and actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingRight: "8px" }}>
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName || "user")}`}
                alt="Profile"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "2px solid rgba(214, 186, 255, 0.3)",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              />
              <div style={{ display: "none", flexDirection: "column", textAlign: "left" }} className="md:flex">
                <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#e2e1eb" }}>
                  {user.displayName || "Educator"}
                </span>
                <span style={{ fontSize: "0.675rem", color: "#ccc3d4" }}>
                  {user.email}
                </span>
              </div>
            </div>
            {isDemoMode && (
              <span
                style={{
                  fontSize: "0.725rem",
                  color: "#d6baff",
                  background: "rgba(214, 186, 255, 0.08)",
                  border: "1px solid rgba(214, 186, 255, 0.2)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Demo Session
              </span>
            )}
            <button
              onClick={logout}
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Main Wrapper */}
      <main style={{ flex: 1, padding: "32px", maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Welcome Section */}
        <div
          className="glass-card neon-glow-purple"
          style={{
            borderRadius: "16px",
            padding: "28px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <h1 className="gradient-text" style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.03em" }}>
              Welcome back, {user.displayName ? user.displayName.split(" ")[0] : "Educator"}!
            </h1>
            <p style={{ color: "#ccc3d4", fontSize: "0.95rem", marginTop: "6px", marginBottom: 0 }}>
              AI has updated classroom insights with latest student activity. 12 recommendations require your review.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                background: "rgba(255, 255, 255, 0.03)",
                color: "#e2e1eb",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>home</span>
              Land Page
            </Link>
            <button
              onClick={() => alert("Classroom sync trigger simulated successfully!")}
              style={{
                background: "#d6baff",
                color: "#410a83",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 0 15px rgba(214,186,255,0.25)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>sync</span>
              Sync Roster
            </button>
          </div>
        </div>

      {/* Live Video Classroom Widget */}
      <div
        className="glass-card"
        style={{
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(214, 186, 255, 0.1)",
              color: "#d6baff",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
              video_chat
            </span>
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
              Live AI Video Classroom
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#ccc3d4", margin: "4px 0 0 0" }}>
              Launch or join a high-fidelity video stream with students to review AI-generated curriculums in real-time.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                left: "12px",
                fontSize: "18px",
                color: "#968e9d",
              }}
            >
              key
            </span>
            <input
              type="text"
              placeholder="Enter Room Code (e.g. math-101)"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              style={{
                padding: "10px 16px 10px 38px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                color: "#e2e1eb",
                fontSize: "0.875rem",
                outline: "none",
                width: "220px",
              }}
            />
          </div>
          <button
            onClick={handleJoinClassroom}
            disabled={!joinRoomId.trim()}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              color: "#e2e1eb",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: !joinRoomId.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: !joinRoomId.trim() ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (joinRoomId.trim()) e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              if (joinRoomId.trim()) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
          >
            Join Room
          </button>
          <div style={{ height: "24px", width: "1px", background: "rgba(255, 255, 255, 0.1)" }} />
          <button
            onClick={handleCreateClassroom}
            disabled={isCreatingRoom}
            style={{
              background: "#d6baff",
              color: "#410a83",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: isCreatingRoom ? "not-allowed" : "pointer",
              boxShadow: "0 0 15px rgba(214,186,255,0.25)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isCreatingRoom) e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseLeave={(e) => {
              if (!isCreatingRoom) e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              add_box
            </span>
            {isCreatingRoom ? "Creating..." : "Create Live Room"}
          </button>
        </div>
      </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          
          {/* Card 1 */}
          <div
            className="glass-card"
            style={{
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "#ccc3d4", letterSpacing: "0.05em" }}>
                CLASS ENGAGEMENT
              </span>
              <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                groups
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 800, color: "#e2e1eb" }}>94.2%</span>
              <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>+0.8%</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#968e9d", marginTop: "8px" }}>
              vs average weekly benchmark (93.4%)
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="glass-card"
            style={{
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "#ccc3d4", letterSpacing: "0.05em" }}>
                AI ADAPTIVE PLANS
              </span>
              <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                insights
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 800, color: "#e2e1eb" }}>48</span>
              <span style={{ fontSize: "0.75rem", color: "#d6baff", fontWeight: 600 }}>12 new</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#968e9d", marginTop: "8px" }}>
              Tailored learning adjustments applied
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="glass-card"
            style={{
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "#ccc3d4", letterSpacing: "0.05em" }}>
                ACTIVE CURRICULUMS
              </span>
              <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                menu_book
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 800, color: "#e2e1eb" }}>8</span>
              <span style={{ fontSize: "0.75rem", color: "#968e9d" }}>Active</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#968e9d", marginTop: "8px" }}>
              Dynamic courses currently synced
            </div>
          </div>

          {/* Card 4 */}
          <div
            className="glass-card"
            style={{
              borderRadius: "12px",
              padding: "24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.775rem", fontWeight: 700, color: "#ccc3d4", letterSpacing: "0.05em" }}>
                PERFORMANCE SCORE
              </span>
              <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                monitoring
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "16px" }}>
              <span style={{ fontSize: "1.875rem", fontWeight: 800, color: "#e2e1eb" }}>87.4%</span>
              <span style={{ fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>+2.1%</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#968e9d", marginTop: "8px" }}>
              Growth over standard term average
            </div>
          </div>
        </div>

        {/* Mid Section Grid (AI Generator + Interactive Performance Graph) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }} className="lg:grid-cols-2">
          
          {/* AI Custom Curriculum Generator */}
          <div
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                  psychology
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
                  AI Adaptive Plan Generator
                </h2>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#ccc3d4", margin: 0 }}>
                Generate customized intervention scripts and schedules for distinct student segments.
              </p>
            </div>

            <form onSubmit={handleGeneratePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>SELECT SUBJECT</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#e2e1eb",
                      padding: "10px",
                      fontSize: "0.875rem",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Mathematics" style={{ background: "#12131a" }}>Mathematics</option>
                    <option value="Science" style={{ background: "#12131a" }}>Science</option>
                    <option value="Literature" style={{ background: "#12131a" }}>Literature</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>CLASSROOM SIZE</label>
                  <input
                    type="text"
                    disabled
                    value="24 Students"
                    style={{
                      background: "rgba(255, 255, 255, 0.01)",
                      border: "1px solid rgba(255, 255, 255, 0.04)",
                      borderRadius: "8px",
                      color: "#968e9d",
                      padding: "10px",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>FOCUS CONCEPTS</label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Algebra foundations"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    color: "#e2e1eb",
                    padding: "10px 12px",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !focusArea.trim()}
                style={{
                  background: "#d6baff",
                  color: "#410a83",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: (isGenerating || !focusArea.trim()) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: (isGenerating || !focusArea.trim()) ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(214, 186, 255, 0.2)",
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating && focusArea.trim()) e.currentTarget.style.transform = "scale(0.99)";
                }}
                onMouseLeave={(e) => {
                  if (!isGenerating && focusArea.trim()) e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {isGenerating ? (
                  <>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid #410a83",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Formulating Plan...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>bolt</span>
                    Generate AI Insight Plan
                  </>
                )}
              </button>
            </form>

            {/* Generated Plan Output Box */}
            {generatedPlan && (
              <div
                style={{
                  background: "rgba(214, 186, 255, 0.03)",
                  border: "1px solid rgba(214, 186, 255, 0.15)",
                  borderRadius: "10px",
                  padding: "20px",
                  marginTop: "8px",
                  animation: "fadeIn 0.4s ease-out",
                }}
              >
                <div style={{ whiteSpace: "pre-line", fontSize: "0.875rem", color: "#ccc3d4", lineHeight: "1.6" }}>
                  {/* Simplistic renderer for markdown blocks in generated plan */}
                  {generatedPlan.split("\n").map((line, idx) => {
                    if (line.startsWith("###")) {
                      return <h4 key={idx} style={{ color: "#e2e1eb", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 12px 0" }}>{line.replace("###", "").trim()}</h4>;
                    }
                    if (line.startsWith("**Focus Area:**") || line.startsWith("**Recommended Actions:**")) {
                      return (
                        <p key={idx} style={{ margin: "6px 0", color: "#e2e1eb" }}>
                          <strong>{line.split("**")[1]}:</strong>{line.split("**")[2]}
                        </p>
                      );
                    }
                    if (line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
                      return (
                        <div key={idx} style={{ display: "flex", gap: "8px", margin: "6px 0 6px 12px", alignItems: "flex-start" }}>
                          <span style={{ color: "#d6baff", fontWeight: 600 }}>{line.substring(0, 2)}</span>
                          <span>{line.substring(2).trim()}</span>
                        </div>
                      );
                    }
                    if (line.startsWith("*Estimated")) {
                      return (
                        <p key={idx} style={{ margin: "14px 0 0 0", color: "#4ade80", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>trending_up</span>
                          {line.replace(/\*/g, "")}
                        </p>
                      );
                    }
                    return <p key={idx} style={{ margin: "6px 0" }}>{line}</p>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Class Analytics Chart */}
          <div
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                    bar_chart
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
                    Classroom Performance Analytics
                  </h2>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#968e9d" }}>Weekly Avg Hours</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#ccc3d4", margin: 0 }}>
                Interactive representation of class progress across the academic timeline. Hover to view indices.
              </p>
            </div>

            {/* Custom SVG Bar Chart */}
            <div style={{ position: "relative", padding: "10px 0" }}>
              <svg viewBox="0 0 450 180" style={{ width: "100%", height: "auto" }}>
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="20" x2="420" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="420" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="420" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="420" y2="150" stroke="rgba(255,255,255,0.15)" />

                {/* Left Y Axis Labels */}
                <text x="30" y="25" fill="#968e9d" fontSize="10" textAnchor="end">100</text>
                <text x="30" y="75" fill="#968e9d" fontSize="10" textAnchor="end">50</text>
                <text x="30" y="125" fill="#968e9d" fontSize="10" textAnchor="end">20</text>
                <text x="30" y="155" fill="#968e9d" fontSize="10" textAnchor="end">0</text>

                {/* Chart Bars */}
                {/* Math Bar (progress 88%) */}
                <g style={{ cursor: "pointer" }} onClick={() => setSubject("Mathematics")}>
                  <rect x="75" y="44" width="36" height="106" rx="4" fill="url(#barGradient1)" style={{ transition: "all 0.3s" }} />
                  <text x="93" y="32" fill="#d6baff" fontSize="10" fontWeight="bold" textAnchor="middle">88%</text>
                  <text x="93" y="168" fill="#ccc3d4" fontSize="11" textAnchor="middle">Math</text>
                </g>

                {/* Science Bar (progress 91%) */}
                <g style={{ cursor: "pointer" }} onClick={() => setSubject("Science")}>
                  <rect x="155" y="38" width="36" height="112" rx="4" fill="url(#barGradient2)" />
                  <text x="173" y="26" fill="#ecdcff" fontSize="10" fontWeight="bold" textAnchor="middle">91%</text>
                  <text x="173" y="168" fill="#ccc3d4" fontSize="11" textAnchor="middle">Science</text>
                </g>

                {/* Lit Bar (progress 76%) */}
                <g style={{ cursor: "pointer" }} onClick={() => setSubject("Literature")}>
                  <rect x="235" y="60" width="36" height="90" rx="4" fill="url(#barGradient1)" />
                  <text x="253" y="48" fill="#d6baff" fontSize="10" fontWeight="bold" textAnchor="middle">76%</text>
                  <text x="253" y="168" fill="#ccc3d4" fontSize="11" textAnchor="middle">Literature</text>
                </g>

                {/* Tech Bar (progress 95%) */}
                <g style={{ cursor: "pointer" }} onClick={() => { setSubject("Technology"); setFocusArea("Python Programming foundations"); }}>
                  <rect x="315" y="30" width="36" height="120" rx="4" fill="url(#barGradient2)" />
                  <text x="333" y="18" fill="#ecdcff" fontSize="10" fontWeight="bold" textAnchor="middle">95%</text>
                  <text x="333" y="168" fill="#ccc3d4" fontSize="11" textAnchor="middle">Tech</text>
                </g>

                {/* Art Bar (progress 82%) */}
                <g style={{ cursor: "pointer" }} onClick={() => { setSubject("Arts"); setFocusArea("Creative Design systems"); }}>
                  <rect x="395" y="52" width="36" height="98" rx="4" fill="url(#barGradient1)" />
                  <text x="413" y="40" fill="#d6baff" fontSize="10" fontWeight="bold" textAnchor="middle">82%</text>
                  <text x="413" y="168" fill="#ccc3d4" fontSize="11" textAnchor="middle">Arts</text>
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b88cff" />
                    <stop offset="100%" stopColor="rgba(184, 140, 255, 0.2)" />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ecdcff" />
                    <stop offset="100%" stopColor="rgba(236, 220, 255, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "0.75rem", color: "#968e9d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#b88cff" }} />
                Core Subjects
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", background: "#ecdcff" }} />
                Specializations
              </div>
            </div>
          </div>
        </div>

        {/* Student Performance Roster Panel */}
        <div
          className="glass-card"
          style={{
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                  group
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
                  Active Student Performance Tracking
                </h2>
              </div>
              <span
                style={{
                  fontSize: "0.775rem",
                  color: "#ccc3d4",
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                5 Sync Profiles
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#ccc3d4", margin: 0 }}>
              Review student indexes, dynamic metrics, and trigger AI lesson modifications.
            </p>
          </div>

          {/* Roster Table/Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {mockStudents.map((st) => (
              <div
                key={st.name}
                onClick={() => setSelectedStudent(st)}
                style={{
                  background: selectedStudent?.name === st.name ? "rgba(214, 186, 255, 0.06)" : "rgba(255, 255, 255, 0.02)",
                  border: `1px solid ${selectedStudent?.name === st.name ? "rgba(214, 186, 255, 0.25)" : "rgba(255, 255, 255, 0.05)"}`,
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedStudent?.name !== st.name) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStudent?.name !== st.name) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                  }
                }}
              >
                {/* Profile Detail */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "240px" }}>
                  <img
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(st.avatarSeed)}`}
                    alt={st.name}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(214, 186, 255, 0.1)",
                      border: "1px solid rgba(214, 186, 255, 0.2)",
                    }}
                  />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e1eb" }}>{st.name}</span>
                    <span style={{ fontSize: "0.75rem", color: "#968e9d" }}>MindHub Classroom ID: MH-${st.avatarSeed.toUpperCase()}-09</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", padding: "0 24px" }} className="hidden md:flex">
                  <span style={{ fontSize: "0.75rem", color: "#ccc3d4", width: "32px", textAlign: "right" }}>
                    {st.progress}%
                  </span>
                  <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${st.progress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #b88cff 0%, #d6baff 100%)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>

                {/* Right Side Metadata */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }} className="hidden sm:flex">
                    <span style={{ fontSize: "0.75rem", color: "#968e9d", fontWeight: 500 }}>ENGAGEMENT</span>
                    <span style={{ fontSize: "0.875rem", color: "#e2e1eb", fontWeight: 600 }}>{st.engagement}</span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: st.statusColor,
                      background: `${st.statusColor}15`,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: `1px solid ${st.statusColor}30`,
                      width: "110px",
                      textAlign: "center",
                    }}
                  >
                    {st.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Selection Workspace Details */}
          {selectedStudent && (
            <div
              style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "20px 24px",
                marginTop: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#d6baff", fontWeight: 600 }}>SELECTED STUDENT DOSSIER</span>
                <h4 style={{ fontSize: "1rem", color: "#e2e1eb", fontWeight: 700, margin: "4px 0" }}>
                  {selectedStudent.name} ({selectedStudent.status})
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#ccc3d4", margin: 0 }}>
                  Curriculum path contains 4 completed objectives. Auto-adaptation recommends scheduling an intervention script.
                </p>
              </div>
              <button
                onClick={() => {
                  setFocusArea(`Targeted learning review for ${selectedStudent.name}`);
                  alert(`Focus set to ${selectedStudent.name}! You can now generate an AI plan for them.`);
                }}
                style={{
                  background: "rgba(214, 186, 255, 0.1)",
                  color: "#d6baff",
                  border: "1px solid rgba(214, 186, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(214, 186, 255, 0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(214, 186, 255, 0.1)")}
              >
                Auto-Select for Focus Area
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "24px 32px",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "#968e9d" }}>
          © 2026 MindHub AI Corporation. All rights reserved. Secured workspace portal.
        </span>
      </footer>
    </div>
  );
}
