"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const stats = [
  { target: 10, suffix: "k+", label: "Active Students" },
  { target: 40, suffix: "%", label: "Workload Reduction" },
  { target: 98, suffix: "%", label: "Retention Rate" },
  { target: 500, suffix: "+", label: "Partner Schools" },
];

function AnimatedCounter({ target, suffix, started }: { target: number; suffix: string; started: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 2000; // ms
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [started, target]);

  return <>{started ? count : 0}{suffix}</>;
}

export default function TrustSection() {
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const items = ref.current?.querySelectorAll("[data-reveal]");
        items?.forEach((el, i) => {
          setTimeout(() => el.classList.add("reveal-visible"), i * 150);
        });
      }
    });
  }, [started]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <section
      ref={ref}
      style={{
        padding: "80px 32px",
        borderTop: "1px solid rgba(74,68,82,0.1)",
        borderBottom: "1px solid rgba(74,68,82,0.1)",
      }}
    >
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
            style={{
              textAlign: "center",
              transition: "transform 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#d6baff", marginBottom: "8px" }}>
              <AnimatedCounter target={stat.target} suffix={stat.suffix} started={started} />
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
