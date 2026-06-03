import { ScanResult } from "@/types/scan";
import SeverityBadge from "./severity-badge";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

interface ResultCardProps {
  result: ScanResult;
  imagePreview?: string;
}

function ConfidenceDots({ confidence }: { confidence: number }) {
  const filled = Math.round(confidence / 20);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: i <= filled ? "var(--purple-primary)" : "transparent",
              border: `2px solid var(--purple-primary)`,
              transition: "all 0.3s ease",
              animationDelay: `${i * 0.1}s`,
            }}
            className="animate-pop-in"
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--purple-primary)",
        }}
      >
        {confidence}% match
      </span>
    </div>
  );
}

export default function ResultCard({ result, imagePreview }: ResultCardProps) {
  const borderColor =
    result.severity === "high"
      ? "var(--severity-high)"
      : result.severity === "medium"
        ? "var(--severity-med)"
        : "var(--severity-low)";

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: "flex",
        gap: "24px",
        background: "var(--bg-card)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        borderLeft: `4px solid ${borderColor}`,
        flexWrap: "wrap",
      }}
    >
      {/* Image Preview */}
      {imagePreview && (
        <div
          style={{
            width: "280px",
            minHeight: "300px",
            background: "#F3F4F6",
            flexShrink: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={imagePreview}
            alt="Uploaded skin photo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Result Content */}
      <div
        style={{
          flex: 1,
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          minWidth: "280px",
        }}
      >
        {/* Header */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            🔍 AI Analysis
          </p>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {result.condition}
          </h3>
        </div>

        {/* Confidence */}
        <ConfidenceDots confidence={result.confidence} />

        {/* Severity */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Severity
          </p>
          <SeverityBadge severity={result.severity} size="large" />
        </div>

        {/* Description */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Kya hai ye / What is this
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {result.description}
          </p>
        </div>

        {/* Recommendation */}
        <div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--text-muted)",
              marginBottom: "6px",
            }}
          >
            Aage kya karo / Next Steps
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            {result.recommendation}
          </p>
        </div>

        {/* Find Doctor Button */}
        {(result.severity === "medium" || result.severity === "high") && (
          <Link
            href="/doctors"
            id="find-doctor-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "15px",
              padding: "14px 28px",
              borderRadius: "12px",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              transition: "all 0.2s ease",
              width: "fit-content",
            }}
          >
            <MapPin size={18} />
            Doctor Dhundho
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}
