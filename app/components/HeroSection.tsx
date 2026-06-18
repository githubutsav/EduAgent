"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Immediately show above-fold hero items
    sectionRef.current?.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("active");
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: "24px 32px 60px 32px",
        position: "relative",
      }}
      className="max-w-desktop"
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          top: "-10rem",
          left: "-10rem",
          width: "24rem",
          height: "24rem",
          background: "rgba(214,186,255,0.20)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          top: "50%",
          right: "-10rem",
          width: "500px",
          height: "500px",
          background: "rgba(87,56,120,0.10)",
          filter: "blur(150px)",
        }}
      />

      <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* ── Left: Copy ─────────────────────────────────────── */}
        <div className="reveal">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              background: "rgba(214,186,255,0.10)",
              border: "1px solid rgba(214,186,255,0.20)",
              padding: "6px 16px",
              marginBottom: "16px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px", color: "#d6baff", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span
              style={{
                color: "#d6baff",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              AI-Powered Classroom Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
            }}
          >
            The AI Classroom That&nbsp;
            <br />
            <span className="gradient-text">Adapts To Every Student</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "1rem",
              color: "#ccc3d4",
              lineHeight: 1.75,
              marginBottom: "24px",
              maxWidth: "36rem",
            }}
          >
            Empower educators with real-time classroom insights and personalized
            learning paths. MindHub AI bridges the gap between massive curriculum
            and individual potential.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              style={{
                background: "#d6baff",
                color: "#410a83",
                border: "none",
                borderRadius: "12px",
                padding: "16px 32px",
                fontSize: "1.125rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(214,186,255,0.2)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Get Started for Free
            </button>
            <button
              className="glass-card"
              style={{
                borderRadius: "12px",
                padding: "16px 32px",
                color: "#e2e1eb",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.2s",
              }}
            >
              <span className="material-symbols-outlined">play_circle</span>
              Watch Demo
            </button>
          </div>
        </div>

        {/* ── Right: Dashboard Mockup ─────────────────────────── */}
        <div className="reveal" style={{ transitionDelay: "0.1s", position: "relative", minHeight: "500px" }}>
          {/* Main glass panel */}
          <div
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "24px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Card header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "4px" }}>Your Custom Syllabus</h3>
                <p style={{ color: "#ccc3d4", fontSize: "0.875rem" }}>Adaptive Pathway Active</p>
              </div>
              <div
                style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "rgba(214,186,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#d6baff" }}>more_horiz</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                className="glass-card"
                style={{
                  background: "rgba(214,186,255,0.10)",
                  border: "1px solid rgba(214,186,255,0.20)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#d6baff", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "8px" }}>
                  Spatial Aptitude
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ fontSize: "1.875rem", fontWeight: 700 }}>24</div>
                    <div style={{ fontSize: "10px", color: "#ccc3d4", textTransform: "uppercase" }}>Pages</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.875rem", fontWeight: 700 }}>5</div>
                    <div style={{ fontSize: "10px", color: "#ccc3d4", textTransform: "uppercase" }}>Videos</div>
                  </div>
                </div>
              </div>
              <div
                className="glass-card"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px" }}
              >
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#ccc3d4", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "8px" }}>
                  AI Tutor Status
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
                  <span style={{ fontSize: "0.875rem" }}>Online &amp; Listening</span>
                </div>
              </div>
            </div>

            {/* Module list */}
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { icon: "architecture", label: "3D Modeling & CAD basics", status: "85% COMPLETE" },
                { icon: "edit_note", label: "Perspective Drawing Fundamentals", status: "IN PROGRESS" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#d6baff" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.875rem", flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: "10px", color: "#ccc3d4" }}>{item.status}</span>
                </div>
              ))}
            </div>

            {/* Floating micro-card */}
            <div
              className="glass-card"
              style={{
                position: "absolute",
                bottom: "-16px",
                left: "-32px",
                padding: "16px",
                borderRadius: "12px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                animation: "bounce 4s infinite",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "#d6baff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "16px", color: "#410a83", fontVariationSettings: "'FILL' 1" }}
                  >
                    psychology
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>Cognitive Peak</div>
                  <div style={{ fontSize: "10px", color: "#ccc3d4" }}>Optimal learning window</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
