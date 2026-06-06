"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ScanError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Scan route error boundary caught crash:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "440px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          padding: "36px 24px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "rgba(255, 149, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-yellow)",
          }}
        >
          <AlertTriangle size={28} />
        </div>

        <div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 6px",
            }}
          >
            Scanner Unavailable
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            An error occurred loading the AI vision scanner. Please check your camera permissions, reset the scan flow, or return to dashboard.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", width: "100%" }}>
          <button
            onClick={() => reset()}
            style={{
              flex: 1,
              background: "var(--purple-primary)",
              color: "white",
              padding: "10px 16px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "none",
            }}
          >
            <RotateCcw size={12} /> Reset Page
          </button>
          
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              padding: "10px 16px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
