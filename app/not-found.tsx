"use client";

import Link from "next/link";
import { Stethoscope, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 128px)",
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(124,58,237,0.1)",
          color: "var(--purple-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
        className="animate-float"
      >
        <Stethoscope size={40} />
      </div>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        404 — Page Nahi Mila!
      </h1>
      
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "15px",
          color: "var(--text-secondary)",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "32px",
        }}
      >
        Oops! Jo page aap dhundh rahe hain, wo hamare clinic records mein nahi hai. Please homepage par wapas jayein aur checkup shuru karein.
      </p>

      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #7C3AED, #EC4899)",
          color: "white",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "14px",
          padding: "14px 28px",
          borderRadius: "12px",
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
        }}
      >
        <ArrowLeft size={16} />
        Homepage Par Wapas Jao
      </Link>
    </div>
  );
}
