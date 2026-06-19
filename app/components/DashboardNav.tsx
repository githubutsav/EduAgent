"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function DashboardNav() {
  const { user, logout, isDemoMode } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Profile", href: "/profile", icon: "person" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(18, 19, 24, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 32px",
          height: "68px",
          maxWidth: "1440px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            className="gradient-button"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#090A0F", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e3e1e9", letterSpacing: "-0.02em" }}>
            EduAgent
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              background: "rgba(207, 188, 255, 0.1)",
              color: "#cfbcff",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontWeight: 600,
              border: "1px solid rgba(207, 188, 255, 0.2)",
              marginLeft: "4px",
            }}
          >
            Workspace
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: isActive ? "rgba(207, 188, 255, 0.1)" : "transparent",
                  color: isActive ? "#cfbcff" : "#cbc3d5",
                  border: isActive ? "1px solid rgba(207, 188, 255, 0.2)" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User + Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isDemoMode && (
            <span
              style={{
                fontSize: "0.7rem",
                color: "#cfbcff",
                background: "rgba(207, 188, 255, 0.08)",
                border: "1px solid rgba(207, 188, 255, 0.2)",
                padding: "3px 10px",
                borderRadius: "6px",
                fontWeight: 600,
              }}
            >
              Demo Mode
            </span>
          )}

          {/* Avatar + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                user?.photoURL ||
                `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.displayName || "user")}`
              }
              alt="Profile"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "2px solid rgba(207, 188, 255, 0.3)",
                background: "rgba(255, 255, 255, 0.05)",
              }}
            />
            <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#e3e1e9" }}>
              {user?.displayName?.split(" ")[0] || "Educator"}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => { logout(); router.push("/"); }}
            style={{
              background: "rgba(239, 68, 68, 0.05)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
