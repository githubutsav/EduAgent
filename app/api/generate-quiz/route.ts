import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { roomId, topic, numQuestions, transcriptsText } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    // Use transcripts text from client, fallback if empty
    const combinedTranscript = transcriptsText && transcriptsText.trim()
      ? transcriptsText
      : "The lecture covered the basics of Algebra including polynomials, vertex calculations, and factoring quadratic equations.";

    const groqApiKey = process.env.GROQ_API_KEY;
    
    let quizQuestions = [];
    let aiResponse = "";
    let usedMock = false;

    const count = typeof numQuestions === "number" ? Math.max(1, Math.min(20, numQuestions)) : 3;

    const promptSystem = topic 
      ? `You are an expert educator. Generate a ${count}-question multiple choice quiz based strictly on the topic provided. Your response MUST be valid JSON containing an array of objects. Each object must have: 'question' (string), 'options' (array of exactly 4 strings), and 'correctAnswer' (string, must exactly match one of the options). Do not include any markdown formatting, only output the JSON array.`
      : `You are an expert educator. You will be given a transcript of a live class lecture. Generate a ${count}-question multiple choice quiz based strictly on the content of the transcript. Your response MUST be valid JSON containing an array of objects. Each object must have: 'question' (string), 'options' (array of exactly 4 strings), and 'correctAnswer' (string, must exactly match one of the options). Do not include any markdown formatting, only output the JSON array.`;
    const promptUser = topic
      ? `Generate a quiz on the topic: "${topic}".`
      : `Here is the transcript:\n\n${combinedTranscript}`;

    try {
      if (!groqApiKey) throw new Error("GROQ_API_KEY missing");
      const groq = new Groq({ apiKey: groqApiKey });
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: promptUser }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
      });

      aiResponse = completion.choices[0]?.message?.content || "[]";
    } catch (groqError: any) {
      console.warn("Groq failed or key missing, generating a demo quiz:", groqError.message);
      usedMock = true;
      const allMockQuestions = [
        {
          question: "Based on the AI Demo transcript, what is the core topic?",
          options: ["Polynomials", "Chemistry", "World History", "Physical Education"],
          correctAnswer: "Polynomials"
        },
        {
          question: "How do you factor x^2 - 9?",
          options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)^2", "It cannot be factored"],
          correctAnswer: "(x-3)(x+3)"
        },
        {
          question: "This is an auto-generated AI Demo question. Which answer is correct?",
          options: ["This one", "Not this one", "Nope", "Wrong"],
          correctAnswer: "This one"
        },
        {
          question: "What is the result of expanding (x + 2)^2?",
          options: ["x^2 + 4x + 4", "x^2 + 4", "x^2 + 2x + 4", "x^2 + 2"],
          correctAnswer: "x^2 + 4x + 4"
        },
        {
          question: "In algebra, what is a variable?",
          options: ["A symbol representing an unknown value", "A constant number", "An equation sign", "A type of fraction"],
          correctAnswer: "A symbol representing an unknown value"
        }
      ];
      quizQuestions = [];
      for (let i = 0; i < count; i++) {
        quizQuestions.push(allMockQuestions[i % allMockQuestions.length]);
      }
    }

    if (!usedMock) {
      try {
        const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        quizQuestions = JSON.parse(cleanJson);
      } catch (err) {
        console.error("Failed to parse AI response as JSON:", aiResponse);
        throw new Error("AI returned invalid format.");
      }
    }

    return NextResponse.json({ success: true, questions: quizQuestions });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
}
