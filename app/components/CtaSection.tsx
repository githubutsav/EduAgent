"use client";

import { useEffect, useRef, useState } from "react";

export default function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        padding: "128px 0",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div style={{ padding: "0 32px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div
          className={`glass-card ${visible ? "animate-breathing-glow" : ""}`}
          style={{
            borderRadius: "40px",
            padding: "80px 24px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Ambient glow */}
          <div
            className="animate-blob"
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              background: "rgba(214, 186, 255, 0.1)",
              filter: "blur(100px)",
              opacity: 0.5,
            }}
          />

          {/* Orbit ring decorations */}
          <div
            className="animate-orbit"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "500px",
              height: "500px",
              marginTop: "-250px",
              marginLeft: "-250px",
              border: "1px solid rgba(214,186,255,0.06)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                width: "6px",
                height: "6px",
                marginLeft: "-3px",
                marginTop: "-3px",
                background: "#d6baff",
                borderRadius: "50%",
                boxShadow: "0 0 10px rgba(214,186,255,0.5)",
              }}
            />
          </div>
          <div
            className="animate-orbit"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "700px",
              height: "700px",
              marginTop: "-350px",
              marginLeft: "-350px",
              border: "1px solid rgba(214,186,255,0.03)",
              borderRadius: "50%",
              pointerEvents: "none",
              animationDirection: "reverse",
              animationDuration: "30s",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "50%",
                width: "4px",
                height: "4px",
                marginLeft: "-2px",
                marginBottom: "-2px",
                background: "#b88cff",
                borderRadius: "50%",
                boxShadow: "0 0 8px rgba(184,140,255,0.4)",
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 10 }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 700,
                marginBottom: "32px",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              Ready to Optimize <br />
              Your Learning Potential?
            </h2>
            <p
              style={{
                color: "#ccc3d4",
                fontSize: "1.125rem",
                marginBottom: "48px",
                maxWidth: "36rem",
                margin: "0 auto 48px auto",
                lineHeight: 1.6,
              }}
            >
              Join thousands of students and teachers who are already experiencing
              the future of intelligence.
            </p>
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn-shimmer"
                style={{
                  background: "#d6baff",
                  color: "#410a83",
                  border: "none",
                  borderRadius: "16px",
                  padding: "20px 40px",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(214,186,255,0.2)",
                  transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(214,186,255,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 10px 30px rgba(214,186,255,0.2)";
                }}
              >
                Get Started for Free
              </button>
              <button
                className="glass-card"
                style={{
                  borderRadius: "16px",
                  padding: "20px 40px",
                  color: "#e2e1eb",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  cursor: "pointer",
                  transition: "background 0.2s, transform 0.25s cubic-bezier(0.16,1,0.3,1), border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "rgba(214,186,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                Book a Personalized Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
