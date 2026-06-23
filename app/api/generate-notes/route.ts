import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { roomId, transcriptsText } = await req.json();

    if (!roomId || !transcriptsText) {
      return NextResponse.json({ error: "Invalid classroom or transcript data provided." }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // Fallback for Demo Mode without an API key
      const encoder = new TextEncoder();
      const customReadable = new ReadableStream({
        async start(controller) {
          const fallbackMessage = `⚠️ **No AI API Keys configured.**\n\nTo see real AI note generation, please add your Groq API Key to your \`.env\` file.\n\nHere are some mock notes generated for classroom **${roomId}**:\n\n# Lecture Notes: Introduction to Algebra & Factoring\n\n## 1. Lecture Overview\nThis session covered basic algebraic principles, focusing on polynomial definitions and methods for factoring expressions, specifically difference of squares and expanding binomials using the FOIL method.\n\n## 2. Key Concepts & Definitions\n- **Polynomial**: An expression consisting of variables and coefficients, that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponents.\n- **FOIL Method**: First, Outer, Inner, Last. A mnemonic for expanding products of two binomials:\n  $$(a+b)(c+d) = ac + ad + bc + bd$$\n- **Difference of Squares**: An algebraic pattern where: \n  $$a^2 - b^2 = (a-b)(a+b)$$\n\n## 3. Detailed Breakdown\n### Introduction to Polynomials\nThe instructor introduced polynomials as fundamental building blocks of algebra. We discussed how to identify terms and exponents.\n\n### The FOIL Expansion\nWe practiced multiplying binomials like $$(x + 3)(x - 2)$$:\n1. **First**: $$x \\cdot x = x^2$$\n2. **Outer**: $$x \\cdot (-2) = -2x$$\n3. **Inner**: $$3 \\cdot x = 3x$$\n4. **Last**: $$3 \\cdot (-2) = -6$$\nCombining like terms gives: $$x^2 + x - 6$$.\n\n### Factoring Techniques\nWe moved from expanding back to factoring. Specifically, recognizing patterns like $$x^2 - 9$$ as $$(x-3)(x+3)$$.\n\n## 4. Examples & Problems\n- **Example 1**: Expand $$(2x + 1)(x - 4)$$.\n  - Result: $$2x^2 - 7x - 4$$.\n- **Example 2**: Factor $$4x^2 - 25$$.\n  - Result: $$(2x-5)(2x+5)$$.\n\n## 5. Key Takeaways\n- Always check if an expression matches a standard formula (like difference of squares) before trying complex factoring.\n- Pay careful attention to negative signs during FOIL expansion.`;
          
          const words = fallbackMessage.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise(r => setTimeout(r, 20)); // Mock streaming delay
          }
          controller.close();
        }
      });
      return new Response(customReadable, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }

    const prompt = `
You are an expert AI teaching assistant. Your task is to generate comprehensive, high-quality, and structured study notes based on the following classroom lecture transcript.

Classroom Room Code: ${roomId}

Transcript:
${transcriptsText}

Please organize the notes logically using beautiful Markdown. Structure them as follows:
1. **Lecture Overview**: A concise summary of the main topic and goals of the lecture.
2. **Key Concepts & Definitions**: Clear definitions of important terms or concepts introduced.
3. **Detailed Breakdown**: Deep dive into the main sections or topics discussed in the transcripts, capturing the flow of explanation.
4. **Examples or Case Studies**: Any examples or illustrations provided by the educator during the lecture.
5. **Key Takeaways & Summary**: Actionable summary points for students to review.

Format using clean Markdown with bolding, lists, and headers. Make sure it is engaging, highly readable, and easy to study.
`;

    const encoder = new TextEncoder();

    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
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
      console.error("Groq streaming failed in note generation:", err);
      throw new Error("Groq API failed: " + err.message);
    }

  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI notes." }, { status: 500 });
  }
}
