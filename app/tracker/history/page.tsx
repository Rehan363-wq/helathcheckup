"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { loadWeekHistory, type DayHistoryEntry } from "@/lib/health-tracker";

export default function HistoryPage() {
  const [history, setHistory] = useState<DayHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadWeekHistory());
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (dateStr === todayStr) return "Today";
    if (dateStr === yesterdayStr) return "Yesterday";
    return d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "#10B981";
    if (score >= 5) return "#F59E0B";
    return "#EF4444";
  };

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: <TrendingUp size={14} />, color: "#10B981" };
    if (current < previous) return { icon: <TrendingDown size={14} />, color: "#EF4444" };
    return { icon: <Minus size={14} />, color: "var(--text-muted)" };
  };

  // Calculate averages
  const activeDays = history.filter(h => h.score > 0);
  const avgScore = activeDays.length > 0 ? Math.round(activeDays.reduce((s, h) => s + h.score, 0) / activeDays.length * 10) / 10 : 0;
  const avgSteps = activeDays.length > 0 ? Math.round(activeDays.reduce((s, h) => s + h.steps, 0) / activeDays.length) : 0;
  const avgSleep = activeDays.length > 0 ? Math.round(activeDays.reduce((s, h) => s + h.sleep_hrs, 0) / activeDays.length * 10) / 10 : 0;
  const daysWithGoodScore = activeDays.filter(h => h.score >= 7).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          📅 Weekly Health History
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
          Last 7 days of health tracking data
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }} className="history-summary-grid">
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)", textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Avg Score</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: getScoreColor(avgScore) }}>{avgScore}</p>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)", textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Avg Steps</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#3B82F6" }}>{avgSteps.toLocaleString()}</p>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)", textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Avg Sleep</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#8B5CF6" }}>{avgSleep}h</p>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)", textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>Good Days</p>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#10B981" }}>{daysWithGoodScore}/7</p>
        </div>
      </div>

      {/* Score Bar Chart */}
      <div style={{ background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border)", padding: "32px", boxShadow: "var(--shadow-card)" }}>
        <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>📊 Daily Score Trend</h3>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", height: "160px" }}>
          {history.map((day, i) => {
            const barHeight = day.score > 0 ? (day.score / 10) * 140 : 8;
            return (
              <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                {/* Score label */}
                <span style={{ fontSize: "12px", fontWeight: 700, color: day.score > 0 ? getScoreColor(day.score) : "var(--text-muted)" }}>
                  {day.score > 0 ? day.score : "—"}
                </span>
                {/* Bar */}
                <div style={{
                  width: "100%", maxWidth: "48px", height: `${barHeight}px`,
                  borderRadius: "8px 8px 4px 4px",
                  background: day.score > 0
                    ? `linear-gradient(to top, ${getScoreColor(day.score)}40, ${getScoreColor(day.score)})`
                    : "var(--border)",
                  transition: "height 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }} />
                {/* Day label */}
                <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {formatDate(day.date).slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Day-by-Day Table */}
      <div style={{ background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border)", padding: "28px", boxShadow: "var(--shadow-card)" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>📋 Daily Breakdown</h3>

        {/* Table Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.8fr 1fr 0.8fr 0.8fr 0.8fr", gap: "12px", padding: "12px 16px", borderRadius: "12px", background: "rgba(59,130,246,0.04)", marginBottom: "8px" }} className="history-table-header">
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase" }}>Date</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", textAlign: "center" }}>Score</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", textAlign: "center" }}>Steps</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", textAlign: "center" }}>Sleep</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", textAlign: "center" }}>Calories</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", textAlign: "center" }}>Water</span>
        </div>

        {/* Table Body */}
        {history.map((day, i) => {
          const prev = i > 0 ? history[i - 1] : null;
          const scoreTrend = prev ? getTrend(day.score, prev.score) : null;

          return (
            <div key={day.date} style={{
              display: "grid", gridTemplateColumns: "1.5fr 0.8fr 1fr 0.8fr 0.8fr 0.8fr",
              gap: "12px", padding: "14px 16px", borderRadius: "12px",
              border: "1px solid var(--border)", marginBottom: "6px",
              background: day.score === 0 ? "rgba(0,0,0,0.02)" : "var(--bg-card)",
              opacity: day.score === 0 ? 0.5 : 1,
              transition: "all 0.2s",
            }} className="history-table-row">
              {/* Date */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{formatDate(day.date)}</span>
              </div>

              {/* Score */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: day.score > 0 ? getScoreColor(day.score) : "var(--text-muted)" }}>
                  {day.score > 0 ? day.score : "—"}
                </span>
                {scoreTrend && day.score > 0 && <span style={{ color: scoreTrend.color }}>{scoreTrend.icon}</span>}
              </div>

              {/* Steps */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                {day.steps > 0 ? day.steps.toLocaleString() : "—"}
              </span>

              {/* Sleep */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                {day.sleep_hrs > 0 ? `${day.sleep_hrs}h` : "—"}
              </span>

              {/* Calories */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                {day.calories > 0 ? day.calories : "—"}
              </span>

              {/* Water */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textAlign: "center" }}>
                {day.water > 0 ? `${day.water} 💧` : "—"}
              </span>
            </div>
          );
        })}

        {activeDays.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Calendar size={32} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>No health logs recorded yet. Add logs to see your progress!</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .history-summary-grid { grid-template-columns: 1fr 1fr !important; }
          .history-table-header, .history-table-row {
            grid-template-columns: 1.2fr 0.6fr 0.8fr 0.6fr !important;
          }
          .history-table-header span:nth-child(5),
          .history-table-header span:nth-child(6),
          .history-table-row > span:nth-child(5),
          .history-table-row > span:nth-child(6) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
