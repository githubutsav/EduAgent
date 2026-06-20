import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { quizTitle, questions } = await req.json();

    if (!quizTitle || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid quiz data provided." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // Fallback for Demo Mode without an API key
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          const fallbackMessage = "⚠️ **No AI API Keys configured.**\n\nTo see real AI analysis, please add your Groq API Key to your `.env` file.\n\nHere is a mock analysis for demo purposes:\n\nYou did a great job overall, but it seems you struggled with factoring polynomials and expanding binomials. I recommend reviewing the FOIL method and practicing difference of squares. Keep up the great work!";
          
          const words = fallbackMessage.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise(r => setTimeout(r, 50)); // Mock streaming delay
          }
          controller.close();
        }
      });
      return new Response(customReadable, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    // Prepare a clean prompt using the quiz data
    const wrongAnswers = questions.filter((q: any) => !q.isCorrect);
    const score = Math.round(((questions.length - wrongAnswers.length) / questions.length) * 100);

    const prompt = `
You are an expert AI tutor helping a student review their quiz titled "${quizTitle}".
They scored ${score}%.

Here are the questions they got WRONG:
${wrongAnswers.map((q: any, i: number) => `
${i + 1}. Question: ${q.question}
Student Answer: ${q.studentAnswer}
Correct Answer: ${q.correctAnswer}
`).join("\n")}

If they got 100%, praise them. 
Otherwise, briefly analyze their mistakes. Identify the specific underlying concepts they are weak in, and give them actionable, encouraging advice on what to study next.
Do NOT give them the answers again, they already see them. Focus purely on conceptual advice and encouragement.
Format your response using clean Markdown with bullet points or short paragraphs. Be concise.
`;

    const encoder = new TextEncoder();

    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile", // Powerful model for tutoring
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
      console.error("Groq streaming failed:", err);
      throw new Error("Groq API failed: " + err.message);
    }

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI analysis." }, { status: 500 });
  }
}
