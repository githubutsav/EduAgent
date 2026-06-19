"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure a smooth entrance after mount
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      style={{
        padding: "24px 32px 60px 32px",
        position: "relative",
      }}
      className="max-w-desktop"
    >
      {/* Ambient blobs — animated */}
      <div
        className="pointer-events-none absolute rounded-full animate-blob"
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
        className="pointer-events-none absolute rounded-full animate-blob-delay"
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
        <div>
          {/* Badge */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0s",
            }}
            className="inline-flex items-center gap-2 rounded-full"
          >
            <div
              style={{
                background: "rgba(214,186,255,0.10)",
                border: "1px solid rgba(214,186,255,0.20)",
                padding: "6px 16px",
                marginBottom: "16px",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                className="material-symbols-outlined animate-sparkle"
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
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s",
            }}
          >
            The AI Classroom That&nbsp;
            <br />
            <span className="gradient-text-animated">Adapts To Every Student</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: "1rem",
              color: "#ccc3d4",
              lineHeight: 1.75,
              marginBottom: "24px",
              maxWidth: "36rem",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.24s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.24s",
            }}
          >
            Empower educators with real-time classroom insights and personalized
            learning paths. MindHub AI bridges the gap between massive curriculum
            and individual potential.
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.36s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.36s",
            }}
          >
            <button
              className="btn-shimmer"
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
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
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
                transition: "background 0.2s, transform 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span className="material-symbols-outlined">play_circle</span>
              Watch Demo
            </button>
          </div>
        </div>

        {/* ── Right: Dashboard Mockup ─────────────────────────── */}
        <div
          style={{
            position: "relative",
            minHeight: "500px",
            paddingTop: "40px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(60px)",
            transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.3s",
          }}
        >
          {/* Main glass panel — floats gently */}
          <div
            className="glass-card animate-float"
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
                  transition: "transform 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
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
                  <div className="pulse-ring" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399" }} />
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
                    transition: "background 0.3s, border-color 0.3s, transform 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(214,186,255,0.08)";
                    e.currentTarget.style.borderColor = "rgba(214,186,255,0.2)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#d6baff" }}>{item.icon}</span>
                  <span style={{ fontSize: "0.875rem", flex: 1 }}>{item.label}</span>
                  <span style={{ fontSize: "10px", color: "#ccc3d4" }}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
