import { saveTranscriptLine } from "./firestore";

export class TranscriptManager {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private roomId: string;
  private userName: string;
  private intervalId: any = null;
  private isStarted: boolean = false;
  private onStatusChange?: (status: "listening" | "error" | "mocking") => void;

  constructor(roomId: string, userName: string, onStatusChange?: (status: "listening" | "error" | "mocking") => void) {
    this.roomId = roomId;
    this.userName = userName;
    this.onStatusChange = onStatusChange;
  }

  async start() {
    if (typeof window === "undefined" || this.isStarted) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isStarted = true;
      this.audioChunks = [];

      this.startRecordingChunk();

      if (this.onStatusChange) {
        this.onStatusChange("listening");
      }

      // Every 1 minute, slice the recording and send it
      this.intervalId = setInterval(() => {
        this.rotateChunk();
      }, 60000); // 1 minute
      
      console.log("Whisper Transcription Manager started.");
    } catch (e: any) {
      console.error("Failed to access microphone:", e);
      if (this.onStatusChange) {
        this.onStatusChange("error");
      }
    }
  }

  private startRecordingChunk() {
    if (!this.stream) return;
    
    // Choose standard container format supported by the browser
    const options = { mimeType: "audio/webm" };
    
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      // Fallback if audio/webm is not supported (e.g. Safari)
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.audioChunks = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || "audio/webm" });
      if (audioBlob.size > 0) {
        this.sendAudioChunkForTranscription(audioBlob);
      }
    };

    this.mediaRecorder.start();
  }

  private rotateChunk() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      // Stopping triggers onstop, which flushes and transcribes the chunk
      this.mediaRecorder.stop();
      // Start recording the next chunk immediately
      this.startRecordingChunk();
    }
  }

  private async sendAudioChunkForTranscription(audioBlob: Blob) {
    console.log("Sending audio chunk to backend for Whisper transcription, size:", audioBlob.size);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("roomId", this.roomId);
      formData.append("userName", this.userName);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || "Failed to transcribe audio chunk");
      }

      const data = await response.json();
      const text = data.text?.trim();

      if (text) {
        console.log("Received Whisper transcription:", text);
        await saveTranscriptLine(this.roomId, text, this.userName);
      }
    } catch (err) {
      console.error("Whisper transcription failed:", err);
    }
  }

  async stop() {
    this.isStarted = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }

    // Stop all audio tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    console.log("Whisper Transcription Manager stopped.");
  }

  // Flush remaining text is handled automatically by stop() triggering MediaRecorder's stop and saving the final chunk
  async flush() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
      this.startRecordingChunk();
    }
  }
}
