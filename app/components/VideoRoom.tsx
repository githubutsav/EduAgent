"use client";

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  LayoutContextProvider,
  Chat,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useCallback, useState, useEffect, useRef } from "react";
import { saveTranscriptLine } from "../../lib/firestore";
import { useRouter } from "next/navigation";

interface VideoRoomProps {
  token: string;
  url: string;
  roomId: string;
  role: "teacher" | "student";
  userName: string;
  onLeave: () => void;
}

/* ── Toast notification for device errors ────────────────────────── */
interface DeviceToast {
  id: number;
  source: string;
  title: string;
  message: string;
}

function DeviceErrorToast({
  toast,
  onDismiss,
}: {
  toast: DeviceToast;
  onDismiss: () => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const autoClose = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 350);
    }, 6000);
    return () => clearTimeout(autoClose);
  }, [onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 18px",
        background: "rgba(20, 20, 25, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(248, 113, 113, 0.25)",
        borderRadius: "12px",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(248, 113, 113, 0.08)",
        maxWidth: "380px",
        width: "100%",
        animation: isExiting
          ? "toast-slide-out 0.35s cubic-bezier(0.4, 0, 1, 1) forwards"
          : "toast-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "rgba(248, 113, 113, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "20px", color: "#f87171" }}
        >
          {toast.source === "Camera" ? "videocam_off" : "mic_off"}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.825rem",
            fontWeight: 600,
            color: "#f87171",
            marginBottom: "4px",
          }}
        >
          {toast.title}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#ccc3d4",
            lineHeight: "1.5",
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px",
          color: "#968e9d",
          flexShrink: 0,
          lineHeight: 1,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#e2e1eb")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#968e9d")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          close
        </span>
      </button>
    </div>
  );
}

/* ── Stage area (grid of participants) ───────────────────────────── */
function StageArea() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: "calc(100vh - var(--lk-control-bar-height) - 60px)" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

/* ── Main VideoRoom component ────────────────────────────────────── */
export default function VideoRoom({ token, url, roomId, role, userName, onLeave }: VideoRoomProps) {
  const [toasts, setToasts] = useState<DeviceToast[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const isTranscribingRef = useRef(false);
  let toastIdRef = 0;

  // Initialize Speech Recognition for Teacher
  useEffect(() => {
    if (role !== "teacher" || typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isTranscribingRef.current = true;
      console.log("Teacher Live Transcription Started");
    };

    recognition.onresult = async (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            console.log("Saving transcript:", transcript);
            await saveTranscriptLine(roomId, transcript, userName);
          }
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (isTranscribingRef.current) {
        // Automatically restart if it stops unexpectedly
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {}

    return () => {
      isTranscribingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [role, roomId, userName]);

  const handleEndSessionAndGenerateQuiz = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    // Stop transcribing
    if (recognitionRef.current) {
      isTranscribingRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      
      alert("AI has generated a quiz based on your lecture! Students can now see it on their dashboard.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error generating quiz. Please check console.");
      setIsGenerating(false);
    }
  };

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getErrorDetails = (
    source: Track.Source,
    error: Error
  ): { title: string; message: string } => {
    const sourceName = source === Track.Source.Camera ? "Camera" : "Microphone";

    if (error.name === "NotAllowedError" || error.message.toLowerCase().includes("permission denied")) {
      return {
        title: `${sourceName} Access Blocked`,
        message: `Your browser denied ${sourceName.toLowerCase()} access.`,
      };
    }
    return { title: `${sourceName} Error`, message: error.message };
  };

  const handleDeviceError = useCallback(
    (err: { source: Track.Source; error: Error }) => {
      const sourceName = err.source === Track.Source.Camera ? "Camera" : "Microphone";
      const { title, message } = getErrorDetails(err.source, err.error);
      const id = ++toastIdRef;
      setToasts((prev) => [...prev, { id, source: sourceName, title, message }]);
    },
    []
  );

  if (!token || !url) return null;

  return (
    <div
      style={{
        height: "100%",
        width: "100vw",
        backgroundColor: "#08080B",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {role === "teacher" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 24px", background: "rgba(160,124,254,0.1)", borderBottom: "1px solid rgba(160,124,254,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cfbcff", fontSize: "0.85rem" }}>
            <span className="material-symbols-outlined" style={{ animation: "pulse 2s infinite" }}>mic</span>
            AI is transcribing your lecture to auto-generate a quiz...
          </div>
          <button 
            onClick={handleEndSessionAndGenerateQuiz}
            disabled={isGenerating}
            style={{
              background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
              color: "#090A0F", border: "none", borderRadius: "8px", padding: "8px 16px",
              fontSize: "0.875rem", fontWeight: 700, cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px", opacity: isGenerating ? 0.7 : 1
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
            {isGenerating ? "Generating AI Quiz..." : "End Session & Generate Quiz"}
          </button>
        </div>
      )}

      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={url}
        onDisconnected={onLeave}
        connect={true}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <LayoutContextProvider>
          <div className="lk-video-conference">
            <div className="lk-video-conference-inner">
              <StageArea />
              <ControlBar
                variation="verbose"
                onDeviceError={handleDeviceError}
              />
            </div>
            <Chat />
          </div>
        </LayoutContextProvider>
        <RoomAudioRenderer />
      </LiveKitRoom>

      <div
        style={{
          position: "fixed",
          top: "80px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <DeviceErrorToast
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>

      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toast-slide-out {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to { opacity: 0; transform: translateX(40px) scale(0.95); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
