"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { label: "Platform", href: "#", active: true },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#showcase" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openModal = (tab: "login" | "signup") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span
              className="material-symbols-outlined"
              style={{ color: "#d6baff", fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span style={{ fontSize: "1.375rem", fontWeight: 700, color: "#e2e1eb", letterSpacing: "-0.02em" }}>
              MindHub AI
            </span>
          </Link>

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
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    fontSize: "0.875rem",
                    color: "#d6baff",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "color 0.2s",
                    paddingRight: "8px",
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#e2e1eb",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)")}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => openModal("login")}
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
                  onClick={() => openModal("signup")}
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
                  Launch App
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} initialTab={modalTab} />
    </>
  );
}
