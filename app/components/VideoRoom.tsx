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
  useLayoutContext,
  FocusLayoutContainer,
  FocusLayout,
  CarouselLayout,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { useCallback, useState, useEffect, useRef } from "react";
import { saveTranscriptLine, getRoomTranscripts, saveGeneratedQuiz } from "../../lib/firestore";
import { useRouter } from "next/navigation";
import { TranscriptManager } from "../../lib/transcript";
import QuickAlert from "./QuickAlert";

interface VideoRoomProps {
  token: string;
  url: string;
  roomId: string;
  role: "teacher" | "student";
  userName: string;
  onLeave: () => void;
}

interface CustomVideoConferenceProps {
  handleDeviceError: (err: { source: Track.Source; error: Error }) => void;
}

function CustomVideoConference({ handleDeviceError }: CustomVideoConferenceProps) {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext.widget.state?.showChat;

  return (
    <div className="lk-video-conference" style={{ position: "relative" }}>
      <div className="lk-video-conference-inner">
        <StageArea />
        <ControlBar
          variation="verbose"
          onDeviceError={handleDeviceError}
        />
      </div>
      {showChat && <Chat />}
      
      {/* Chat Toggle Button */}
      <button
        onClick={() => {
          layoutContext.widget.dispatch?.({ msg: "toggle_chat" });
        }}
        style={{
          position: "absolute",
          bottom: "80px",
          right: showChat ? "340px" : "20px",
          zIndex: 1000,
          background: "rgba(30, 30, 35, 0.85)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#cfbcff",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(160, 124, 254, 0.25)";
          e.currentTarget.style.borderColor = "rgba(160, 124, 254, 0.4)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(30, 30, 35, 0.85)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.color = "#cfbcff";
        }}
        title={showChat ? "Hide Chat" : "Show Chat"}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
          {showChat ? "chat_bubble" : "forum"}
        </span>
      </button>
    </div>
  );
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
  const layoutContext = useLayoutContext();
  const pinnedTracks = layoutContext.pin.state || [];
  
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const hasPinnedTracks = pinnedTracks.length > 0;

  if (hasPinnedTracks) {
    const mainTrack = pinnedTracks[0];
    const carouselTracks = tracks.filter(
      (t) => t.participant.identity !== mainTrack.participant.identity
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--lk-control-bar-height) - 100px)", gap: "12px", padding: "12px 24px 0 24px", boxSizing: "border-box" }}>
        {/* View All Users Button Bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button
            onClick={() => {
              layoutContext.pin.dispatch?.({ msg: "clear_pin" });
            }}
            style={{
              background: "rgba(160, 124, 254, 0.15)",
              color: "#cfbcff",
              border: "1px solid rgba(160, 124, 254, 0.35)",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(160, 124, 254, 0.08)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(160, 124, 254, 0.25)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(160, 124, 254, 0.15)";
              e.currentTarget.style.color = "#cfbcff";
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>grid_view</span>
            View All Users
          </button>
        </div>

        {/* Full Screen Focus Area */}
        <div style={{ flex: 1, minHeight: 0, position: "relative", width: "100%", height: "100%" }}>
          <FocusLayout trackRef={mainTrack} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    );
  }

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
  const [transcriptionStatus, setTranscriptionStatus] = useState<"listening" | "error" | "mocking">("listening");
  const [isListening, setIsListening] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [numQuestionsSelection, setNumQuestionsSelection] = useState(5);
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string } | null>(null);
  const router = useRouter();
  const transcriptManagerRef = useRef<TranscriptManager | null>(null);
  let toastIdRef = 0;

  // Perform cleanup of TranscriptManager on unmount
  useEffect(() => {
    return () => {
      if (transcriptManagerRef.current) {
        transcriptManagerRef.current.stop();
        transcriptManagerRef.current = null;
      }
    };
  }, []);

  const handleToggleListening = async () => {
    if (isListening) {
      if (transcriptManagerRef.current) {
        await transcriptManagerRef.current.stop();
        transcriptManagerRef.current = null;
      }
      setIsListening(false);
      setTranscriptionStatus("listening");
    } else {
      setIsListening(true);
      const manager = new TranscriptManager(roomId, userName, (status) => {
        setTranscriptionStatus(status);
        if (status === "error") {
          setIsListening(false);
        }
      });
      manager.start();
      transcriptManagerRef.current = manager;
    }
  };

  const handleSimulateSpeech = async () => {
    try {
      setTranscriptionStatus("mocking");
      const mockText = "Today we will cover the fundamentals of Physics, specifically focusing on Newton's Laws of Motion. Newton's first law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. This is also known as the law of inertia. The second law describes force as the product of mass and acceleration, represented by the equation F equals m times a. The third law states that for every action, there is an equal and opposite reaction.";
      
      await saveTranscriptLine(roomId, mockText, "Educator (Simulated)");
      alert("Simulated class lecture data successfully pushed to the database! You can now click 'Generate Quiz'.");
    } catch (e: any) {
      console.error(e);
      alert("Failed to simulate speech: " + e.message);
      setTranscriptionStatus("error");
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      // 1. Verify transcripts exist client-side before opening config modal
      const transcripts = await getRoomTranscripts(roomId);
      if (transcripts.length === 0) {
        setToastAlert({
          title: "No Lecture Data Found",
          message: "Please speak or simulate class lecture data first before generating a quiz."
        });
        return;
      }
      setIsQuestionModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setToastAlert({
        title: "Error checking transcripts",
        message: err.message || "Failed to check classroom transcripts."
      });
    }
  };

  const handleConfirmGenerateQuiz = async () => {
    setIsQuestionModalOpen(false);
    setIsGenerating(true);
    
    // Flush remaining text from transcription manager to DB in real-time
    if (transcriptManagerRef.current && isListening) {
      try {
        await transcriptManagerRef.current.flush();
      } catch (e) {
        console.error("Error flushing remaining transcript:", e);
      }
    }

    try {
      // 1. Fetch transcripts client-side
      const transcripts = await getRoomTranscripts(roomId);
      const transcriptsText = transcripts.map(t => `${t.speakerName}: ${t.text}`).join("\n");

      // 2. Fetch generated questions from API
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, numQuestions: numQuestionsSelection, transcriptsText }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }
      
      // 3. Save generated quiz client-side
      const quizTitle = "Auto-Generated Lecture Quiz";
      await saveGeneratedQuiz(roomId, quizTitle, data.questions);

      setToastAlert({
        title: "Quiz Published!",
        message: `AI successfully generated a ${numQuestionsSelection}-question quiz! Students can now access it.`
      });
    } catch (err: any) {
      console.error(err);
      setToastAlert({
        title: "Failed to generate quiz",
        message: err.message || "Please check console logs."
      });
    } finally {
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={handleToggleListening}
              style={{
                background: isListening ? "rgba(239, 68, 68, 0.2)" : "rgba(160,124,254,0.2)",
                color: isListening ? "#f87171" : "#cfbcff",
                border: `1px solid ${isListening ? "rgba(239, 68, 68, 0.4)" : "rgba(160,124,254,0.4)"}`,
                borderRadius: "8px", padding: "6px 14px", fontSize: "0.85rem", fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px", animation: isListening ? "pulse 2s infinite" : "none" }}>
                {isListening ? "mic_off" : "mic"}
              </span>
              {isListening ? "Stop Live Transcription" : "Start Live Transcription"}
            </button>

            {transcriptionStatus === "error" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "0.85rem" }}>
                <span className="material-symbols-outlined" style={{ animation: "pulse 2s infinite" }}>wifi_off</span>
                Voice transcription offline (Speech API unreachable). 
                <button 
                  onClick={handleSimulateSpeech} 
                  style={{
                    background: "none", border: "none", color: "#cfbcff", textDecoration: "underline",
                    cursor: "pointer", padding: 0, font: "inherit", fontWeight: 700, marginLeft: "4px"
                  }}
                >
                  Click here to simulate class lecture data
                </button>
              </div>
            ) : transcriptionStatus === "mocking" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontSize: "0.85rem" }}>
                <span className="material-symbols-outlined">check_circle</span>
                Simulated class lecture data loaded successfully.
              </div>
            ) : isListening ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cfbcff", fontSize: "0.85rem" }}>
                <span className="material-symbols-outlined" style={{ animation: "pulse 2s infinite" }}>radio_button_checked</span>
                Recording active. Speak into your microphone...
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#cbc3d5", fontSize: "0.85rem" }}>
                <span className="material-symbols-outlined">info</span>
                Click start to begin transcribing your lecture notes.
              </div>
            )}
          </div>
          <button 
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            style={{
              background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
              color: "#090A0F", border: "none", borderRadius: "8px", padding: "8px 16px",
              fontSize: "0.875rem", fontWeight: 700, cursor: isGenerating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "6px", opacity: isGenerating ? 0.7 : 1
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>auto_awesome</span>
            {isGenerating ? "Generating AI Quiz..." : "Generate Quiz"}
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
          <CustomVideoConference handleDeviceError={handleDeviceError} />
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

      {isQuestionModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(9, 10, 15, 0.7)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
          padding: "20px"
        }}>
          <div className="glass-card" style={{
            maxWidth: "400px", width: "100%", borderRadius: "16px",
            border: "1px solid rgba(160, 124, 254, 0.25)",
            background: "#121318", padding: "32px", display: "flex", flexDirection: "column",
            gap: "24px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            {/* Modal Header */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="material-symbols-outlined" style={{ color: "#cfbcff", fontSize: "20px" }}>auto_awesome</span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e3e1e9", margin: 0 }}>Configure AI Quiz</h3>
              </div>
              <p style={{ fontSize: "0.825rem", color: "#cbc3d5", margin: 0, lineHeight: "1.5" }}>
                Select how many questions the AI should generate based strictly on your lecture transcripts.
              </p>
            </div>

            {/* Selector Option Pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 600, color: "#ccc3d4", letterSpacing: "0.05em" }}>NUMBER OF QUESTIONS</label>
              
              <div style={{ display: "flex", gap: "8px" }}>
                {[3, 5, 10, 15].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumQuestionsSelection(num)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: "6px", fontSize: "0.825rem", fontWeight: 600,
                      cursor: "pointer", border: "1px solid",
                      background: numQuestionsSelection === num ? "rgba(160, 124, 254, 0.15)" : "rgba(255,255,255,0.02)",
                      color: numQuestionsSelection === num ? "#cfbcff" : "#ccc3d4",
                      borderColor: numQuestionsSelection === num ? "rgba(160, 124, 254, 0.4)" : "rgba(255,255,255,0.08)",
                      transition: "all 0.2s"
                    }}
                  >
                    {num} Qs
                  </button>
                ))}
              </div>

              {/* Slider for custom select */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "#948e9f" }}>Custom select (1-20)</span>
                  <span style={{ fontSize: "0.825rem", color: "#cfbcff", fontWeight: 700 }}>{numQuestionsSelection} Questions</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={numQuestionsSelection}
                  onChange={(e) => setNumQuestionsSelection(Number(e.target.value))}
                  style={{
                    width: "100%", accentColor: "#A07CFE", background: "rgba(255,255,255,0.08)",
                    height: "6px", borderRadius: "3px", cursor: "pointer", outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                style={{
                  flex: 1, background: "rgba(255,255,255,0.03)", color: "#e3e1e9",
                  border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
                  padding: "10px 0", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                  textAlign: "center", transition: "all 0.2s"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGenerateQuiz}
                style={{
                  flex: 2, background: "linear-gradient(90deg, #A07CFE 0%, #FE8495 50%, #FFD270 100%)",
                  color: "#090A0F", border: "none", borderRadius: "8px",
                  padding: "10px 0", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                  textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  boxShadow: "0 0 16px rgba(160,124,254,0.25)"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>auto_awesome</span>
                Generate Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {toastAlert && (
        <QuickAlert
          title={toastAlert.title}
          message={toastAlert.message}
          onClose={() => setToastAlert(null)}
          duration={5000}
        />
      )}

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
