"use client";

import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles/dist/index.css";

interface VideoRoomProps {
  token: string;
  url: string;
  onLeave: () => void;
}

export default function VideoRoom({ token, url, onLeave }: VideoRoomProps) {
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
        <span style={{ fontWeight: 600 }}>LiveKit connection misconfigured or token missing.</span>
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
        video={true}
        audio={true}
        token={token}
        serverUrl={url}
        onDisconnected={onLeave}
        connect={true}
        data-lk-theme="default"
        style={{ height: "100%" }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
