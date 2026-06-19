"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  { icon: "smart_toy", title: "AI Tutor", description: "24/7 personalized tutor that understands every student's unique learning pace and vocabulary." },
  { icon: "fact_check", title: "Automated Assessments", description: "Instant grading and detailed feedback loops for essays, math problems, and creative projects." },
  { icon: "route", title: "Adaptive Paths", description: "Dynamic syllabus generation that pivots based on student performance and engagement metrics." },
  { icon: "analytics", title: "Classroom Intelligence", description: "Real-time heatmaps of student understanding to help teachers identify who needs help in seconds." },
  { icon: "language", title: "Multilingual Support", description: "Bridge language barriers with real-time translation and localized educational content." },
  { icon: "person_search", title: "Teacher Copilot", description: "Automate lesson planning and administrative tasks so teachers can focus on mentoring." },
];

export default function FeaturesGrid() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      style={{ padding: "128px 32px", maxWidth: "1440px", margin: "0 auto" }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "80px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
          Precision Engineering for Education
        </h2>
        <p style={{ color: "#ccc3d4", maxWidth: "42rem", margin: "0 auto", lineHeight: 1.75 }}>
          Every module is designed to optimize the cognitive load and maximize knowledge retention through advanced AI synthesis.
        </p>
      </div>

      {/* Grid */}
      <div className="responsive-3-col-grid">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="glass-card card-hover-lift"
            style={{
              padding: "32px",
              borderRadius: "16px",
              cursor: "default",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(40px)",
              transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, box-shadow 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease`,
            }}
          >
            <div
              className="feature-icon"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(214,186,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                transition: "background 0.3s, transform 0.3s",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#d6baff" }}>{f.icon}</span>
            </div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "12px" }}>{f.title}</h3>
            <p style={{ color: "#ccc3d4", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
