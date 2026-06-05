import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | number;
  showText?: boolean;
  showSubtitle?: boolean;
  iconOnly?: boolean;
  textOnly?: boolean;
  className?: string;
  variant?: "light" | "dark" | "default";
}

export default function Logo({
  size = "md",
  showText = true,
  showSubtitle = false,
  iconOnly = false,
  textOnly = false,
  className = "",
  variant = "default",
}: LogoProps) {
  // Determine pixel size for icon
  const getIconSize = () => {
    if (typeof size === "number") return size;
    switch (size) {
      case "sm": return 28;
      case "lg": return 48;
      case "md":
      default:
        return 38;
    }
  };

  const iconPxSize = getIconSize();

  // Color variables for rendering text depending on theme/variant
  const getTextColor = (part: "clini" | "home" | "subtitle") => {
    if (variant === "light") {
      if (part === "clini") return "#0f766e"; // dark teal
      if (part === "home") return "#0284c7"; // light blue/sky
      return "#6b7280"; // gray
    }
    if (variant === "dark") {
      if (part === "clini") return "#2dd4bf"; // bright teal
      if (part === "home") return "#38bdf8"; // bright sky
      return "#9ca3af"; // light gray
    }
    // Default theme-aware behavior
    if (part === "clini") return "var(--logo-clini, #0f766e)";
    if (part === "home") return "var(--logo-home, #38bdf8)";
    return "var(--text-secondary, #6b7280)";
  };

  if (textOnly) {
    return (
      <div className={`flex flex-col ${className}`} style={{ display: "inline-flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: size === "sm" ? "16px" : size === "lg" ? "24px" : "20px",
              color: getTextColor("clini"),
              letterSpacing: "-0.03em",
            }}
          >
            Clini
          </span>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: size === "sm" ? "16px" : size === "lg" ? "24px" : "20px",
              color: getTextColor("home"),
              letterSpacing: "-0.03em",
            }}
          >
            Home
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: size === "sm" ? "9px" : size === "lg" ? "12px" : "10px",
              color: getTextColor("subtitle"),
              fontWeight: 500,
              marginTop: "-2px",
              whiteSpace: "nowrap",
            }}
          >
            AI Health & Doctor Connect
          </span>
        )}
      </div>
    );
  }

  // The custom premium SVG for CliniHome
  const renderIcon = () => (
    <svg
      width={iconPxSize}
      height={iconPxSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="logo-icon-svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        {/* Teal/Blue Gradient matching the logo */}
        <linearGradient id="clinihomeIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0891b2" /> {/* Cyan 600 */}
          <stop offset="50%" stopColor="#0d9488" /> {/* Teal 600 */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky 500 */}
        </linearGradient>
        <linearGradient id="clinihomeLeftGrad" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#007a87" />
          <stop offset="100%" stopColor="#0f9f9b" />
        </linearGradient>
        <linearGradient id="clinihomeRightGrad" x1="50%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f9f9b" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Main House Outline - Left Side (Teal/Cyan) */}
      <path
        d="M 50 16 
           C 48 16, 46 17, 44 19 
           L 24 38 
           C 20 42, 18 46, 18 52 
           L 18 84 
           C 18 92, 24 98, 32 98 
           L 56 98"
        stroke="url(#clinihomeLeftGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main House Outline - Right Side (Sky Blue) */}
      <path
        d="M 64 98 
           L 88 98 
           C 96 98, 102 92, 102 84 
           L 102 70 
           M 102 52 
           L 102 52 
           C 102 46, 100 42, 96 38 
           L 76 19 
           C 74 17, 72 16, 70 16 
           C 67 16, 64 17, 62 19
           L 50 28"
        stroke="url(#clinihomeRightGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Medical Plus & Heartbeat Pulse */}
      {/* Plus vertical line */}
      <path
        d="M 60 40 L 60 72"
        stroke="url(#clinihomeIconGrad)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      {/* Plus horizontal and pulse line: starts from left of plus (x=44), goes to right (x=76), 
          then loops into heartbeat pulse: up to y=38, down to y=82, up to y=52, and exits out of the house gap (x=102, y=60) */}
      <path
        d="M 44 56 
           L 76 56 
           C 80 56, 82 52, 84 46
           L 88 38
           L 93 80
           L 98 48
           L 104 60
           L 112 60"
        stroke="url(#clinihomeIconGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (iconOnly) {
    return renderIcon();
  }

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
      }}
    >
      {renderIcon()}
      {!iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: size === "sm" ? "16px" : size === "lg" ? "24px" : "20px",
                color: getTextColor("clini"),
                letterSpacing: "-0.03em",
              }}
            >
              Clini
            </span>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: size === "sm" ? "16px" : size === "lg" ? "24px" : "20px",
                color: getTextColor("home"),
                letterSpacing: "-0.03em",
              }}
            >
              Home
            </span>
          </div>
          {showSubtitle && (
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: size === "sm" ? "9px" : size === "lg" ? "12px" : "10px",
                color: getTextColor("subtitle"),
                fontWeight: 500,
                marginTop: "2px",
                whiteSpace: "nowrap",
                letterSpacing: "-0.01em",
              }}
            >
              AI Health & Doctor Connect
            </span>
          )}
        </div>
      )}
    </div>
  );
}
