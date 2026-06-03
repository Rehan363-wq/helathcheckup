import { SeverityLevel } from "@/types/scan";

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: "small" | "medium" | "large";
}

const severityConfig = {
  low: {
    bg: "#D1FAE5",
    color: "#065F46",
    label: "Low Risk",
    icon: "✓",
  },
  medium: {
    bg: "#FEF3C7",
    color: "#92400E",
    label: "Medium Risk",
    icon: "⚠",
  },
  high: {
    bg: "#FEE2E2",
    color: "#991B1B",
    label: "High Risk",
    icon: "✕",
  },
};

const sizeConfig = {
  small: { padding: "4px 10px", fontSize: "11px" },
  medium: { padding: "6px 14px", fontSize: "13px" },
  large: { padding: "8px 18px", fontSize: "15px" },
};

export default function SeverityBadge({
  severity,
  size = "medium",
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const sizes = sizeConfig[size];

  return (
    <span
      className="animate-pop-in"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: sizes.padding,
        fontSize: sizes.fontSize,
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        color: config.color,
        background: config.bg,
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
