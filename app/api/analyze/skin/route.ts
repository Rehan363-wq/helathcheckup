import { analyzeSkinImage } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, patientId } = body;

    if (!imageBase64 || !mimeType) {
      return Response.json(
        { error: "imageBase64 and mimeType are required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const resultText = await analyzeSkinImage(imageBase64, mimeType);

    // Clean and parse the JSON response from Gemini
    const cleanedText = resultText
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
        throw new Error("AI response was not valid JSON. Please try again.");
      }
    }

    // Validate required fields
    if (!result.condition || result.confidence === undefined || !result.severity) {
      throw new Error("AI response missing required fields. Please try again.");
    }

    // Clamp confidence between 0-100
    result.confidence = Math.max(0, Math.min(100, Math.round(result.confidence)));

    // Ensure valid severity
    if (!["low", "medium", "high"].includes(result.severity)) {
      result.severity = "medium";
    }

    // Save to Supabase (non-blocking — don't fail if DB save fails)
    try {
      const supabase = createServiceClient();
      await supabase.from("scan_results").insert({
        patient_id: patientId || null,
        condition: result.condition,
        confidence: result.confidence,
        severity: result.severity,
        description: result.description,
        recommendation: result.recommendation,
        ai_result: result,
      });
    } catch (dbError) {
      console.warn("Failed to save scan to Supabase:", dbError);
      // Continue — don't block the response
    }

    return Response.json(result);
  } catch (error) {
    console.error("Skin analysis error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze image. Please try again.",
      },
      { status: 500 }
    );
  }
}
