"use client";

import { useEffect, useRef } from "react";

const sidebarIcons = ["grid_view", "calendar_today", "chat_bubble", "auto_awesome", "settings"];
const modules = [
  { label: "Spatial Logic", time: "12:15", active: false },
  { label: "Perspective Deep Dive", time: "LIVE", active: true },
  { label: "Mental Exercises", time: "15:30", active: false },
];

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="showcase"
      ref={sectionRef}
      style={{
        padding: "128px 0",
        background: "rgba(12, 14, 20, 0.5)",
      }}
    >
      <div style={{ padding: "0 32px", maxWidth: "1440px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "64px" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
            A Modern OS for Education
          </h2>
          <p style={{ color: "#ccc3d4", margin: 0 }}>
            Directly inspired by the workflow of elite designers and developers.
          </p>
        </div>

        {/* Dashboard frame */}
        <div
          className="glass-card reveal neon-glow-purple"
          style={{
            borderRadius: "32px",
            padding: "32px",
            overflow: "hidden",
            position: "relative",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div className="showcase-grid">

            {/* Icon sidebar */}
            <div
              className="showcase-sidebar"
              style={{
                flexDirection: "column",
                alignItems: "center",
                gap: "32px",
                padding: "16px 0",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {sidebarIcons.map((icon, i) => (
                <span
                  key={icon}
                  className="material-symbols-outlined"
                  style={{
                    color: i === 0 ? "#d6baff" : "#e2e1eb",
                    opacity: i === 0 ? 1 : 0.4,
                    cursor: "pointer",
                  }}
                >
                  {icon}
                </span>
              ))}
            </div>

            {/* Main canvas */}
            <div className="showcase-main">
              {/* Video player */}
              <div
                className="group"
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  aspectRatio: "16/9",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  width: "100%",
                }}
              >
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNDL_IgdA4l5eVL76WmyA0iXcTQbYsCGhcUKkMBo7YeTGLPe9KUe6ruV32VsID1TEhAMmI6mpWcvNcjAWI3pa0GA15Z9cc5zHlOMY6szRsX_CU9LcjUvyu-Z73fXw0gNgGIk9mf5Q7ubePsrP1vPq7bruDoNPj30r_6BaNpxGoipvMPq0txOd0VbBB6dDOBODPbVcOiqPTAHBqqF1vfEiaeoDf1Cm97m_psvHN0L4nA2amCJqmOuj53nU7bfyfReEdbpKjpkSJupQn"
                  alt="A high-fidelity software dashboard interface showing a video lecture player, a smiling blonde female instructor wearing glasses and a blue shirt, with clear overlays showing lecture notes and progress bars. The style is premium tech with soft lighting and purple highlights."
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                
                {/* Progress overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "32px",
                  }}
                >
                  <div style={{ width: "100%" }}>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>
                      Perspective Basics
                    </h4>
                    <div style={{ height: "6px", width: "100%", background: "rgba(255, 255, 255, 0.2)", borderRadius: "9999px", overflow: "hidden", position: "relative" }}>
                      <div
                        style={{
                          height: "100%",
                          background: "#d6baff",
                          width: "66.6%",
                          borderRadius: "9999px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            right: "-6px",
                            top: "-5px",
                            width: "16px",
                            height: "16px",
                            background: "#ffffff",
                            borderRadius: "50%",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course chat + upcoming modules */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", width: "100%" }}>
                {/* Chat */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h5 style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e2e1eb", marginBottom: "16px" }}>
                    Course Chat
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#dbb8ff", flexShrink: 0 }} />
                      <div style={{ background: "rgba(214,186,255,0.1)", padding: "12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5 }}>
                        &quot;How do I apply the vanishing point in a two-point perspective?&quot;
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexDirection: "row-reverse" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#d6baff", flexShrink: 0 }} />
                      <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", fontSize: "12px", lineHeight: 1.5 }}>
                        &quot;Start by drawing your horizon line, Anna. The AI Tutor just sent a guide.&quot;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming modules */}
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <h5 style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e2e1eb", marginBottom: "16px" }}>
                    Upcoming Modules
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {modules.map((m) => (
                      <div
                        key={m.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px",
                          borderRadius: "8px",
                          transition: "background 0.2s",
                          background: m.active ? "rgba(214,186,255,0.1)" : "transparent",
                          border: m.active ? "1px solid rgba(214,186,255,0.2)" : "1px solid transparent",
                          cursor: m.active ? "default" : "pointer",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: m.active ? 600 : 400 }}>{m.label}</span>
                        <span
                          style={{
                            fontSize: "10px",
                            color: m.active ? "#d6baff" : "#ccc3d4",
                            opacity: m.active ? 1 : 0.4,
                          }}
                        >
                          {m.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning analytics sidebar */}
            <div className="showcase-analytics">
              <div
                className="glass-card"
                style={{
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "24px", margin: 0 }}>
                  Learning Analytics
                </h3>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px" }}>
                  {/* Donut chart */}
                  <div style={{ position: "relative", width: "128px", height: "128px", margin: "0 auto" }}>
                    <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 128 128">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="12"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        fill="transparent"
                        stroke="#b88cff"
                        strokeWidth="12"
                        strokeDasharray="364"
                        strokeDashoffset="91"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "24px", fontWeight: 700 }}>75%</span>
                      <span style={{ fontSize: "10px", color: "#ccc3d4", textTransform: "uppercase", letterSpacing: "0.1em" }}>Growth</span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                      { label: "Focus Level", value: "High", pct: "90%" },
                      { label: "Retention", value: "82%", pct: "82%" },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
                          <span>{bar.label}</span>
                          <span style={{ color: "#d6baff" }}>{bar.value}</span>
                        </div>
                        <div style={{ height: "4px", width: "100%", background: "rgba(255, 255, 255, 0.05)", borderRadius: "9999px" }}>
                          <div
                            style={{
                              height: "100%",
                              background: "#d6baff",
                              borderRadius: "9999px",
                              width: bar.pct,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  style={{
                    marginTop: "32px",
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 0",
                    borderRadius: "12px",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#e2e1eb",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  Generate Report
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
