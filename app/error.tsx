"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("ErrorBoundary caught an unhandled page crash:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
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
        className="animate-pop-in"
        style={{
          maxWidth: "480px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "24px",
          padding: "48px 32px",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            background: "rgba(239, 68, 68, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--severity-high)",
          }}
        >
          <AlertOctagon size={32} />
        </div>

        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            An unexpected runtime error has occurred. Please try reloading the page or return to the home screen.
          </p>
          {error.message && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                background: "rgba(0,0,0,0.02)",
                padding: "8px 12px",
                borderRadius: "8px",
                marginTop: "12px",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {error.message}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              flex: 1,
              background: "var(--purple-primary)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              border: "none",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
            }}
          >
            <RotateCcw size={14} /> Try Again
          </button>
          
          <Link
            href="/"
            style={{
              flex: 1,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              padding: "12px 20px",
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
            <Home size={14} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
