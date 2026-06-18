"use client";

import { useEffect, useRef } from "react";

const stats = [
  { value: "10k+", label: "Active Students", delay: 0 },
  { value: "40%", label: "Workload Reduction", delay: 100 },
  { value: "98%", label: "Retention Rate", delay: 200 },
  { value: "500+", label: "Partner Schools", delay: 300 },
];

export default function TrustSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = ref.current?.querySelectorAll("[data-reveal]");
            items?.forEach((el, i) => {
              setTimeout(() => el.classList.add("reveal-visible"), i * 100);
            });
          }
        });
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 32px",
        borderTop: "1px solid rgba(74,68,82,0.1)",
        borderBottom: "1px solid rgba(74,68,82,0.1)",
      }}
    >
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(20px); transition: all 0.7s ease-out; }
        [data-reveal].reveal-visible { opacity: 1; transform: translateY(0); }
      `}</style>
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "32px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#d6baff", marginBottom: "8px" }}>
              {stat.value}
            </div>
            <p style={{ color: "#ccc3d4", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
