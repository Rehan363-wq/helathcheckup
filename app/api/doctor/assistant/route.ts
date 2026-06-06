import { runDoctorAssistant } from "@/lib/gemini";
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
    const { doctorContext, patientSummary, query } = body;

    if (!doctorContext || !patientSummary) {
      return Response.json({ error: "doctorContext and patientSummary are required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return Response.json({
        patient_brief: "Gemini API key missing. Add GOOGLE_GEMINI_API_KEY in .env.local.",
        key_risk_factors: [],
        suggested_questions: [],
        medication_alerts: [],
        possible_conditions: [],
        recommended_tests: [],
        consultation_tip: "Setup API key to enable AI assistant.",
      });
    }

    const rawResponse = await runDoctorAssistant(doctorContext, patientSummary, query || undefined);

    // Clean JSON response
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
    console.error("Doctor Assistant API Error:", error);
    return Response.json({
      patient_brief: "An error occurred during AI analysis. Please try again.",
      key_risk_factors: [],
      suggested_questions: [],
      medication_alerts: [],
      possible_conditions: [],
      recommended_tests: [],
      consultation_tip: "Please retry.",
    });
  }
}
