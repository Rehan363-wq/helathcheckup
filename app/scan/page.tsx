"use client";

import { useState } from "react";
import UploadZone from "@/components/upload-zone";
import ResultCard from "@/components/result-card";
import LoadingSkeleton from "@/components/loading-skeleton";
import { ScanResult } from "@/types/scan";
import { fileToBase64 } from "@/lib/utils";
import { AlertTriangle, Lightbulb, RotateCcw } from "lucide-react";

export default function ScanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    // Create preview
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    try {
      const base64 = await fileToBase64(file);

      const response = await fetch("/api/analyze/skin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
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
              Photo upload karo — AI batayega kya condition hai
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
              Naya Scan
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
              <UploadZone
                onFileSelect={handleFileSelect}
                acceptedTypes={[
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                ]}
                maxSizeMB={10}
                label="Upload skin/wound photo"
                sublabel="Drag & drop karo ya click karo"
                icon="image"
              />
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
                  Best Results Ke Liye
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
                  "Acchi lighting mein photo lo",
                  "Close-up photo lo — clear dikhna chahiye",
                  "Koi filter mat lagao",
                  "Affected area focus mein ho",
                  "Multiple angles se try karo",
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
            <strong>Disclaimer:</strong> Ye AI analysis hai, professional medical advice nahi. Serious symptoms mein turant doctor se milein.
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
