import { GoogleGenerativeAI } from "@google/generative-ai";
import * as path from "path";
import * as fs from "fs";

function parseEnv() {
  const envPath = path.join(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    console.error("No .env.local file found at:", envPath);
    return;
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join("=").trim();
      env[key] = value;
      process.env[key] = value;
    }
  });
}

async function run() {
  parseEnv();
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : "NONE");
  
  if (!apiKey) {
    console.error("Error: GOOGLE_GEMINI_API_KEY is not set in .env.local");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log("Calling Gemini 2.5 Flash...");
    const result = await model.generateContent("Hello, reply with 'Gemini API is working!'");
    console.log("Response:", result.response.text().trim());
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
}

run();
