"use client";

import { useEffect, useRef } from "react";

export default function CtaSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) {
      observer.observe(ref.current);
      ref.current.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="reveal"
      style={{
        padding: "128px 0",
      }}
    >
      <div style={{ padding: "0 32px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div
          className="glass-card"
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
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              background: "rgba(214, 186, 255, 0.1)",
              filter: "blur(100px)",
              opacity: 0.5,
            }}
          />

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
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                Claim Your Free Trial
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
                  transition: "background 0.2s",
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
