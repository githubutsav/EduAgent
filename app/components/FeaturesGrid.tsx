"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll("[data-reveal]");
            items.forEach((el, i) => {
              setTimeout(() => el.classList.add("reveal-visible"), i * 80);
            });
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
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(24px); transition: all 0.7s ease-out; }
        [data-reveal].reveal-visible { opacity: 1; transform: translateY(0); }
        .feature-card:hover { border-color: rgba(214,186,255,0.5) !important; }
        .feature-card:hover .feature-icon { background: rgba(214,186,255,0.20) !important; }
      `}</style>

      {/* Header */}
      <div data-reveal style={{ textAlign: "center", marginBottom: "80px" }}>
        <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
          Precision Engineering for Education
        </h2>
        <p style={{ color: "#ccc3d4", maxWidth: "42rem", margin: "0 auto", lineHeight: 1.75 }}>
          Every module is designed to optimize the cognitive load and maximize knowledge retention through advanced AI synthesis.
        </p>
      </div>

      {/* Grid */}
      <div
        className="responsive-3-col-grid"
      >
        {features.map((f) => (
          <div
            key={f.title}
            data-reveal
            className="glass-card feature-card"
            style={{
              padding: "32px",
              borderRadius: "16px",
              cursor: "default",
              transition: "border-color 0.3s",
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
                transition: "background 0.3s",
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
