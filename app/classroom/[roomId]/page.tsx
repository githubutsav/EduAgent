"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../Firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import VideoRoom from "../../components/VideoRoom";

interface ShareBarProps {
  roomId: string;
  role: "teacher" | "student";
}

function ShareBar({ roomId, role }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        background: "rgba(13, 13, 18, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#e2e1eb",
        fontFamily: "Inter, sans-serif",
        zIndex: 50,
      }}
    >
      {/* Left section: Back to Dashboard & Status */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "none",
            border: "none",
            color: "#ccc3d4",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "color 0.2s",
            padding: "4px 8px",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#ccc3d4";
            e.currentTarget.style.background = "none";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
            arrow_back
          </span>
          Dashboard
        </button>

        <div
          style={{
            width: "1px",
            height: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
            Live Classroom
          </span>
        </div>
      </div>

      {/* Right section: Classroom Room Code & Copy Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            fontSize: "0.825rem",
            color: "#968e9d",
          }}
        >
          Room Code:
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "4px 4px 4px 12px",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: "#d6baff",
              fontFamily: "monospace",
              fontWeight: 600,
              userSelect: "all",
            }}
          >
            {roomId}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "#22c55e" : "#d6baff",
              color: copied ? "#ffffff" : "#410a83",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClassroomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<"teacher" | "student">("student");

  useEffect(() => {
    if (authLoading) return;
    
    // Redirect to landing page if user is not logged in
    if (!user) {
      router.push("/");
      return;
    }

    async function initializeClassroom() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        let roomData = null;
        let roomExists = false;

        // 1. Verify if room exists in Firestore or local storage fallback
        if (db) {
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const q = query(collection(db, "classrooms"), where("roomCode", "==", roomId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            roomData = querySnapshot.docs[0].data();
            roomExists = roomData.isActive !== false; // If isActive is undefined, default to true
          }
        } else {
          // Fallback mock database check for Developer Mode
          const savedRooms = localStorage.getItem("mindhub_demo_rooms");
          const rooms = savedRooms ? JSON.parse(savedRooms) : {};
          if (rooms[roomId]) {
            roomData = rooms[roomId];
            roomExists = roomData.isActive !== false;
          }
        }

        if (!roomExists || !roomData) {
          setError("Classroom room not found, inactive, or has been closed.");
          setLoading(false);
          return;
        }

        // 2. Identify role (Creator = Teacher, others = Student)
        const userRole = roomData.createdBy === user.uid ? "teacher" : "student";
        setRole(userRole);

        // 3. Request JWT access token from our API route
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomName: roomId,
            participantName: user.displayName || user.email || "Educator",
            role: userRole,
          }),
        });

        if (!response.ok) {
          const errPayload = await response.json();
          throw new Error(errPayload.error || "Failed to generate video room token");
        }

        const data = await response.json();
        setToken(data.token);
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "An error occurred during classroom initialization.");
      } finally {
        setLoading(false);
      }
    }

    initializeClassroom();
  }, [roomId, user, authLoading, router]);

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  // Render Loader State
  if (loading || authLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080B",
          color: "#e2e1eb",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              width: "44px",
              height: "44px",
              border: "3px solid #d6baff",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>Connecting to LiveKit...</h3>
          <p style={{ fontSize: "0.85rem", color: "#ccc3d4", marginTop: "8px", marginBottom: 0 }}>
            Establishing secure stream room session
          </p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080B",
          color: "#e2e1eb",
          fontFamily: "Inter, sans-serif",
          padding: "24px",
        }}
      >
        <div
          className="glass-card"
          style={{
            maxWidth: "480px",
            width: "100%",
            borderRadius: "16px",
            padding: "40px 32px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              marginBottom: "20px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
              warning
            </span>
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 12px 0" }}>Connection Failed</h2>
          <p style={{ fontSize: "0.875rem", color: "#ccc3d4", lineHeight: "1.6", margin: "0 0 28px 0" }}>
            {error}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "#d6baff",
              color: "#410a83",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "transform 0.1s",
              boxShadow: "0 4px 12px rgba(214, 186, 255, 0.25)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render VideoRoom Component with Share Bar
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#08080B" }}>
      <ShareBar roomId={roomId} role={role} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <VideoRoom
          token={token || ""}
          url={livekitUrl || ""}
          roomId={roomId}
          role={role}
          userName={user?.displayName || "Educator"}
          onLeave={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
