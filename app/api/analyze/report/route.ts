import { analyzeReport } from "@/lib/gemini";
import { createServiceClient } from "@/lib/supabase/server";
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
    const { imageBase64, mimeType, isImage, reportText, patientId, languagePreference } = body;

    if (!imageBase64 && !reportText) {
      return Response.json(
        { error: "Either imageBase64 or reportText is required" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return Response.json(
        { error: "Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const resultText = await analyzeReport(
      reportText || "",
      isImage,
      imageBase64,
      mimeType,
      languagePreference || "hinglish"
    );

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
    if (!result.parameters || !Array.isArray(result.parameters)) {
      throw new Error("AI response missing parameters array. Please try again.");
    }

    // Validate and normalize each parameter
    result.parameters = result.parameters.map((param: Record<string, unknown>) => ({
      name: param.name || "Unknown Parameter",
      value: param.value || "N/A",
      normalRange: param.normalRange || "N/A",
      status: ["normal", "low", "high"].includes(param.status as string)
        ? param.status
        : "normal",
      explanation: param.explanation || "No explanation available.",
    }));

    // Ensure valid urgency
    if (!["normal", "consult", "urgent"].includes(result.urgency)) {
      const abnormalCount = result.parameters.filter(
        (p: { status: string }) => p.status !== "normal"
      ).length;
      result.urgency = abnormalCount === 0 ? "normal" : abnormalCount <= 2 ? "consult" : "urgent";
    }

    // Ensure summary exists
    if (!result.summary) {
      result.summary = "Report analysis complete. Please review individual parameters above.";
    }

    // Save to Supabase (non-blocking)
    try {
      const supabase = createServiceClient();
      await supabase.from("report_analysis").insert({
        patient_id: patientId || null,
        summary: result.summary,
        urgency: result.urgency,
        parameters: result.parameters,
        ai_result: result,
      });
    } catch (dbError) {
      console.warn("Failed to save report to Supabase:", dbError);
    }

    return Response.json(result);
  } catch (error) {
    console.error("Report analysis error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to analyze report. Please try again.",
      },
      { status: 500 }
    );
  }
}
