"use client";

interface SignoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SignoutConfirmModal({ isOpen, onClose, onConfirm }: SignoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
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

      {/* Modal Card */}
      <div
        className="glass-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px -10px rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Warning Icon Container */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f87171",
            margin: "0 auto",
            boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
            logout
          </span>
        </div>

        {/* Text Details */}
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#e3e1e9",
              margin: "0 0 8px 0",
            }}
          >
            Confirm Sign Out
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#cbc3d5",
              margin: 0,
              lineHeight: "1.5",
            }}
          >
            Are you sure you want to sign out of your account? You will need to sign back in to access your classroom and dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.03)",
              color: "#e3e1e9",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.9) 100%)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.2)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
