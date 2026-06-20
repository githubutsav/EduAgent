import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid chat history provided." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          const fallbackMessage = "⚠️ **No AI API Keys configured.** Please add GROQ_API_KEY to your .env file.";
          const words = fallbackMessage.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise(r => setTimeout(r, 30));
          }
          controller.close();
        }
      });
      return new Response(customReadable, { headers: { "Content-Type": "text/event-stream" } });
    }

    const encoder = new TextEncoder();

    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chatCompletion) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
      });
    } catch (err: any) {
      console.error("Groq streaming failed in chat:", err);
      throw new Error("Groq API failed: " + err.message);
    }

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate chat." }, { status: 500 });
  }
}
