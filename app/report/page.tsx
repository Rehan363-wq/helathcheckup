"use client";

import { useState } from "react";
import UploadZone from "@/components/upload-zone";
import LoadingSkeleton from "@/components/loading-skeleton";
import SeverityBadge from "@/components/severity-badge";
import { ReportAnalysis } from "@/types/report";
import { fileToBase64 } from "@/lib/utils";
import { AlertTriangle, RotateCcw, MapPin, ArrowRight, Share2 } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ReportAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    // Retrieve active patient session
    let patientId = null;
    try {
      const sessionStr = localStorage.getItem("healflow-session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        patientId = session.id || null;
      }
    } catch (e) {}

    try {
      const base64 = await fileToBase64(file);
      const isImage = file.type.startsWith("image/");

      const response = await fetch("/api/analyze/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type,
          isImage: isImage,
          patientId,
        }),
      });

      if (!response.ok) {
        throw new Error("Report analysis failed. Please try again.");
      }

      const data: ReportAnalysis = await response.json();
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
    setError(null);
    setIsLoading(false);
  };

  const handleShare = () => {
    if (!result) return;
    const text = `Medical Report Summary:\n\n${result.parameters.map((p) => `${p.name}: ${p.value} (Normal: ${p.normalRange}) - ${p.status}`).join("\n")}\n\nOverall: ${result.summary}`;

    if (navigator.share) {
      navigator.share({ title: "Medical Report Analysis", text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Report summary copied to clipboard!");
    }
  };

  const urgencyConfig = {
    normal: { bg: "#D1FAE5", color: "#065F46", label: "✅ Sab Normal", severity: "low" as const },
    consult: { bg: "#FEF3C7", color: "#92400E", label: "⚠️ Consult Required", severity: "medium" as const },
    urgent: { bg: "#FEE2E2", color: "#991B1B", label: "🔴 Urgent Attention", severity: "high" as const },
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "normal":
        return "✅";
      case "low":
        return "🔴 Low";
      case "high":
        return "🔴 High";
      default:
        return "—";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
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
              📄 Report Explainer
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-secondary)",
              }}
            >
              Upload laboratory reports or blood tests for AI clinical translations
            </p>
          </div>
          {(result || error) && (
            <button
              onClick={handleReset}
              id="reset-report-button"
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
              }}
            >
              <RotateCcw size={16} />
              New Report
            </button>
          )}
        </div>

        {/* Upload Zone */}
        {!result && !isLoading && (
          <>
            <UploadZone
              onFileSelect={handleFileSelect}
              acceptedTypes={[
                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf",
              ]}
              maxSizeMB={10}
              label="Upload medical report"
              sublabel="PDF or image files"
              icon="document"
            />
            
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                id="demo-report-btn"
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    setError(null);

                    // Retrieve active patient session
                    let patientId = null;
                    try {
                      const sessionStr = localStorage.getItem("healflow-session");
                      if (sessionStr) {
                        const session = JSON.parse(sessionStr);
                        patientId = session.id || null;
                      }
                    } catch (e) {}

                    const demoText = `Complete Blood Count (CBC)
Haemoglobin: 9.8 g/dL (Normal Range: 12.0 - 16.0)
WBC Count: 11,500 /cumm (Normal Range: 4,000 - 11,000)
Platelet Count: 250,000 /cumm (Normal Range: 150,000 - 450,000)
RBC Count: 3.8 million/cumm (Normal Range: 4.0 - 5.2)`;

                    const response = await fetch("/api/analyze/report", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        reportText: demoText,
                        isImage: false,
                        patientId,
                      }),
                    });

                    if (!response.ok) {
                      throw new Error("Analysis failed. Please try again.");
                    }

                    const data: ReportAnalysis = await response.json();
                    setResult(data);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Something went wrong.");
                  } finally {
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
                ✨ Try Demo Report (CBC Blood Test with Low Hb & High WBC)
              </button>
            </div>
          </>
        )}

        {/* Loading */}
        {isLoading && <LoadingSkeleton type="report" />}

        {/* Error */}
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
            <AlertTriangle size={20} style={{ color: "var(--severity-high)", flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: "var(--severity-high)", marginBottom: "4px" }}>
                Analysis failed
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)" }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Summary Card */}
            <div
              id="report-summary-card"
              style={{
                background: "var(--bg-card-dark)",
                borderRadius: "16px",
                boxShadow: "var(--shadow-dark)",
                padding: "24px",
                borderLeft: `4px solid ${urgencyConfig[result.urgency].color}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "var(--text-white)",
                  }}
                >
                  📊 Report Summary
                </h3>
                <SeverityBadge severity={urgencyConfig[result.urgency].severity} />
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {result.summary}
              </p>
            </div>

            {/* Parameter Table */}
            <div
              id="parameter-table"
              style={{
                background: "var(--bg-card)",
                borderRadius: "16px",
                boxShadow: "var(--shadow-card)",
                overflow: "hidden",
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 100px",
                  gap: "16px",
                  padding: "16px 20px",
                  background: "#F9FAFB",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Parameter", "Value", "Normal", "Status"].map((h) => (
                  <p
                    key={h}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                    }}
                  >
                    {h}
                  </p>
                ))}
              </div>

              {/* Table Rows */}
              {result.parameters.map((param, i) => (
                <div
                  key={param.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 100px",
                    gap: "16px",
                    padding: "14px 20px",
                    background: i % 2 === 1 ? "#FAFAFA" : "transparent",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {param.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: param.status !== "normal" ? "var(--severity-high)" : "var(--text-primary)",
                    }}
                  >
                    {param.value}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {param.normalRange}
                  </p>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {statusIcon(param.status)}
                  </span>
                </div>
              ))}
            </div>

            {/* Explanation Cards (for abnormal values) */}
            {result.parameters
              .filter((p) => p.status !== "normal")
              .map((param) => (
                <div
                  key={`explanation-${param.name}`}
                  id={`explanation-${param.name.toLowerCase().replace(/\s/g, "-")}`}
                  style={{
                    background: "var(--bg-card)",
                    borderRadius: "16px",
                    boxShadow: "var(--shadow-card)",
                    padding: "24px",
                    borderLeft: `4px solid ${param.status === "high" ? "var(--severity-high)" : "var(--severity-med)"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      🩸 {param.name} — {param.value}
                    </h4>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 500,
                        fontFamily: "var(--font-body)",
                        background: param.status === "high" ? "#FEE2E2" : param.status === "low" ? "#FEE2E2" : "#D1FAE5",
                        color: param.status === "high" ? "#991B1B" : param.status === "low" ? "#991B1B" : "#065F46",
                      }}
                    >
                      {param.status === "high" ? "🔴 High" : param.status === "low" ? "🔴 Low" : "✅ Normal"}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                    }}
                  >
                    {param.explanation}
                  </p>
                </div>
              ))}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={handleShare}
                id="share-report-button"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: "rgba(124,58,237,0.08)",
                  color: "var(--purple-primary)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(124,58,237,0.15)",
                  cursor: "pointer",
                }}
              >
                <Share2 size={16} />
                Share with Doctor
              </button>

              <Link
                href="/doctors"
                id="report-find-doctor"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                }}
              >
                <MapPin size={16} />
                Find Specialists
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

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
          <AlertTriangle size={16} style={{ color: "var(--severity-med)", flexShrink: 0 }} />
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)" }}>
            <strong>Disclaimer:</strong> Ye AI analysis hai, professional medical advice nahi. Results doctor se confirm karo.
          </p>
        </div>
      </div>
    </div>
  );
}
