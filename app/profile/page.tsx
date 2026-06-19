"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      { name: "Oliver Bennett", avatarSeed: "Oliver", engagement: "64%", performance: "60%", insight: "Low attention index during lecture; active in sandbox." }
    ]
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
      { name: "Liam O'Connor", avatarSeed: "Liam", engagement: "96%", performance: "95%", insight: "Helped peers solve compound structure puzzles." }
    ]
  },
  {
    id: "m-3",
    title: "Algorithms 101: Big O Notation",
    date: "June 12, 2026",
    duration: "50 mins",
    code: "classroom-algo-f7a2",
    participantsCount: 3,
    aiSummary: "Focused technical session. Reviewed constant, linear, and quadratic complexity. Marcus Chen solved the sorting complexity comparison instantly. Recommend additional challenges on logarithmic curves.",
    participants: [
      { name: "Emily Watson", avatarSeed: "Emily", engagement: "95%", performance: "90%", insight: "Accurately analyzed search function scales." },
      { name: "Marcus Chen", avatarSeed: "Marcus", engagement: "98%", performance: "96%", insight: "Quick recall of time complexity concepts." },
      { name: "Liam O'Connor", avatarSeed: "Liam", engagement: "88%", performance: "84%", insight: "Identified nested loop time complexities." }
    ]
  }
];

export default function Profile() {
  const { user, loading, logout, isDemoMode } = useAuth();
  const router = useRouter();
  const [selectedMeeting, setSelectedMeeting] = useState<PastMeeting | null>(mockPastMeetings[0]);

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

  return (
    <div style={{ backgroundColor: "#08080B", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header Navigation */}
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
          {/* Logo */}
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
          </Link>

          {/* User Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link
              href="/dashboard"
              style={{
                fontSize: "0.875rem",
                color: "#ccc3d4",
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#d6baff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#ccc3d4")}
            >
              Dashboard
            </Link>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: "32px", maxWidth: "1440px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Profile Card Banner */}
        <div
          className="glass-card neon-glow-purple"
          style={{
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName || "user")}`}
            alt="Profile Avatar"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "3px solid rgba(214, 186, 255, 0.4)",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          />
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: "0.725rem",
                color: "#d6baff",
                background: "rgba(214, 186, 255, 0.08)",
                border: "1px solid rgba(214, 186, 255, 0.2)",
                padding: "3px 10px",
                borderRadius: "6px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Certified Educator
            </span>
            <h1 className="gradient-text" style={{ fontSize: "2rem", fontWeight: 800, margin: "8px 0 4px 0", letterSpacing: "-0.03em" }}>
              {user.displayName || "Educator Profile"}
            </h1>
            <p style={{ color: "#ccc3d4", fontSize: "0.9rem", margin: 0 }}>
              Registered Email: {user.email} {isDemoMode && " (Sandbox Demo Session)"}
            </p>
            <button
              onClick={logout}
              style={{
                marginTop: "16px",
                background: "rgba(239, 68, 68, 0.08)",
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
                width: "fit-content",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>logout</span>
              Sign Out of Session
            </button>
          </div>
          <div style={{ display: "flex", gap: "24px", background: "rgba(255, 255, 255, 0.02)", padding: "16px 24px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#d6baff" }}>24</span>
              <span style={{ fontSize: "0.7rem", color: "#968e9d", fontWeight: 500 }}>SESSIONS HOSTED</span>
            </div>
            <div style={{ height: "32px", width: "1px", background: "rgba(255, 255, 255, 0.1)", alignSelf: "center" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#d6baff" }}>18.5h</span>
              <span style={{ fontSize: "0.7rem", color: "#968e9d", fontWeight: 500 }}>CLASSROOM HOURS</span>
            </div>
            <div style={{ height: "32px", width: "1px", background: "rgba(255, 255, 255, 0.1)", alignSelf: "center" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#4ade80" }}>92%</span>
              <span style={{ fontSize: "0.7rem", color: "#968e9d", fontWeight: 500 }}>AVG ENGAGEMENT</span>
            </div>
          </div>
        </div>

        {/* Profile Details Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }} className="lg:grid-cols-12">
          
          {/* Past Sessions List */}
          <div
            className="glass-card lg:col-span-5"
            style={{
              borderRadius: "16px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              height: "fit-content",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "20px" }}>
                  history
                </span>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
                  Past Meeting Archive
                </h3>
              </div>
              <p style={{ fontSize: "0.825rem", color: "#ccc3d4", margin: 0 }}>
                Select a completed session to inspect student performance indices.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {mockPastMeetings.map((mtg) => (
                <div
                  key={mtg.id}
                  onClick={() => setSelectedMeeting(mtg)}
                  style={{
                    background: selectedMeeting?.id === mtg.id ? "rgba(214, 186, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                    border: `1px solid ${selectedMeeting?.id === mtg.id ? "rgba(214, 186, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"}`,
                    borderRadius: "10px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMeeting?.id !== mtg.id) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMeeting?.id !== mtg.id) {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                    }
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: selectedMeeting?.id === mtg.id ? "#d6baff" : "#e2e1eb", margin: 0, lineHeight: "1.4" }}>
                      {mtg.title}
                    </h4>
                    <span style={{ fontSize: "0.75rem", color: "#968e9d", whiteSpace: "nowrap" }}>
                      {mtg.date}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.75rem", color: "#ccc3d4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#968e9d" }}>schedule</span>
                      {mtg.duration}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#968e9d" }}>group</span>
                      {mtg.participantsCount} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Details Roster */}
          <div
            className="glass-card lg:col-span-7"
            style={{
              borderRadius: "16px",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {selectedMeeting ? (
              <>
                {/* Session Header Card */}
                <div>
                  <span style={{ fontSize: "0.725rem", color: "#d6baff", fontWeight: 700, letterSpacing: "0.05em" }}>
                    SESSION REPORT
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e2e1eb", margin: "4px 0" }}>
                    {selectedMeeting.title}
                  </h2>
                  <p style={{ fontSize: "0.825rem", color: "#968e9d", margin: 0 }}>
                    Room Code: <code style={{ color: "#d6baff", fontSize: "0.8rem", background: "rgba(214, 186, 255, 0.06)", padding: "2px 6px", borderRadius: "4px" }}>{selectedMeeting.code}</code> | Date: {selectedMeeting.date}
                  </p>
                </div>

                {/* AI Summary Section */}
                <div
                  style={{
                    background: "rgba(214, 186, 255, 0.03)",
                    border: "1px solid rgba(214, 186, 255, 0.15)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <span className="material-symbols-outlined" style={{ color: "#d6baff", fontSize: "18px" }}>
                      psychology
                    </span>
                    <strong style={{ fontSize: "0.825rem", color: "#d6baff" }}>AI Classroom Summary & Recommendations</strong>
                  </div>
                  <p style={{ fontSize: "0.825rem", color: "#ccc3d4", lineHeight: "1.6", margin: 0 }}>
                    {selectedMeeting.aiSummary}
                  </p>
                </div>

                {/* Student Performance List */}
                <div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e2e1eb", margin: "0 0 16px 0" }}>
                    Participant Performance Log
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedMeeting.participants.map((p, index) => (
                      <div
                        key={index}
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "10px",
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        {/* Student Name */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "180px" }}>
                          <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.avatarSeed)}`}
                            alt={p.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "rgba(214, 186, 255, 0.08)",
                              border: "1px solid rgba(214, 186, 255, 0.15)",
                            }}
                          />
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#e2e1eb" }}>
                            {p.name}
                          </span>
                        </div>

                        {/* Performance Details */}
                        <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.825rem", color: "#ccc3d4", lineHeight: "1.4" }}>
                            {p.insight}
                          </span>
                        </div>

                        {/* Badges */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "0.65rem", color: "#968e9d", fontWeight: 500 }}>ENGAGEMENT</span>
                            <span style={{ fontSize: "0.825rem", color: "#d6baff", fontWeight: 600 }}>{p.engagement}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <span style={{ fontSize: "0.65rem", color: "#968e9d", fontWeight: 500 }}>QUIZ SCORE</span>
                            <span style={{ fontSize: "0.825rem", color: "#4ade80", fontWeight: 600 }}>{p.performance}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  color: "#968e9d",
                  fontSize: "0.875rem",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "36px" }}>
                  view_sidebar
                </span>
                Select a past session on the archive to view logs.
              </div>
            )}
          </div>

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
