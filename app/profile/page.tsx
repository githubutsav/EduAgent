"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardNav from "../components/DashboardNav";
import PageLoader from "../components/PageLoader";

import { getStudentClassrooms, Classroom } from "../../lib/firestore";

// ── Teacher Types ──
interface ParticipantPerformance {
  name: string;
  avatarSeed: string;
  engagement: string;
  performance: string;
  insight: string;
}

interface PastMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  code: string;
  participantsCount: number;
  participants: ParticipantPerformance[];
  aiSummary: string;
}

const mockPastMeetings: PastMeeting[] = [
  {
    id: "m-1",
    title: "Algebraic Foundations & Quadratic Equations",
    date: "June 17, 2026",
    duration: "45 mins",
    code: "classroom-math-a3f9",
    participantsCount: 4,
    aiSummary: "The class demonstrated high engagement during the interactive quadratic visualizer sandbox. Sophia Martinez struggled with quadratic formulas but showed progress after assignment modifications. Recommended assignment: 3 supplementary exercises on vertex calculations.",
    participants: [
      { name: "Emily Watson", avatarSeed: "Emily", engagement: "98%", performance: "95%", insight: "Demonstrated full mastery of factoring." },
      { name: "Marcus Chen", avatarSeed: "Marcus", engagement: "92%", performance: "88%", insight: "Active participation in solving equations." },
      { name: "Sophia Martinez", avatarSeed: "Sophia", engagement: "85%", performance: "74%", insight: "Requires follow-up review on vertex formula." },
      { name: "Oliver Bennett", avatarSeed: "Oliver", engagement: "64%", performance: "60%", insight: "Low attention during lecture; active in sandbox." },
    ],
  },
  {
    id: "m-2",
    title: "Introductory Chemistry Lab: Covalent Bonding",
    date: "June 15, 2026",
    duration: "60 mins",
    code: "classroom-chem-982c",
    participantsCount: 5,
    aiSummary: "Very successful session. Everyone connected and collaborated on the virtual molecule builder. Liam O'Connor and Emily Watson completed all advanced combinations. Assign lesson 4 overview as next homework.",
    participants: [
      { name: "Emily Watson", avatarSeed: "Emily", engagement: "100%", performance: "100%", insight: "Excellent speed in compound construction." },
      { name: "Marcus Chen", avatarSeed: "Marcus", engagement: "90%", performance: "85%", insight: "Followed safety simulation steps correctly." },
      { name: "Sophia Martinez", avatarSeed: "Sophia", engagement: "88%", performance: "80%", insight: "Constructed standard covalent bonds correctly." },
      { name: "Oliver Bennett", avatarSeed: "Oliver", engagement: "72%", performance: "65%", insight: "Completed basic compounds; missed review session." },
      { name: "Liam O'Connor", avatarSeed: "Liam", engagement: "96%", performance: "95%", insight: "Helped peers solve compound structure puzzles." },
    ],
  },
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedMeeting, setSelectedMeeting] = useState<PastMeeting | null>(mockPastMeetings[0]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "student") {
      getStudentClassrooms(user.uid).then(setClassrooms).catch(console.error);
    }
  }, [user]);

  if (loading || !user) return <PageLoader message="Loading your profile..." />;

  const isTeacher = user.role === "teacher" || !user.role; // Default legacy accounts to teacher if role missing
  
  const teacherStats = [
    { value: "24", label: "Sessions Hosted", color: "#cfbcff" },
    { value: "18.5h", label: "Classroom Hours", color: "#cfbcff" },
    { value: "92%", label: "Avg Engagement", color: "#4ade80" },
  ];

  const studentStats = [
    { value: "3", label: "Active Courses", color: "#38bdf8" },
    { value: "14", label: "Day Streak", color: "#f59e0b" },
    { value: "A-", label: "Average Grade", color: "#4ade80" },
  ];

  const profileStats = isTeacher ? teacherStats : studentStats;
  const badgeText = isTeacher ? "Certified Educator" : "Student Profile";
  const badgeColor = isTeacher ? "#cfbcff" : "#38bdf8";
  const badgeBg = isTeacher ? "rgba(160,124,254,0.1)" : "rgba(56,189,248,0.1)";
  const badgeBorder = isTeacher ? "rgba(160,124,254,0.25)" : "rgba(56,189,248,0.25)";

  return (
    <div style={{ background: "#121318", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DashboardNav />

      <main style={{ flex: 1, padding: "32px", maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "28px" }}>

        {/* ── Profile Banner ──────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{ borderRadius: "16px", padding: "32px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", boxShadow: "0 0 40px rgba(160,124,254,0.08)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName || "user")}`}
            alt="Profile Avatar"
            style={{ width: "80px", height: "80px", borderRadius: "50%", border: `3px solid ${badgeBorder}`, background: "rgba(255,255,255,0.05)" }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "0.68rem", color: badgeColor, background: badgeBg, border: `1px solid ${badgeBorder}`, padding: "3px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {badgeText}
            </span>
            <h1 className="signature-gradient" style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0 4px 0", letterSpacing: "-0.03em" }}>
              {user.displayName || (isTeacher ? "Educator Profile" : "Student Profile")}
            </h1>
            <p style={{ color: "#cbc3d5", fontSize: "0.9rem", margin: 0 }}>
              {user.email}
            </p>
            <button
              onClick={() => { logout(); router.push("/"); }}
              style={{ marginTop: "16px", background: "rgba(239,68,68,0.08)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "8px 16px", fontSize: "0.825rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s", width: "fit-content" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
              Sign Out
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "24px", background: "rgba(255,255,255,0.02)", padding: "20px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            {profileStats.map((s, i) => (
              <div key={s.label} style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</span>
                  <span style={{ fontSize: "0.65rem", color: "#948e9f", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                </div>
                {i < profileStats.length - 1 && (
                  <div style={{ height: "36px", width: "1px", background: "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Dynamic Content based on Role ───────────────────────────── */}
        {isTeacher ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "28px" }} className="lg:grid-cols-12">
            {/* Past Sessions List */}
            <div className="glass-card lg:col-span-5" style={{ borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>history</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Past Meeting Archive</h3>
                </div>
                <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: 0 }}>Select a session to inspect student performance.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {mockPastMeetings.map((mtg) => {
                  const isSelected = selectedMeeting?.id === mtg.id;
                  return (
                    <div
                      key={mtg.id}
                      onClick={() => setSelectedMeeting(mtg)}
                      style={{
                        background: isSelected ? "rgba(160,124,254,0.07)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "rgba(160,124,254,0.3)" : "rgba(255,255,255,0.05)"}`,
                        borderRadius: "10px", padding: "16px", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: isSelected ? "#cfbcff" : "#e3e1e9", margin: 0, lineHeight: "1.4" }}>{mtg.title}</h4>
                        <span style={{ fontSize: "0.72rem", color: "#948e9f", whiteSpace: "nowrap" }}>{mtg.date}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "0.75rem", color: "#cbc3d5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#948e9f" }}>schedule</span>
                          {mtg.duration}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#948e9f" }}>group</span>
                          {mtg.participantsCount} participants
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session Detail */}
            <div className="glass-card lg:col-span-7" style={{ borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedMeeting ? (
                <>
                  <div>
                    <span style={{ fontSize: "0.68rem", color: "#cfbcff", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Session Report</span>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e3e1e9", margin: "4px 0" }}>{selectedMeeting.title}</h2>
                    <p style={{ fontSize: "0.825rem", color: "#948e9f", margin: 0 }}>
                      Room: <code style={{ color: "#cfbcff", fontSize: "0.8rem", background: "rgba(160,124,254,0.08)", padding: "2px 6px", borderRadius: "4px" }}>{selectedMeeting.code}</code>
                      {" "} · {selectedMeeting.date}
                    </p>
                  </div>

                  {/* AI Summary */}
                  <div style={{ background: "rgba(160,124,254,0.05)", border: "1px solid rgba(160,124,254,0.2)", borderRadius: "10px", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "18px" }}>psychology</span>
                      <strong style={{ fontSize: "0.825rem", color: "#cfbcff" }}>AI Classroom Summary & Recommendations</strong>
                    </div>
                    <p style={{ fontSize: "0.825rem", color: "#cbc3d5", lineHeight: "1.6", margin: 0 }}>{selectedMeeting.aiSummary}</p>
                  </div>

                  {/* Participant list */}
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e3e1e9", margin: "0 0 16px 0" }}>Participant Performance Log</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {selectedMeeting.participants.map((p, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "180px" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.avatarSeed)}`} alt={p.name} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(160,124,254,0.08)", border: "1px solid rgba(160,124,254,0.2)" }} />
                            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e3e1e9" }}>{p.name}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: "200px" }}>
                            <span style={{ fontSize: "0.8rem", color: "#cbc3d5", lineHeight: "1.4" }}>{p.insight}</span>
                          </div>
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              <span style={{ fontSize: "0.63rem", color: "#948e9f", fontWeight: 600, textTransform: "uppercase" }}>Engagement</span>
                              <span style={{ fontSize: "0.825rem", color: "#cfbcff", fontWeight: 600 }}>{p.engagement}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                              <span style={{ fontSize: "0.63rem", color: "#948e9f", fontWeight: 600, textTransform: "uppercase" }}>Score</span>
                              <span style={{ fontSize: "0.825rem", color: "#4ade80", fontWeight: 600 }}>{p.performance}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", height: "200px", color: "#948e9f", fontSize: "0.875rem", flexDirection: "column", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>view_sidebar</span>
                  Select a past session to view logs.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span className="material-symbols-outlined" style={{ color: "#38bdf8", fontSize: "20px" }}>auto_stories</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Enrolled Classes</h3>
              </div>
              <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: 0 }}>Manage your current curriculum.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {classrooms.length > 0 ? classrooms.map(course => (
                <div key={course.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#e3e1e9", margin: "0 0 4px 0" }}>{course.name}</h4>
                    <p style={{ fontSize: "0.8rem", color: "#948e9f", margin: 0 }}>Instructor: {course.teacherName}</p>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#cbc3d5", marginBottom: "6px" }}>
                      <span>Course Progress</span>
                      <span>85%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `85%`, background: "#38bdf8", borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto" }}>
                    <div>
                      <span style={{ fontSize: "0.65rem", color: "#948e9f", textTransform: "uppercase", fontWeight: 600 }}>Next Up</span>
                      <p style={{ fontSize: "0.8rem", color: "#e3e1e9", margin: "2px 0 0 0" }}>Pending Assignments</p>
                    </div>
                    <div style={{ background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", padding: "6px 12px", borderRadius: "8px", fontWeight: 700, fontSize: "0.9rem" }}>
                      A-
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "30px", textAlign: "center", color: "#948e9f", fontSize: "0.9rem", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "10px", marginTop: "10px", gridColumn: "1 / -1" }}>
                  You haven't enrolled in any classrooms yet. Use a code from your teacher to join on the Dashboard!
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 32px", textAlign: "center", marginTop: "auto" }}>
        <span style={{ fontSize: "0.72rem", color: "#948e9f" }}>© 2026 EduAgent AI. All rights reserved.</span>
      </footer>
    </div>
  );
}
