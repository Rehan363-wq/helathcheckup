interface LoadingSkeletonProps {
  type: "scan" | "report";
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        boxShadow: "var(--shadow-card)",
        padding: "32px",
        position: "relative",
        overflow: "hidden",
      }}
      aria-live="polite"
      aria-label="AI analyzing your upload"
    >
      {/* Pulsing text */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 24px",
            background: "rgba(124,58,237,0.08)",
            borderRadius: "12px",
            animation: "pulse-glow 2s ease-in-out infinite",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "var(--purple-primary)",
              animation: "popIn 0.6s ease-out infinite alternate",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--purple-primary)",
            }}
          >
            {type === "scan"
              ? "AI photo analyze kar rahi hai..."
              : "AI report padh rahi hai..."}
          </span>
        </div>
      </div>

      {/* Skeleton lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {type === "scan" ? (
          <>
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div
                className="skeleton"
                style={{ width: "200px", height: "200px", flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", minWidth: "200px" }}>
                <div className="skeleton" style={{ width: "60%", height: "24px" }} />
                <div className="skeleton" style={{ width: "40%", height: "16px" }} />
                <div className="skeleton" style={{ width: "80px", height: "28px", borderRadius: "999px" }} />
                <div className="skeleton" style={{ width: "100%", height: "14px" }} />
                <div className="skeleton" style={{ width: "90%", height: "14px" }} />
                <div className="skeleton" style={{ width: "70%", height: "14px" }} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Summary skeleton */}
            <div
              className="skeleton"
              style={{ width: "100%", height: "80px", borderRadius: "12px" }}
            />
            {/* Table skeleton */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{
                    width: "100%",
                    height: "48px",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
