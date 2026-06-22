import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No audio file received" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not defined in the environment.");
      return NextResponse.json({ error: "API configuration missing on the server" }, { status: 500 });
    }

    // Build the request body for Groq's OpenAI-compatible Audio API
    const groqFormData = new FormData();
    groqFormData.append("file", file);
    groqFormData.append("model", "whisper-large-v3");
    groqFormData.append("response_format", "json");

    console.log("Posting audio chunk to Groq Whisper transcription service...");
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Whisper API returned an error:", errText);
      return NextResponse.json({ error: "Transcription service failed" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (error: any) {
    console.error("Error in transcription API endpoint:", error);
    return NextResponse.json({ error: error.message || "Internal server error during transcription" }, { status: 500 });
  }
}
