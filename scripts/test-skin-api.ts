import * as fs from "fs";
import * as path from "path";

async function testSkinApi() {
  console.log("🚀 Testing Skin Analyzer API...");
  
  const imagePath = path.join(__dirname, "../public/demo/skin_dryness_test.png");
  if (!fs.existsSync(imagePath)) {
    console.error("❌ Error: skin_dryness_test.png not found in public/demo/");
    process.exit(1);
  }

  console.log("Loading test image...");
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = "image/png";

  console.log("Sending POST request to http://localhost:3000/api/analyze/skin...");
  try {
    const response = await fetch("http://localhost:3000/api/analyze/skin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64: base64Image,
        mimeType: mimeType,
      }),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ API Error:", data);
      process.exit(1);
    }

    console.log("\n✅ API Response Received Successfully!");
    console.log("─".repeat(50));
    console.log("Condition:   ", data.condition);
    console.log("Confidence:  ", data.confidence + "%");
    console.log("Severity:    ", data.severity);
    console.log("Description: ", data.description);
    console.log("Recommendation:", data.recommendation);
    console.log("Disclaimer:  ", data.disclaimer);
    console.log("─".repeat(50));
  } catch (error) {
    console.error("❌ Request failed:", error);
    process.exit(1);
  }
}

testSkinApi();
