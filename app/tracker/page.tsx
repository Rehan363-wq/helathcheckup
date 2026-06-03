"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Droplets,
  Footprints,
  Moon,
  Utensils,
  Smile,
  Frown,
  Meh,
  TrendingUp,
  Pill,
  Heart,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  loadProfile,
  loadTodayLog,
  calculateDailyScore,
  calculateSleepHours,
  type HealthProfile,
  type DailyLog,
} from "@/lib/health-tracker";

export default function TrackerDashboard() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const p = loadProfile();
    const l = loadTodayLog();
    setProfile(p);
    setLog(l);
    setScore(calculateDailyScore(l, p));
  }, []);

  if (!profile || !log) return null;

  const totalCalories = log.meals.reduce((s, m) => s + m.estimated_calories, 0);
  const totalProtein = log.meals.reduce((s, m) => s + m.estimated_protein, 0);
  const sleepHrs = calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at);
  const totalWorkoutMin = log.workouts.reduce((s, w) => s + w.duration_min, 0);

  const moodIcon = log.mood === "happy" ? <Smile size={18} /> : log.mood === "stressed" || log.mood === "anxious" ? <Frown size={18} /> : <Meh size={18} />;
  const moodColor = log.mood === "happy" || log.mood === "calm" ? "#10B981" : log.mood === "stressed" || log.mood === "anxious" ? "#EF4444" : "#F59E0B";

  const scoreColor = score >= 7 ? "#10B981" : score >= 5 ? "#F59E0B" : "#EF4444";
  const scorePercent = (score / 10) * 100;

  // SVG ring chart values
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (scorePercent / 100) * ringCircumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div className="animate-fade-in-up">
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3B82F6" }}>
          <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
          Daily Health Dashboard
        </span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {profile.name} 👋
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Top Row: Score Ring + Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }} className="dashboard-top-grid">

        {/* Score Card */}
        <div
          className="animate-fade-in-up hover-premium"
          style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Ring Chart */}
          <div style={{ position: "relative", width: "140px", height: "140px" }}>
            <svg viewBox="0 0 120 120" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r={ringRadius} fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={ringRadius} fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: scoreColor, fontFamily: "var(--font-heading)", lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>/10</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Health Score</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>
              {score >= 7 ? "Great day! 🎉" : score >= 5 ? "Keep it up! 💪" : "Let's improve! 🌱"}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }} className="dashboard-stats-grid">

          {/* Calories */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }} className="hover-premium animate-fade-in-up animation-delay-100">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(236,72,153,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EC4899" }}>
                <Utensils size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Calories</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{totalCalories}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.daily_cal_goal} kcal goal</p>
            {/* Progress bar */}
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((totalCalories / profile.daily_cal_goal) * 100, 100)}%`, background: "#EC4899", borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Steps */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }} className="hover-premium animate-fade-in-up animation-delay-200">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <Footprints size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Steps</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{log.steps.toLocaleString()}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.step_goal.toLocaleString()} goal</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((log.steps / profile.step_goal) * 100, 100)}%`, background: "#3B82F6", borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Water */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }} className="hover-premium animate-fade-in-up animation-delay-300">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(6,182,212,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#06B6D4" }}>
                <Droplets size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Water</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{log.water_glasses}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ 8 glasses</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((log.water_glasses / 8) * 100, 100)}%`, background: "#06B6D4", borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Sleep */}
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }} className="hover-premium animate-fade-in-up animation-delay-400">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
                <Moon size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Sleep</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{sleepHrs}h</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.sleep_goal_hrs}h goal • {log.sleep.quality}</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((sleepHrs / profile.sleep_goal_hrs) * 100, 100)}%`, background: "#8B5CF6", borderRadius: "3px", transition: "width 0.5s ease" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Meals + Mood/Meds */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }} className="dashboard-bottom-grid">

        {/* Today's Meals */}
        <div
          className="animate-fade-in-up animation-delay-300 hover-premium"
          style={{ background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border)", padding: "28px", boxShadow: "var(--shadow-card)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>🍽️ Today&apos;s Meals</h3>
            <Link href="/tracker/log" style={{ fontSize: "12px", fontWeight: 600, color: "#3B82F6", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Log Meal <ChevronRight size={14} />
            </Link>
          </div>

          {log.meals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Utensils size={28} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Koi meal log nahi hai aaj. Tap &quot;Log&quot; tab to start!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {log.meals.map((meal) => (
                <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{meal.food}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{meal.meal_type} • {meal.time}</p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#EC4899" }}>{meal.estimated_calories} kcal</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px 0", borderTop: "1px solid var(--border)", marginTop: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Total</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#EC4899" }}>{totalCalories} kcal • {totalProtein}g protein</span>
              </div>
            </div>
          )}
        </div>

        {/* Mood, Energy & Meds */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Mood Card */}
          <div
            className="animate-fade-in-up animation-delay-400 hover-premium"
            style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>😌 Mood & Energy</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `${moodColor}15`, display: "flex", alignItems: "center", justifyContent: "center", color: moodColor }}>
                {moodIcon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", textTransform: "capitalize" }}>{log.mood}</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>Energy: {log.energy_level}/10</p>
              </div>
            </div>
          </div>

          {/* Workout Card */}
          <div
            className="animate-fade-in-up animation-delay-400 hover-premium"
            style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>🏃 Workout</h3>
            {log.workouts.length === 0 ? (
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>No workout logged yet</p>
            ) : (
              log.workouts.map((w) => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{w.type}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{w.duration_min} min • {w.calories_burned} kcal</span>
                </div>
              ))
            )}
          </div>

          {/* Meds Card */}
          <div
            className="animate-fade-in-up animation-delay-500 hover-premium"
            style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border)", padding: "24px", boxShadow: "var(--shadow-card)" }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>💊 Medications</h3>
            {profile.medications.length === 0 ? (
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>No medications configured</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {profile.medications.map((med, i) => {
                  const taken = log.medications_taken.includes(med);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: taken ? "#10B981" : "#EF4444" }} />
                      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{med}</span>
                      <span style={{ color: taken ? "#10B981" : "#EF4444", fontSize: "10px", fontWeight: 700 }}>{taken ? "✓ Taken" : "✗ Missed"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="animate-fade-in-up animation-delay-500 dashboard-quick-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        <Link href="/tracker/log" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          background: "#3B82F6", color: "white", padding: "16px 24px", borderRadius: "16px",
          textDecoration: "none", fontWeight: 700, fontSize: "15px",
          boxShadow: "0 8px 24px rgba(59,130,246,0.2)", transition: "all 0.3s ease",
        }} className="hover-scale">
          📝 Log Today&apos;s Data
        </Link>
        <Link href="/tracker/chat" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          background: "var(--bg-card)", color: "var(--text-primary)", padding: "16px 24px", borderRadius: "16px",
          textDecoration: "none", fontWeight: 700, fontSize: "15px",
          border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", transition: "all 0.3s ease",
        }} className="hover-scale">
          🤖 Ask Health Coach
        </Link>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .dashboard-top-grid { grid-template-columns: 1fr !important; }
          .dashboard-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dashboard-bottom-grid { grid-template-columns: 1fr !important; }
          .dashboard-quick-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
