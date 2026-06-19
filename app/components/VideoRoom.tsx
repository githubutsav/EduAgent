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
import { useCallback, useState, useEffect } from "react";

interface VideoRoomProps {
  token: string;
  url: string;
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
      {/* Icon */}
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

      {/* Content */}
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

      {/* Close button */}
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
        aria-label="Dismiss"
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
      style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}

/* ── Main VideoRoom component ────────────────────────────────────── */
export default function VideoRoom({ token, url, onLeave }: VideoRoomProps) {
  const [toasts, setToasts] = useState<DeviceToast[]>([]);
  let toastIdRef = 0;

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getErrorDetails = (
    source: Track.Source,
    error: Error
  ): { title: string; message: string } => {
    const sourceName =
      source === Track.Source.Camera ? "Camera" : "Microphone";

    if (
      error.name === "NotAllowedError" ||
      error.message.toLowerCase().includes("permission denied")
    ) {
      return {
        title: `${sourceName} Access Blocked`,
        message: `Your browser denied ${sourceName.toLowerCase()} access. Click the lock icon in the address bar → set ${sourceName} to "Allow" → refresh.`,
      };
    }

    if (
      error.name === "NotFoundError" ||
      error.message.toLowerCase().includes("not found")
    ) {
      return {
        title: `No ${sourceName} Detected`,
        message: `No ${sourceName.toLowerCase()} was found on this device. Please connect one and try again.`,
      };
    }

    if (
      error.name === "NotReadableError" ||
      error.message.toLowerCase().includes("in use") ||
      error.message.toLowerCase().includes("could not start")
    ) {
      return {
        title: `${sourceName} Unavailable`,
        message: `Your ${sourceName.toLowerCase()} may be in use by another application. Close other apps using it and retry.`,
      };
    }

    return {
      title: `${sourceName} Error`,
      message: error.message || `An unexpected error occurred with your ${sourceName.toLowerCase()}.`,
    };
  };

  const handleDeviceError = useCallback(
    (err: { source: Track.Source; error: Error }) => {
      console.error(
        `[LiveKit] Device error for ${err.source}:`,
        err.error.name,
        err.error.message
      );

      const sourceName =
        err.source === Track.Source.Camera ? "Camera" : "Microphone";
      const { title, message } = getErrorDetails(err.source, err.error);

      const id = ++toastIdRef;
      setToasts((prev) => [...prev, { id, source: sourceName, title, message }]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!token || !url) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08080B",
          color: "#f87171",
          fontFamily: "Inter, sans-serif",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
          error
        </span>
        <span style={{ fontWeight: 600 }}>
          LiveKit connection misconfigured or token missing.
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#08080B",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
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

      {/* ── Toast notification stack ──────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: "20px",
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

      {/* ── Toast animations ─────────────────────────────────────── */}
      <style>{`
        @keyframes toast-slide-in {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toast-slide-out {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
