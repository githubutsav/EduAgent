import { saveTranscriptLine } from "./firestore";

export class TranscriptManager {
  private recognition: any = null;
  private accumulatedText: string = "";
  private roomId: string;
  private userName: string;
  private intervalId: any = null;
  private isStarted: boolean = false;

  constructor(roomId: string, userName: string) {
    this.roomId = roomId;
    this.userName = userName;
  }

  start() {
    if (typeof window === "undefined" || this.isStarted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    this.isStarted = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = "en-US";

    this.recognition.onstart = () => {
      console.log("Speech recognition session started.");
    };

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim();
          if (transcript) {
            console.log("Transcribed speech segment:", transcript);
            this.accumulatedText += (this.accumulatedText ? " " : "") + transcript;
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error encountered:", event.error);
    };

    this.recognition.onend = () => {
      // Automatically restart Speech Recognition if it stops while manager is still active
      if (this.isStarted && this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error("Failed to restart speech recognition:", e);
        }
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }

    // Set interval to flush the accumulated text to Firestore every 60 seconds (1 minute)
    this.intervalId = setInterval(() => {
      this.flush();
    }, 60000);
  }

  async flush() {
    const textToSave = this.accumulatedText.trim();
    if (textToSave) {
      this.accumulatedText = "";
      console.log("Saving 1-minute transcript chunk to Firestore:", textToSave);
      try {
        await saveTranscriptLine(this.roomId, textToSave, this.userName);
      } catch (err) {
        console.error("Error saving transcript chunk to Firestore:", err);
        // Put text back if save fails to avoid losing transcription
        this.accumulatedText = textToSave + (this.accumulatedText ? " " + this.accumulatedText : "");
      }
    }
  }

  async stop() {
    this.isStarted = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const rec = this.recognition;
    this.recognition = null;
    if (rec) {
      try {
        rec.stop();
      } catch (e) {
        console.error("Error stopping Speech Recognition:", e);
      }
    }

    // Perform a final flush to store any remaining text spoken before stopping
    await this.flush();
  }
}
