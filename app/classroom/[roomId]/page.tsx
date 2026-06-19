"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../../Firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import VideoRoom from "../../components/VideoRoom";

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
          const roomRef = doc(db, "classrooms", roomId);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            roomData = roomSnap.data();
            roomExists = roomData.isActive;
          }
        } else {
          // Fallback mock database check for Developer Mode
          const savedRooms = localStorage.getItem("mindhub_demo_rooms");
          const rooms = savedRooms ? JSON.parse(savedRooms) : {};
          if (rooms[roomId] && rooms[roomId].isActive) {
            roomData = rooms[roomId];
            roomExists = true;
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

  // Render VideoRoom Component
  return (
    <VideoRoom
      token={token || ""}
      url={livekitUrl || ""}
      onLeave={() => router.push("/dashboard")}
    />
  );
}
