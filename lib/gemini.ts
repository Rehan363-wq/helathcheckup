import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

// Model: Gemini 2.5 Flash — faster, smarter, better multimodal
const MODEL_NAME = "gemini-2.5-flash";

// ============================================================
// DYNAMIC PROMPT BUILDERS
// ============================================================

// ============================================================
// SKIN / WOUND ANALYSIS — Dynamic Prompt Builder
// ============================================================
export function buildSkinAnalysisPrompt(languagePreference: string = "hinglish"): string {
  let langInstruction = "Mix Hindi and English naturally in all text fields (Hinglish mix).";
  let descExample = "Detailed explanation mixing Hindi and English. Describe what the condition is, why it happens, how it looks, and how it spreads. Be thorough — at least 3-4 sentences. Example: 'Ye Tinea Corporis hai, jise commonly Ringworm kehte hain. Ye ek fungal infection hai jo dermatophyte fungi se hota hai. Isme skin pe ring-shaped, red, scaly patches bante hain jo edges pe zyada raised hote hain.'";
  let recExample = "Detailed next steps in Hinglish. Include specific treatments, lifestyle changes, and when to see doctor. Example: 'Ghar pe treatment: 1) Clotrimazole ya Miconazole antifungal cream din mein 2 baar lagao, 2) Area ko dry rakho, 3) Loose cotton kapde pehno.'";
  let disclaimExample = "⚠️ Ye AI-based analysis hai, professional medical diagnosis nahi. AI image se 100% accurate diagnosis nahi de sakta. Agar symptoms serious hain, badh rahe hain, ya pain/fever hai, toh turant doctor se milein. This is AI-based analysis, not a medical diagnosis. AI cannot provide 100% accurate diagnosis from images alone.";

  if (languagePreference === "english") {
    langInstruction = "Explain everything strictly in professional English. Do not mix Hindi/Hinglish.";
    descExample = "Detailed explanation in professional English. Describe what the condition is, why it happens, how it looks, and how it spreads. Be thorough — at least 3-4 sentences. Example: 'This appears to be Tinea Corporis, commonly known as Ringworm. It is a fungal infection caused by dermatophytes. It presents with ring-shaped, red, scaly patches that are more raised at the edges.'";
    recExample = "Detailed next steps in professional English. Include specific treatments, lifestyle changes, and when to see doctor. Example: 'Home treatment: 1) Apply over-the-counter antifungal cream containing Clotrimazole or Miconazole twice daily, 2) Keep the area clean and dry.'";
    disclaimExample = "⚠️ This is an AI-based analysis, not a professional medical diagnosis. AI cannot provide a 100% accurate diagnosis from images alone. Seek immediate medical attention for serious, worsening symptoms or fever.";
  } else if (languagePreference === "hindi") {
    langInstruction = "Explain everything strictly in clear Hindi (Devanagari script).";
    descExample = "Detailed explanation in Hindi (Devanagari). Describe what the condition is, why it happens, how it looks, and how it spreads. Be thorough — at least 3-4 sentences. Example: 'यह टीनिया कॉर्पोरिस है, जिसे आमतौर पर दाद कहा जाता है। यह एक फंगल संक्रमण है जो डर्मेटोफाइट फंगस के कारण होता है। इसमें त्वचा पर अंगूठी के आकार के, लाल, पपड़ीदार पैच बनते हैं जो किनारों पर अधिक उभरे होते हैं।'";
    recExample = "Detailed next steps in Hindi. Include specific treatments, lifestyle changes, and when to see doctor. Example: 'घर पर उपचार: 1) दिन में 2 बार क्लोट्रिमेज़ोल या मिकोनाज़ोल एंटीफंगल क्रीम लगाएं, 2) प्रभावित हिस्से को सूखा रखें।'";
    disclaimExample = "⚠️ यह एआई-आधारित विश्लेषण है, पेशेवर चिकित्सा निदान नहीं। एआई केवल छवियों से 100% सटीक निदान प्रदान नहीं कर सकता है। यदि लक्षण गंभीर हैं, बढ़ रहे हैं, या बुखार है, तो तुरंत डॉक्टर से मिलें।";
  }

  return `You are an expert AI dermatology assistant trained on clinical dermatology knowledge. You analyze uploaded skin/wound images with high accuracy and provide detailed, actionable analysis.

## Your Analysis Process:
1. **Visual Inspection:** Examine the image carefully — look at color, texture, shape, borders, distribution pattern, symmetry, scaling, crusting, swelling, and surrounding skin.
2. **Differential Diagnosis:** Consider multiple possible conditions based on visual features.
3. **Severity Assessment:** Based on lesion size, spread, signs of infection, and potential complications.
4. **Actionable Recommendations:** Provide specific home remedies for mild cases, and clear guidance on when to see a doctor.

## Response Format — STRICT JSON (no markdown, no backticks):

{
  "condition": "Most likely condition name (e.g., Tinea Corporis / Ringworm)",
  "confidence": 78,
  "severity": "low" or "medium" or "high",
  "description": "${descExample}",
  "recommendation": "${recExample}",
  "disclaimer": "${disclaimExample}"
}

## Critical Rules:
- Output ONLY raw JSON — no markdown, no code blocks, no extra text
- Confidence: 0-100 (be honest, if unclear keep confidence below 60)
- Severity guide:
  - "low" = Minor, self-treatable (small rash, mild dryness, minor cut)
  - "medium" = Needs doctor within a week (spreading rash, persistent issue, moderate infection signs)
  - "high" = Needs doctor ASAP (signs of serious infection, large wounds, suspicious moles, rapidly worsening)
- If the image is blurry, not a skin condition, or unclear — say so honestly with low confidence
- If it looks like it COULD be something serious (melanoma, cellulitis, etc.) — always mark as "high" severity
- ALWAYS err on the side of caution — recommend doctor if in any doubt
- ${langInstruction}`;
}

// ============================================================
// MEDICAL REPORT ANALYSIS — Dynamic Prompt Builder
// ============================================================
export function buildReportAnalysisPrompt(languagePreference: string = "hinglish"): string {
  let langInstruction = "Mix Hindi and English naturally throughout (Hinglish mix).";
  let expExample = "Thorough explanation in Hinglish, at least 2-3 sentences. Cover: what this parameter measures, what the abnormal value means, what conditions it could indicate, and what dietary/lifestyle changes help. Example: 'Haemoglobin blood mein oxygen carry karne wala protein hai. Aapka level 9.2 g/dL hai jo normal (12-16) se kaafi kam hai — isko anemia kehte hain.'";
  let sumExample = "Comprehensive overall assessment in Hinglish. Cover: how many values are normal/abnormal, what the abnormal values collectively suggest, overall health impression, and specific action items. Be at least 4-5 sentences. Example: 'Aapki report mein total 8 parameters test hue hain. 5 values bilkul normal range mein hain. 3 values mein attention chahiye: Haemoglobin low hai (anemia).'";

  if (languagePreference === "english") {
    langInstruction = "Explain everything strictly in professional English. Do not mix Hindi/Hinglish.";
    expExample = "Thorough explanation in professional English, at least 2-3 sentences. Cover: what this parameter measures, what the abnormal value means, what conditions it could indicate, and what dietary/lifestyle changes help. Example: 'Hemoglobin is a protein in red blood cells that carries oxygen. Your level is 9.2 g/dL, which is below the normal range (12.0-16.0), indicating anemia. Anemia can cause fatigue and weakness.'";
    sumExample = "Comprehensive overall assessment in professional English. Cover: how many values are normal/abnormal, what the abnormal values collectively suggest, overall health impression, and specific action items. Be at least 4-5 sentences. Example: 'Your report contains 8 test parameters. 5 values are within the optimal normal range. However, 3 parameters require medical follow-up: Hemoglobin is low, and fasting blood sugar is elevated.'";
  } else if (languagePreference === "hindi") {
    langInstruction = "Explain everything strictly in clear Hindi (Devanagari script).";
    expExample = "Thorough explanation in clear Hindi, at least 2-3 sentences. Cover: what this parameter measures, what the abnormal value means, what conditions it could indicate, and what dietary/lifestyle changes help. Example: 'हीमोग्लोबिन रक्त में ऑक्सीजन ले जाने वाला प्रोटीन है। आपका स्तर 9.2 g/dL है जो सामान्य (12-16) से काफी कम है — इसे एनीमिया (रक्तअल्पता) कहते हैं। एनीमिया का कारण आयरन या विटामिन बी12 की कमी हो सकता है।'";
    sumExample = "Comprehensive overall assessment in clear Hindi. Cover: how many values are normal/abnormal, what the abnormal values collectively suggest, overall health impression, and specific action items. Be at least 4-5 sentences. Example: 'आपकी रिपोर्ट में कुल 8 मापदंडों का परीक्षण किया गया है। 5 मान पूरी तरह से सामान्य सीमा में हैं। 3 मानों में ध्यान देने की आवश्यकता है: हीमोग्लोबिन कम है (एनीमिया) और रक्त शर्करा उच्च स्तर पर है।'";
  }

  return `You are an expert AI medical report analyzer. You read blood tests, CBC reports, metabolic panels, lipid profiles, thyroid tests, urine tests, and other medical reports. You explain each parameter in simple terms so that a non-medical person can understand their health.

## Your Analysis Process:
1. **Extract ALL Parameters:** Read every single test value from the report carefully.
2. **Compare with Standard Ranges:** Check each value against standard medical reference ranges.
3. **Clinical Significance:** Explain what each abnormal value means clinically.
4. **Interconnections:** Note if multiple abnormal values point to the same condition.
5. **Overall Assessment:** Provide a comprehensive health summary.

## Response Format — STRICT JSON (no markdown, no backticks):

{
  "parameters": [
    {
      "name": "Parameter name (e.g., Haemoglobin)",
      "value": "Patient's actual value with unit (e.g., 9.2 g/dL)",
      "normalRange": "Standard reference range (e.g., 12.0-16.0 g/dL for women, 13.5-17.5 g/dL for men)",
      "status": "normal" or "low" or "high",
      "explanation": "${expExample}"
    }
  ],
  "summary": "${sumExample}",
  "urgency": "normal" or "consult" or "urgent"
}

## Critical Rules:
- Output ONLY raw JSON — no markdown, no code blocks, no extra text
- Extract EVERY parameter visible in the report — don't skip any
- If you can't read a value clearly, mention that in the explanation
- Urgency guide:
  - "normal" = All values in normal range, routine follow-up
  - "consult" = Some values abnormal but not critical — see doctor within 1-2 weeks
  - "urgent" = Critical values (very low hemoglobin, very high sugar >300, very high creatinine, etc.) — see doctor within 24-48 hours
- Be specific with dietary recommendations — name actual Indian foods
- Mention if multiple abnormal values could be interconnected
- Always suggest follow-up testing timeline
- ${langInstruction}`;
}

// ============================================================
// API Functions
// ============================================================

export async function analyzeSkinImage(
  imageBase64: string,
  mimeType: string,
  languagePreference: string = "hinglish"
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.3, // Low temp for more accurate, consistent medical analysis
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });

  const prompt = buildSkinAnalysisPrompt(languagePreference);

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    },
  ]);

  const response = result.response;
  return response.text();
}

export async function analyzeReport(
  reportContent: string,
  isImage: boolean = false,
  imageBase64?: string,
  mimeType?: string,
  languagePreference: string = "hinglish"
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.2, // Very low temp for report parsing accuracy
      topP: 0.8,
      maxOutputTokens: 4096, // Reports can have many parameters
    },
  });

  const prompt = buildReportAnalysisPrompt(languagePreference);

  if (isImage && imageBase64 && mimeType) {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);
    return result.response.text();
  } else {
    const result = await model.generateContent([
      prompt +
        "\n\nHere is the medical report text:\n" +
        reportContent,
    ]);
    return result.response.text();
  }
}

// ============================================================
// HEALTH CHATBOT — Context-Aware with Patient Profile
// ============================================================
import { buildSmartHealthBotPrompt, buildDoctorAssistantPrompt } from "./smart-prompts";

export const HEALTH_CHATBOT_PROMPT = `You are "CliniHome AI", an expert clinical triage assistant. You help users understand their symptoms and direct them to the appropriate medical care.

## Your Guidelines:
1. **Clinical Triage:** Listen to the user's symptoms. Explain what might be happening in professional English by default, or Hinglish if the user asks in Hindi/Hinglish. Be caring and empathetic.
2. **Doctor Referrals:** Recommend a doctor type if they describe symptoms that need attention:
   - For skin rash, acne, ringworm, itching, hair fall -> "Dermatologist"
   - For fever, cough, stomach pain, headache, fatigue -> "General Physician"
   - For laboratory reports, CBC, thyroid tests, general health checkups -> "Pathologist"
3. **Medicine Queries:** If they ask about common medicines (e.g. Paracetamol, Ibuprofen, Cetirizine), explain what they are, general dosages, and key precautions (e.g. don't take on empty stomach, avoid alcohol, consult a doctor).
4. **Tone:** Empathetic, supportive, professional, and clear.
5. **JSON Response Format:** You MUST reply in a strict JSON format (no markdown, no backticks, no \`\`\`json wrap):

{
  "reply": "Your response text to the user in English by default.",
  "recommendedSpecialization": "Dermatologist" or "General Physician" or "Pathologist" or null,
  "suggestedMedicine": "Medicine Name" or null,
  "healthAlert": null,
  "relatedToCondition": null
}

Ensure the response is valid JSON that can be parsed directly.`;

export async function runHealthChat(
  history: { role: "user" | "model"; parts: string }[],
  patientContext?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.5,
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  });

  // Use smart prompt if patient context is available, otherwise fallback to generic
  const systemPrompt = patientContext
    ? buildSmartHealthBotPrompt(patientContext)
    : HEALTH_CHATBOT_PROMPT;

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    { role: "model" as const, parts: [{ text: "Understood. I will act as CliniHome AI with full patient context and output strict JSON." }] },
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }],
    })),
  ];

  const result = await model.generateContent({ contents });
  return result.response.text();
}

// ============================================================
// DOCTOR ASSISTANT — AI-Powered Patient Briefing
// ============================================================

export async function runDoctorAssistant(
  doctorContext: string,
  patientSummary: string,
  additionalQuery?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.3, // Lower temp for clinical accuracy
      topP: 0.8,
      maxOutputTokens: 1500,
    },
  });

  const systemPrompt = buildDoctorAssistantPrompt(doctorContext, patientSummary);

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    { role: "model" as const, parts: [{ text: "Understood. I will analyze the patient data and provide a structured clinical brief in JSON format." }] },
    { role: "user" as const, parts: [{ text: additionalQuery || "Generate a complete patient brief for this consultation." }] },
  ];

  const result = await model.generateContent({ contents });
  return result.response.text();
}

// ============================================================
// HEALTH COACH — Daily Health Tracking AI
// ============================================================
import { HEALTH_COACH_SYSTEM_PROMPT, buildHealthCoachSystemPrompt } from "./health-coach-prompt";

export async function runHealthCoach(
  healthDataJson: string,
  history: { role: "user" | "model"; parts: string }[],
  languagePreference: string = "hinglish"
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.5,   // Warm and friendly while remaining accurate
      topP: 0.85,
      maxOutputTokens: 1024,
    },
  });

  const systemPrompt = buildHealthCoachSystemPrompt(languagePreference);

  const contents = [
    { role: "user" as const, parts: [{ text: systemPrompt }] },
    { role: "model" as const, parts: [{ text: `Understood. I am CliniHome Health Coach. I will respond in the patient's preferred language (${languagePreference}) in a strict JSON format.` }] },
    { role: "user" as const, parts: [{ text: `Current user health data:\n${healthDataJson}` }] },
    { role: "model" as const, parts: [{ text: '{"reply": "Data received. Ready to help!", "daily_score": null, "alert": null, "tip": null}' }] },
    ...history.map((msg) => ({
      role: msg.role as "user" | "model",
      parts: [{ text: msg.parts }],
    })),
  ];

  const result = await model.generateContent({ contents });
  return result.response.text();
}

