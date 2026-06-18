"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Platform", href: "#", active: true },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 50,
        borderBottom: `1px solid ${scrolled ? "rgba(74,68,82,0.3)" : "transparent"}`,
        background: scrolled ? "rgba(8,8,11,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 32px",
          height: "80px",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#d6baff", fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span style={{ fontSize: "1.375rem", fontWeight: 700, color: "#e2e1eb", letterSpacing: "-0.02em" }}>
            MindHub AI
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: "0.875rem",
                color: link.active ? "#d6baff" : "#ccc3d4",
                fontWeight: link.active ? 600 : 400,
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#e2e1eb",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            Log In
          </button>
          <button
            style={{
              background: "#d6baff",
              color: "#410a83",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(214,186,255,0.4)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Start Free Trial
          </button>
        </div>
      </div>
    </nav>
  );
}
