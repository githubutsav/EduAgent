import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid chat history provided." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!groqApiKey && !geminiApiKey) {
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          const fallbackMessage = "⚠️ **No AI API Keys configured.** Please add GROQ_API_KEY or GEMINI_API_KEY to your .env file.";
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

    // 1. Try Groq Primary
    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const chatCompletion = await groq.chat.completions.create({
          messages: messages,
          model: "llama-3.1-70b-versatile",
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
      } catch (err) {
        console.warn("Groq streaming failed in chat, falling back to Gemini...");
      }
    }

    // 2. Gemini Fallback
    if (geminiApiKey) {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      // Build full conversation context for stateless multi-turn
      const fullHistoryContext = messages.map((m: { role: string; content: string }) => 
        `${m.role.toUpperCase()}: ${m.content}`
      ).join("\n\n");
            
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const fullStream = await ai.models.generateContentStream({
              model: 'gemini-3.1-flash-lite',
              contents: `Here is the chat history:\n\n${fullHistoryContext}\n\nPlease respond to the user's last message.`
            });

            for await (const chunk of fullStream) {
              if (chunk.text) {
                controller.enqueue(encoder.encode(chunk.text));
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
    }

    throw new Error("Both AI providers failed.");

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate chat." }, { status: 500 });
  }
}
