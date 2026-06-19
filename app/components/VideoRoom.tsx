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
import { useCallback } from "react";

interface VideoRoomProps {
  token: string;
  url: string;
  onLeave: () => void;
}

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

export default function VideoRoom({ token, url, onLeave }: VideoRoomProps) {
  const handleDeviceError = useCallback(
    (error: { source: Track.Source; error: Error }) => {
      console.error(
        `[LiveKit] Device error for ${error.source}:`,
        error.error.name,
        error.error.message
      );
      if (error.source === Track.Source.Camera) {
        alert(
          `Camera error: ${error.error.message}\n\nPossible causes:\n• No camera connected\n• Camera is in use by another app\n• Browser blocked camera access`
        );
      }
    },
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
    </div>
  );
}
