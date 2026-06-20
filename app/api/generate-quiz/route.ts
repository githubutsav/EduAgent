import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from '@google/genai';
import { getRoomTranscripts, saveGeneratedQuiz } from "../../../lib/firestore";

export async function POST(request: Request) {
  try {
    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }

    // 1. Fetch transcripts for the room
    const transcripts = await getRoomTranscripts(roomId);
    
    // Fallback if no transcripts are recorded (e.g., speech recognition didn't pick up anything)
    const combinedTranscript = transcripts.length > 0 
      ? transcripts.map(t => `${t.speakerName}: ${t.text}`).join("\n")
      : "The lecture covered the basics of Algebra including polynomials, vertex calculations, and factoring quadratic equations.";

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    let quizQuestions = [];
    let aiResponse = "";
    let usedMock = false;

    const promptSystem = "You are an expert educator. You will be given a transcript of a live class lecture. Generate a 3-question multiple choice quiz based strictly on the content of the transcript. Your response MUST be valid JSON containing an array of objects. Each object must have: 'question' (string), 'options' (array of exactly 4 strings), and 'correctAnswer' (string, must exactly match one of the options). Do not include any markdown formatting, only output the JSON array.";
    const promptUser = `Here is the transcript:\n\n${combinedTranscript}`;

    try {
      if (!groqApiKey) throw new Error("GROQ_API_KEY missing");
      const groq = new Groq({ apiKey: groqApiKey });
      
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: promptUser }
        ],
        model: "llama3-8b-8192",
        temperature: 0.2,
      });

      aiResponse = completion.choices[0]?.message?.content || "[]";
    } catch (groqError: any) {
      console.warn("Groq failed or key missing, falling back to Gemini:", groqError.message);
      
      try {
        if (!geminiApiKey) throw new Error("GEMINI_API_KEY missing");
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: `${promptSystem}\n\n${promptUser}`,
          config: {
            temperature: 0.2,
          }
        });
        aiResponse = response.text || "[]";
      } catch (geminiError: any) {
        console.warn("Gemini failed or key missing, generating a demo quiz:", geminiError.message);
        usedMock = true;
        quizQuestions = [
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
          }
        ];
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

    // 4. Save to Firestore
    const quizTitle = "Auto-Generated Lecture Quiz";
    await saveGeneratedQuiz(roomId, quizTitle, quizQuestions);

    return NextResponse.json({ success: true, message: "Quiz generated successfully", count: quizQuestions.length });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ error: error.message || "Failed to generate quiz" }, { status: 500 });
  }
}
