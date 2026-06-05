"use client";

import React from "react";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-surface)",
        gap: "16px",
      }}
    >
      <div style={{ position: "relative", width: "48px", height: "48px" }}>
        <div
          style={{
            boxSizing: "border-box",
            display: "block",
            position: "absolute",
            width: "48px",
            height: "48px",
            margin: "0px",
            border: "3px solid transparent",
            borderTopColor: "var(--purple-primary)",
            borderRadius: "50%",
            animation: "loading-spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite",
          }}
        />
        <div
          style={{
            boxSizing: "border-box",
            display: "block",
            position: "absolute",
            width: "48px",
            height: "48px",
            margin: "0px",
            border: "3px solid transparent",
            borderTopColor: "var(--accent-teal)",
            borderRadius: "50%",
            animation: "loading-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
            animationDelay: "-0.2s",
          }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--text-secondary)",
          margin: 0,
          letterSpacing: "0.02em",
        }}
      >
        Loading CliniHome...
      </p>

      <style jsx global>{`
        @keyframes loading-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
