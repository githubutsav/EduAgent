"use client";

import { useEffect, useRef } from "react";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mo",
    description: "Perfect for individual tutors and small cohorts.",
    features: [
      { text: "Up to 30 students", included: true },
      { text: "Core AI Tutor features", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Advanced LMS Integration", included: false },
    ],
    cta: "Start Starter Trial",
    popular: false,
    delay: "0s",
  },
  {
    name: "Pro",
    price: "$89",
    period: "/mo",
    description: "For schools looking to optimize classroom results.",
    features: [
      { text: "Unlimited students", included: true },
      { text: "Advanced AI Tutor & Copilot", included: true },
      { text: "Full Analytics Dashboard", included: true },
      { text: "Custom API Access", included: true },
    ],
    cta: "Get Started with Pro",
    popular: true,
    delay: "0.1s",
  },
  {
    name: "Institution",
    price: "Custom",
    period: "",
    description: "Enterprise-grade solutions for large university networks.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Dedicated Support Manager", included: true },
      { text: "On-premise deployment", included: true },
      { text: "SSO & Advanced Security", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
    delay: "0.2s",
  },
];

export default function PricingSection() {
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
      id="pricing"
      ref={sectionRef}
      style={{
        padding: "128px 0",
      }}
    >
      <div style={{ padding: "0 32px", maxWidth: "1440px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div className="reveal" style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
            Scalable Intelligence for Every Scale
          </h2>
          <p style={{ color: "#ccc3d4", margin: 0 }}>
            Simple, transparent pricing to power the next generation of learners.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card reveal ${plan.popular ? "neon-glow-purple" : ""}`}
              style={{
                padding: "40px",
                borderRadius: "24px",
                position: "relative",
                overflow: "hidden",
                border: plan.popular ? "1px solid rgba(214, 186, 255, 0.5)" : "1px solid rgba(255, 255, 255, 0.05)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.3s, border-color 0.3s",
                transitionDelay: plan.delay,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "#d6baff",
                    color: "#410a83",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Most Popular
                </div>
              )}

              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px", margin: 0 }}>
                {plan.name}
              </h3>
              
              <div style={{ fontSize: "2.25rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "baseline" }}>
                {plan.price}
                {plan.period && (
                  <span style={{ fontSize: "1.125rem", fontWeight: 400, color: "#ccc3d4", marginLeft: "4px" }}>
                    {plan.period}
                  </span>
                )}
              </div>
              
              <p style={{ color: "#ccc3d4", fontSize: "0.875rem", marginBottom: "32px", minHeight: "40px", margin: "0 0 32px 0" }}>
                {plan.description}
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontSize: "0.875rem",
                      opacity: f.included ? 1 : 0.4,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "18px",
                        color: f.included ? "#d6baff" : "#968e9d",
                      }}
                    >
                      {f.included ? "check_circle" : "cancel"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <button
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: plan.popular ? "#d6baff" : "transparent",
                  color: plan.popular ? "#410a83" : "#e2e1eb",
                  border: plan.popular ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: plan.popular ? "0 10px 30px rgba(214,186,255,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (plan.popular) {
                    e.currentTarget.style.transform = "scale(0.98)";
                  } else {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  if (!plan.popular) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
