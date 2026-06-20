import { GraduationCap } from "lucide-react";

export default function PageLoader({ message = "Verifying secure session..." }: { message?: string }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "#121318",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* EduAgent Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div
          className="gradient-button"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse-soft 2s ease-in-out infinite",
          }}
        >
          <GraduationCap size={22} color="#090A0F" strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#e3e1e9" }}>EduAgent</span>
      </div>

      {/* Spinner */}
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid rgba(207, 188, 255, 0.15)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px solid transparent",
            borderTopColor: "#cfbcff",
            borderRightColor: "#a07cfe",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
      </div>

      <p style={{ fontSize: "0.825rem", color: "#cbc3d5", fontWeight: 500, margin: 0 }}>
        {message}
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
