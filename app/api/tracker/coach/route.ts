import { runHealthCoach } from "@/lib/gemini";
import { NextRequest } from "next/server";
import { validateApiRequest, checkRateLimit } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(request).success) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    if (!(await validateApiRequest(request))) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const body = await request.json();
    const { healthData, messages, languagePreference } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return Response.json({
        reply: "Oops! Gemini API key missing. Add GOOGLE_GEMINI_API_KEY in .env.local to activate the Health Coach.",
        daily_score: null,
        alert: null,
        tip: null,
      });
    }

    // Map content to the parts structure expected by Gemini SDK
    const formattedHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: m.content,
    }));

    const healthDataJson = healthData ? JSON.stringify(healthData) : "{}";
    const rawResponse = await runHealthCoach(healthDataJson, formattedHistory, languagePreference || "hinglish");

    // Clean JSON response (strip markdown fences if any)
    const cleanedText = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\s*\n/gm, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch {
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI response was not valid JSON.");
      }
    }

    return Response.json(result);
  } catch (error) {
    console.error("Health Coach API Error:", error);
    return Response.json({
      reply: "I am unable to generate a response at the moment. Please try again.",
      daily_score: null,
      alert: null,
      tip: null,
    });
  }
}
