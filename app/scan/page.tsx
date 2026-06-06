"use client";

import { useState, useEffect } from "react";
import UploadZone from "@/components/upload-zone";
import ResultCard from "@/components/result-card";
import LoadingSkeleton from "@/components/loading-skeleton";
import { ScanResult } from "@/types/scan";
import { fileToBase64 } from "@/lib/utils";
import { AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";
import { loadPatientProfile } from "@/lib/user-profile";

export default function ScanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Skin Analyzer — CliniHome AI";
  }, []);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);

    // Validate file size (max 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Validate file type (image only)
    if (!file.type.startsWith("image/")) {
      setError("Invalid file format. Please upload an image file (JPEG, PNG, WEBP).");
      return;
    }

    setIsLoading(true);

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    // Retrieve active patient session
    let patientId = null;
    let token = "sandbox";
    try {
      const sessionStr = localStorage.getItem("clinihome-session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        patientId = session.id || null;
        token = session.email || "sandbox";
      }
    } catch (e) {}

    const profile = loadPatientProfile();
    const lang = profile?.language_preference || "hinglish";

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch("/api/analyze/skin", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          patientId,
          languagePreference: lang,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Please try again.");
      }

      const data: ScanResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setImagePreview(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-surface)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              📸 Skin Analyzer
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}
            >
              Upload skin or wound photos for instant AI dermatology insights
            </p>
          </div>

          {(result || error) && (
            <button
              onClick={handleReset}
              id="reset-scan-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                background: "rgba(124,58,237,0.08)",
                color: "var(--purple-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "14px",
                borderRadius: "10px",
                border: "1px solid rgba(124,58,237,0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <RotateCcw size={16} />
              New Scan
            </button>
          )}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: result ? "1fr" : "1fr 320px",
            gap: "24px",
          }}
          className="scan-content-grid"
        >
          {/* Upload / Result Area */}
          <div>
            {!result && !isLoading && (
              <>
                <UploadZone
                  onFileSelect={handleFileSelect}
                  acceptedTypes={[
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                  ]}
                  maxSizeMB={10}
                  label="Upload skin/wound photo"
                  sublabel="Drag & drop your file or click to browse"
                  icon="image"
                />
                
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <button
                    id="demo-scan-btn"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        setError(null);
                        
                        const res = await fetch("/demo/skin_dryness_test.png");
                        const blob = await res.blob();
                        const file = new File([blob], "skin_dryness_test.png", { type: "image/png" });
                        
                        // Set preview
                        const preview = URL.createObjectURL(file);
                        setImagePreview(preview);

                        const reader = new FileReader();
                        // Retrieve active patient session
                        let patientId = null;
                        let token = "sandbox";
                        try {
                          const sessionStr = localStorage.getItem("clinihome-session");
                          if (sessionStr) {
                            const session = JSON.parse(sessionStr);
                            patientId = session.id || null;
                            token = session.email || "sandbox";
                          }
                        } catch (e) {}

                        const profile = loadPatientProfile();
                        const lang = profile?.language_preference || "hinglish";

                        reader.onloadend = async () => {
                          const base64 = (reader.result as string).split(",")[1];
                          try {
                            const response = await fetch("/api/analyze/skin", {
                              method: "POST",
                              headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                imageBase64: base64,
                                mimeType: file.type,
                                patientId,
                                languagePreference: lang,
                              }),
                            });

                            if (!response.ok) {
                              throw new Error("Analysis failed. Please try again.");
                            }

                            const data: ScanResult = await response.json();
                            setResult(data);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Something went wrong.");
                          } finally {
                            setIsLoading(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      } catch (err) {
                        setError("Failed to load demo image.");
                        setIsLoading(false);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      background: "rgba(16,185,129,0.1)",
                      border: "1px dashed rgba(16,185,129,0.3)",
                      borderRadius: "8px",
                      color: "#10b981",
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ✨ Try Demo Photo (Test Fungal/Dry Patch)
                  </button>
                </div>
              </>
            )}

            {isLoading && <LoadingSkeleton type="scan" />}

            {result && (
              <ResultCard result={result} imagePreview={imagePreview || undefined} />
            )}

            {error && (
              <div
                role="alert"
                style={{
                  padding: "20px",
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <AlertTriangle
                  size={20}
                  style={{ color: "var(--severity-high)", flexShrink: 0, marginTop: "2px" }}
                />
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--severity-high)",
                      marginBottom: "4px",
                    }}
                  >
                    Analysis failed
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tips Card (shown when no result) */}
          {!result && !isLoading && (
            <div
              className="tips-card"
              style={{
                background: "var(--bg-card)",
                borderRadius: "16px",
                boxShadow: "var(--shadow-card)",
                padding: "24px",
                height: "fit-content",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <Lightbulb
                  size={18}
                  style={{ color: "var(--accent-yellow)" }}
                />
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Tips for Best Results
                </h3>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  "Ensure good, bright lighting",
                  "Take a clear close-up photo",
                  "Do not use filters or modifications",
                  "Keep the affected area in focus",
                  "Take photos from multiple angles if needed",
                ].map((tip, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--severity-low)",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: "24px",
            padding: "14px 20px",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "var(--severity-med)", flexShrink: 0 }}
          />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <strong>Disclaimer:</strong> This is an AI analysis, not professional medical advice. Consult a doctor immediately for serious symptoms.
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .scan-content-grid {
            grid-template-columns: 1fr !important;
          }
          .tips-card {
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
