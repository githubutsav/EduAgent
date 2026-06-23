"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import SignoutConfirmModal from "./SignoutConfirmModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("login");
  const [modalEmail, setModalEmail] = useState("");
  const [modalRole, setModalRole] = useState<"teacher" | "student" | undefined>(undefined);
  const [confirmSignoutOpen, setConfirmSignoutOpen] = useState(false);

  const openLogin = () => { setModalTab("login"); setModalEmail(""); setModalOpen(true); };

  useEffect(() => {
    const handleOpenAuth = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: "login" | "signup"; email?: string; defaultRole?: "teacher" | "student" }>;
      const { tab = "login", email = "", defaultRole } = customEvent.detail || {};
      setModalTab(tab);
      setModalEmail(email);
      setModalRole(defaultRole);
      setModalOpen(true);
    };
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  return (
    <>
      <div className="fixed top-4 left-0 w-full z-50 flex justify-center px-4 pointer-events-none">
        <nav className="w-full max-w-[1280px] backdrop-blur-xl border border-white/10 bg-[#121318]/80 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
          <div className="flex justify-between items-center h-16 px-6">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
              <div className="w-8 h-8 rounded-lg gradient-button flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap size={20} color="#090A0F" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-on-surface group-hover:text-primary transition-colors">
                EduAgent
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8 pt-1">
              {[
                { label: "Vision", href: "#" },
                { label: "Features", href: "#features" },
                { label: "Experience", href: "#experience" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative text-on-surface-variant hover:text-primary transition-colors text-sm uppercase tracking-widest group/link pb-2"
                >
                  {link.label}
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left" />
                </a>
              ))}
            </div>

            {/* CTA — auth-aware */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface border border-white/10 hover:bg-white/5 transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setConfirmSignoutOpen(true)}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="px-6 py-2 rounded-full gradient-button text-white font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(160,124,254,0.4)]"
              >
                Get Started
              </button>
            )}
          </div>
        </nav>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
        initialEmail={modalEmail}
        initialRole={modalRole}
      />

      {/* Sign Out Confirmation Modal */}
      <SignoutConfirmModal
        isOpen={confirmSignoutOpen}
        onClose={() => setConfirmSignoutOpen(false)}
        onConfirm={async () => {
          setConfirmSignoutOpen(false);
          await logout();
        }}
      />
    </>
  );
}
