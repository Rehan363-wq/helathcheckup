import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { validateApiRequest, checkRateLimit } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(request).success) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    if (!(await validateApiRequest(request))) {
      return Response.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const body = await request.json();
    const { messages, doctorProfile, patientProfile } = body;

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "messages array is required" }, { status: 400 });
    }

    if (!doctorProfile) {
      return Response.json({ error: "doctorProfile is required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return Response.json({
        reply: "Your doctor is currently busy. For emergencies, please visit the nearest clinic or hospital immediately."
      });
    }

    const doctorName = doctorProfile.full_name || "Doctor";
    const specialization = doctorProfile.specialization || "General Physician";
    const degree = doctorProfile.degree || "MBBS";
    const exp = doctorProfile.experience_years || 5;

    let patientContextStr = "No patient medical profile available.";
    if (patientProfile) {
      patientContextStr = `Patient Name: ${patientProfile.name || "Patient"}
Age: ${patientProfile.age || "Unknown"}
Gender: ${patientProfile.gender || "Unknown"}
Conditions: ${patientProfile.conditions?.join(", ") || "None"}
Medications: ${patientProfile.medications?.join(", ") || "None"}
Allergies: ${patientProfile.allergies?.join(", ") || "None"}
Goals: ${patientProfile.health_goals?.join(", ") || "None"}`;
    }

    const lang = patientProfile?.language_preference || "hinglish";
    let langInstruction = `Respond in Hinglish (natural mix of Hindi and English) as is common in Indian clinical settings (e.g., "Aapko regular medicines skip nahi karni chahiye", "Aap rest karein aur warm water pijiye").`;
    if (lang === "english") {
      langInstruction = `Respond strictly in professional and friendly English. Do not use Hindi/Hinglish terms.`;
    } else if (lang === "hindi") {
      langInstruction = `Respond in clear, natural Hindi (Devanagari script) (e.g., "आपको नियमित दवाएं नहीं छोड़नी चाहिए", "आप आराम करें और गुनगुना पानी पिएं").`;
    }

    const systemPrompt = `You are ${doctorName}, a clinical expert specializing as a ${specialization}. You hold the degree ${degree} with ${exp} years of clinical experience.
You are conducting a private telemedicine chat consultation with a patient.

Here is the patient's medical profile for context:
${patientContextStr}

## Guidelines:
1. Speak like a professional, compassionate medical practitioner.
2. ${langInstruction}
3. Give scientifically accurate, clinical recommendations. Highlight safety, precautions, or red-flag warning signs (e.g. high fever, shortness of breath, acute pain) when the patient should go to a clinic immediately.
4. Keep the response concise, engaging, and empathetic. Do not use blocky text or markdown formatting. Keep it to 3-5 sentences maximum.
5. Provide a direct, natural chat response (No JSON, just plain text).`;

    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.4,
        topP: 0.8,
        maxOutputTokens: 500,
      },
    });

    const contents = [
      { role: "user" as const, parts: [{ text: systemPrompt }] },
      { role: "model" as const, parts: [{ text: `Understood. I will act as ${doctorName} (${specialization}) and chat with the patient accordingly.` }] },
      ...messages.map((m: any) => ({
        role: m.sender_id === doctorProfile.id ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      })),
    ];

    const result = await model.generateContent({ contents });
    const replyText = result.response.text().trim();

    return Response.json({ reply: replyText });
  } catch (error) {
    console.error("AI Doctor Consultation Chat Error:", error);
    return Response.json({
      reply: "I am currently unable to generate a response. Please describe your symptoms in simple terms or visit a clinic."
    });
  }
}
