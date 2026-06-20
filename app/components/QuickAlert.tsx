"use client";

import { useState, useEffect } from "react";

interface QuickAlertProps {
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export default function QuickAlert({ title, message, duration = 5000, onClose }: QuickAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow the slide-in animation to trigger after mount
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Wait for transition to finish before removing from DOM
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 1000,
        background: "rgba(30, 30, 36, 0.9)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(160,124,254,0.4)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(160,124,254,0.15)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        maxWidth: "350px",
        transform: isVisible ? "translateX(0)" : "translateX(120%)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(160,124,254,0.2) 0%, rgba(254,132,149,0.2) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>
          notifications_active
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem", color: "#e3e1e9", fontWeight: 600 }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#cbc3d5", lineHeight: "1.4" }}>
          {message}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          background: "none",
          border: "none",
          color: "#948e9f",
          cursor: "pointer",
          padding: 0,
          display: "flex",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          close
        </span>
      </button>
    </div>
  );
}
