"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialTab = "login" }: AuthModalProps) {
  const router = useRouter();
  const { isDemoMode, loginWithEmail, signUpWithEmail, loginWithGoogle, user } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [view, setView] = useState<"role-select" | "form">(initialTab === "signup" ? "role-select" : "form");

  // Sync tab state with initialTab prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
      setView(initialTab === "signup" ? "role-select" : "form");
      setError("");
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [isOpen, initialTab]);

  // Removed aggressive auto-redirect to prevent race conditions during Auth flows

  if (!isOpen) return null;

  // For the login tab, styling should be neutral/generic (purple).
  // Role-specific styling is only applied when the user is signing up.
  const isStudentTheme = tab === "signup" && role === "student";
  const primaryColor = isStudentTheme ? "#38bdf8" : "#d6baff";
  const primaryBg = isStudentTheme ? "rgba(56, 189, 248, 0.1)" : "rgba(214, 186, 255, 0.1)";
  const primaryBorder = isStudentTheme ? "rgba(56, 189, 248, 0.2)" : "rgba(214, 186, 255, 0.2)";
  const primaryHoverBg = isStudentTheme ? "rgba(56, 189, 248, 0.15)" : "rgba(214, 186, 255, 0.15)";
  const btnTextColor = isStudentTheme ? "#082f49" : "#410a83";

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        loginSchema.parse({ email, password });
        await loginWithEmail(email, password);
      } else {
        signupSchema.parse({ email, password, name });
        await signUpWithEmail(email, password, name, role);
      }
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else if (err.message === "auth/wrong-password" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(tab, tab === "signup" ? role : undefined);
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/account-not-found") {
        setError("User not registered, please register.");
        setTab("signup");
        setView("role-select");
      } else if (err.code !== "auth/popup-closed-by-user") {
        console.error("Auth Error:", err);
        setError(err.message || "Google Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo Login now accepts an explicit role so we can have two buttons on the Log In tab
  const handleQuickDemoLogin = async (overrideRole?: "student" | "teacher") => {
    const finalRole = overrideRole || (tab === "signup" ? role : "teacher");
    const demoEmail = finalRole === "student" ? "student@mindhub.ai" : "teacher@mindhub.ai";
    const demoName = finalRole === "student" ? "Alex Student" : "Sarah Jenkins";

    setEmail(demoEmail);
    setPassword("password123");
    setName(demoName);
    
    setLoading(true);
    setError("");
    try {
      if (tab === "login") {
        await loginWithEmail(demoEmail, "password123");
      } else {
        await signUpWithEmail(demoEmail, "password123", demoName, finalRole);
      }
      onClose();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Quick Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(3, 3, 5, 0.8)",
          backdropFilter: "blur(8px)",
          transition: "opacity 0.3s",
        }}
      />

      {/* Modal Container */}
      <div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px -10px ${primaryBorder}`,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "#ccc3d4",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "50%",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e2e1eb";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#ccc3d4";
            e.currentTarget.style.background = "none";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            close
          </span>
        </button>

        {view === "role-select" && tab === "signup" ? (
          /* ─── ROLE SELECTION VIEW (Sign Up Only) ─────────────────────── */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#e2e1eb",
                  marginBottom: "16px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                  explore
                </span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>Choose Your Path</h2>
              <p style={{ fontSize: "0.875rem", color: "#ccc3d4", marginTop: "6px" }}>How do you want to use EduAgent?</p>
            </div>
            
            <button
              onClick={() => { setRole("student"); setView("form"); }}
              style={{
                display: "flex", alignItems: "center", gap: "16px", padding: "20px",
                background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.2)",
                borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", textAlign: "left"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.05)" }}
            >
              <div style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "12px", borderRadius: "10px", display: "flex" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>school</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e2e1eb", margin: 0 }}>I'm a Student</h3>
                <p style={{ fontSize: "0.8rem", color: "#ccc3d4", margin: "4px 0 0 0", lineHeight: "1.4" }}>Access assignments, join live classes, and get AI study help.</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "#38bdf8", marginLeft: "auto" }}>chevron_right</span>
            </button>

            <button
              onClick={() => { setRole("teacher"); setView("form"); }}
              style={{
                display: "flex", alignItems: "center", gap: "16px", padding: "20px",
                background: "rgba(214, 186, 255, 0.05)", border: "1px solid rgba(214, 186, 255, 0.2)",
                borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", textAlign: "left"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(214, 186, 255, 0.1)" }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(214, 186, 255, 0.05)" }}
            >
              <div style={{ background: "rgba(214, 186, 255, 0.1)", color: "#d6baff", padding: "12px", borderRadius: "10px", display: "flex" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>history_edu</span>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e2e1eb", margin: 0 }}>I'm an Educator</h3>
                <p style={{ fontSize: "0.8rem", color: "#ccc3d4", margin: "4px 0 0 0", lineHeight: "1.4" }}>Manage classrooms, view analytics, and leverage AI teaching tools.</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: "#d6baff", marginLeft: "auto" }}>chevron_right</span>
            </button>

            <div style={{ textAlign: "center", marginTop: "8px" }}>
              <button 
                onClick={() => { setTab("login"); setView("form"); }}
                style={{ background: "none", border: "none", color: "#ccc3d4", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#e2e1eb" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc3d4" }}
              >
                Already have an account? Log In
              </button>
            </div>
          </div>
        ) : (
          /* ─── FORM VIEW ────────────────────────────────────────────────── */
          <>
            {/* Back Button (Only for Signup) */}
            {tab === "signup" && (
              <button
                onClick={() => setView("role-select")}
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  background: "none",
                  border: "none",
                  color: "#ccc3d4",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px",
                  borderRadius: "50%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#e2e1eb"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#ccc3d4"; e.currentTarget.style.background = "none"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  arrow_back
                </span>
              </button>
            )}

            {/* Header */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: primaryBg,
                  color: primaryColor,
                  marginBottom: "16px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}>
                  {tab === "login" ? "auto_awesome" : isStudentTheme ? "school" : "history_edu"}
                </span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e1eb", margin: 0 }}>
                {tab === "login" ? "Welcome Back" : `Create ${isStudentTheme ? "Student" : "Educator"} Account`}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#ccc3d4", marginTop: "6px", marginBottom: 0 }}>
                {tab === "login"
                  ? "Access your dashboard and AI toolkits"
                  : isStudentTheme ? "Start your interactive learning journey" : "Start optimizing classroom learning paths"}
              </p>
            </div>

            {/* Demo Mode Notice */}
            {isDemoMode && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${primaryBorder}`,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span className="material-symbols-outlined" style={{ color: primaryColor, fontSize: "20px" }}>
                    info
                  </span>
                  <span style={{ fontSize: "0.775rem", color: "#ccc3d4", lineHeight: "1.4" }}>
                    <strong style={{ color: primaryColor }}>Demo Mode Active:</strong> Firebase is running locally without keys. Click a button below to sign in instantly.
                  </span>
                </div>
                
                {tab === "login" ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin("student")}
                      style={{
                        flex: 1, background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8",
                        border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "6px",
                        padding: "8px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(56, 189, 248, 0.12)"; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>bolt</span>
                      Demo: Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin("teacher")}
                      style={{
                        flex: 1, background: "rgba(214, 186, 255, 0.12)", color: "#d6baff",
                        border: "1px solid rgba(214, 186, 255, 0.2)", borderRadius: "6px",
                        padding: "8px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(214, 186, 255, 0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(214, 186, 255, 0.12)"; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>bolt</span>
                      Demo: Teacher
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin()}
                    style={{
                      background: primaryBg,
                      color: primaryColor,
                      border: `1px solid ${primaryBorder}`,
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "0.775rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = primaryHoverBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = primaryBg; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>bolt</span>
                    Quick Sign Up Demo
                  </button>
                )}
              </div>
            )}

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <button
                onClick={() => { setTab("login"); setView("form"); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: tab === "login" ? primaryBg : "transparent",
                  color: tab === "login" ? primaryColor : "#ccc3d4",
                  transition: "all 0.2s",
                }}
              >
                Log In
              </button>
              <button
                onClick={() => { 
                  if (tab === "login") {
                    setView("role-select");
                  }
                  setTab("signup"); 
                  setError(""); 
                }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: tab === "signup" ? primaryBg : "transparent",
                  color: tab === "signup" ? primaryColor : "#ccc3d4",
                  transition: "all 0.2s",
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#f87171",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontSize: "0.825rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {tab === "signup" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>FULL NAME</label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        color: "#968e9d",
                      }}
                    >
                      person
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 40px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        color: "#e2e1eb",
                        fontSize: "0.875rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>EMAIL ADDRESS</label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "20px",
                      color: "#968e9d",
                    }}
                  >
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#e2e1eb",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ccc3d4" }}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "20px",
                      color: "#968e9d",
                    }}
                  >
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#e2e1eb",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "8px",
                  background: primaryColor,
                  color: btnTextColor,
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: `0 4px 12px ${primaryBorder}`,
                  transition: "transform 0.1s, opacity 0.2s",
                  opacity: loading ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(0.99)";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: "18px",
                      height: "18px",
                      border: `2px solid ${btnTextColor}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : tab === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
              <span style={{ fontSize: "0.75rem", color: "#968e9d", fontWeight: 500 }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                color: "#e2e1eb",
                padding: "12px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>

            {/* Spin Keyframe CSS Hack */}
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}
