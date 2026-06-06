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
  Navigation,
} from "lucide-react";
import {
  loadProfile,
  loadTodayLog,
  calculateDailyScore,
  calculateSleepHours,
  saveDailyLog,
  type HealthProfile,
  type DailyLog,
} from "@/lib/health-tracker";

// GPS distance calculation helper (Haversine formula)
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // returns distance in meters
}

export default function TrackerDashboard() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [score, setScore] = useState(0);

  // GPS Sensor state
  const [isSensorActive, setIsSensorActive] = useState(false);
  const [sensorDistance, setSensorDistance] = useState(0);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [simIntervalId, setSimIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = "Mood & Tracks — CliniHome AI";
    const p = loadProfile();
    const l = loadTodayLog();
    setProfile(p);
    setLog(l);
    setScore(calculateDailyScore(l, p));
  }, []);

  // Stop GPS watcher and simulation on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (simIntervalId) {
        clearInterval(simIntervalId);
      }
    };
  }, [watchId, simIntervalId]);

  const updateSteps = (addCount: number) => {
    setLog((prevLog) => {
      if (!prevLog) return prevLog;
      const updatedSteps = prevLog.steps + addCount;
      const updated = { ...prevLog, steps: updatedSteps };
      
      const computedScore = calculateDailyScore(updated, profile!);
      updated.daily_score = computedScore;
      saveDailyLog(updated);
      setScore(computedScore);
      return updated;
    });
  };

  // Toggle GPS Step tracking sensor
  const toggleSensor = () => {
    if (isSensorActive) {
      // Deactivate sensor
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      if (simIntervalId) {
        clearInterval(simIntervalId);
        setSimIntervalId(null);
      }
      setIsSensorActive(false);
      setLastCoords(null);
    } else {
      // Activate sensor
      setIsSensorActive(true);

      const startSimulator = () => {
        setSimIntervalId((currentInterval) => {
          if (currentInterval) return currentInterval;
          return setInterval(() => {
            updateSteps(12);
            setSensorDistance((prev) => prev + 9.15);
          }, 2000);
        });
      };
      
      // 1. Geolocation API (for mobile/real movement)
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLastCoords((prev) => {
              if (prev) {
                const dist = getDistanceFromLatLonInMeters(prev.lat, prev.lng, latitude, longitude);
                if (dist > 1.2) { // filter noise
                  setSensorDistance((prevDist) => {
                    const newDist = prevDist + dist;
                    // Add steps (1.31 steps per meter walked)
                    const stepsToAdd = Math.round(dist * 1.31);
                    updateSteps(stepsToAdd);
                    return newDist;
                  });
                }
              }
              return { lat: latitude, lng: longitude };
            });
          },
          (err) => {
            console.warn("GPS tracking denied/blocked, starting desktop simulator:", err);
            startSimulator();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
        setWatchId(id);
      } else {
        console.warn("Geolocation API not available, starting desktop simulator");
        startSimulator();
      }
    }
  };

  const handleMoodSelect = (selectedMood: "happy" | "calm" | "neutral" | "stressed" | "anxious") => {
    if (!log) return;
    const updatedLog = { ...log, mood: selectedMood };
    const computedScore = calculateDailyScore(updatedLog, profile!);
    updatedLog.daily_score = computedScore;
    saveDailyLog(updatedLog);
    setLog(updatedLog);
    setScore(computedScore);
  };

  const handleUpdateWater = (amount: number) => {
    if (!log) return;
    const currentWater = log.water_glasses || 0;
    const newWater = Math.max(0, currentWater + amount);
    const updatedLog = { ...log, water_glasses: newWater };
    const computedScore = calculateDailyScore(updatedLog, profile!);
    updatedLog.daily_score = computedScore;
    saveDailyLog(updatedLog);
    setLog(updatedLog);
    setScore(computedScore);
  };

  if (!profile || !log) return null;

  const totalCalories = log.meals.reduce((s, m) => s + m.estimated_calories, 0);
  const totalProtein = log.meals.reduce((s, m) => s + m.estimated_protein, 0);
  const sleepHrs = calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at);

  const moodIcon = log.mood === "happy" ? <Smile size={18} /> : log.mood === "stressed" || log.mood === "anxious" ? <Frown size={18} /> : <Meh size={18} />;
  const moodColor = log.mood === "happy" || log.mood === "calm" ? "var(--severity-low)" : log.mood === "stressed" || log.mood === "anxious" ? "var(--severity-high)" : "var(--severity-med)";

  const scoreColor = score >= 7 ? "var(--severity-low)" : score >= 5 ? "var(--severity-med)" : "var(--severity-high)";
  const scorePercent = (score / 10) * 100;

  // SVG circular ring values
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (scorePercent / 100) * ringCircumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">

      {/* Header Info */}
      <div className="animate-fade-in-up">
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--purple-primary)" }}>
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

      {/* Grid: Circle Score + Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }} className="dashboard-top-grid">

        {/* Circular Health Score Card */}
        <div
          className="apple-card"
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
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
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: scoreColor, fontFamily: "var(--font-heading)", lineHeight: 1 }}>{score}</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>/10</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Daily Score</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>
              {score >= 7 ? "Great status! 🎉" : score >= 5 ? "Good progress! 💪" : "Let's improve! 🌱"}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }} className="dashboard-stats-grid">

          {/* Calories */}
          <div className="apple-card animate-fade-in-up" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,45,85,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-pink)" }}>
                <Utensils size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Calories consumed</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{totalCalories}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.daily_cal_goal} kcal goal</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((totalCalories / profile.daily_cal_goal) * 100, 100)}%`, background: "var(--accent-pink)", borderRadius: "3px", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Steps (With GPS walk Auto-Sensor) */}
          <div className="apple-card animate-fade-in-up" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0,113,227,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-primary)" }}>
                  <Footprints size={16} />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Steps Walked</span>
              </div>

              {/* Pulsing indicator if GPS is active */}
              {isSensorActive && (
                <span style={{ fontSize: "10px", color: "var(--severity-high)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--severity-high)", animation: "pulse-glow-dot 1.5s infinite" }} />
                  GPS ACTIVE
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }} id="dashboard-steps-count">{log.steps.toLocaleString()}</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.step_goal.toLocaleString()} goal</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((log.steps / profile.step_goal) * 100, 100)}%`, background: "var(--purple-primary)", borderRadius: "3px", transition: "width 0.4s" }} />
            </div>

            {/* GPS Auto-Tracker Toggle */}
            <div style={{ marginTop: "14px", borderTop: "1px solid var(--border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 500 }}>
                {isSensorActive ? `Auto Walked: ${sensorDistance.toFixed(0)}m` : "Walk with phone"}
              </span>
              <button
                onClick={toggleSensor}
                id="toggle-gps-sensor"
                style={{
                  background: isSensorActive ? "rgba(239,68,68,0.1)" : "rgba(0,113,227,0.06)",
                  color: isSensorActive ? "var(--severity-high)" : "var(--purple-primary)",
                  border: "none",
                  borderRadius: "100px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <Navigation size={10} style={{ transform: isSensorActive ? "rotate(45deg)" : "none" }} />
                {isSensorActive ? "Stop GPS" : "Auto Steps"}
              </button>
            </div>
          </div>

          {/* Water */}
          <div className="apple-card animate-fade-in-up" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(56,151,253,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-light)" }}>
                <Droplets size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Water consumed</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{log.water_glasses}</p>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ 8 glasses</p>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(-1)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "var(--text-primary)",
                  }}
                  className="hover:bg-gray-100 active:scale-95 duration-100"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWater(1)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "var(--text-primary)",
                  }}
                  className="hover:bg-gray-100 active:scale-95 duration-100"
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((log.water_glasses / 8) * 100, 100)}%`, background: "var(--purple-light)", borderRadius: "3px", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Sleep */}
          <div className="apple-card animate-fade-in-up" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(124,58,237,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>
                <Moon size={16} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Sleep logged</span>
            </div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{sleepHrs}h</p>
            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>/ {profile.sleep_goal_hrs}h goal • {log.sleep.quality}</p>
            <div style={{ marginTop: "12px", height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((sleepHrs / profile.sleep_goal_hrs) * 100, 100)}%`, background: "#7C3AED", borderRadius: "3px", transition: "width 0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Meals + Mood/Meds */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }} className="dashboard-bottom-grid">

        {/* Meals list */}
        <div className="apple-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>🍽️ Today&apos;s Meals</h3>
            <Link href="/tracker/log" style={{ fontSize: "12px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              Log Meal <ChevronRight size={14} />
            </Link>
          </div>

          {log.meals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Utensils size={28} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>No meals logged today. Click Log tab to add one!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {log.meals.map((meal) => (
                <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{meal.food}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "10px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{meal.meal_type} • {meal.time}</p>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-pink)" }}>{meal.estimated_calories} kcal</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 16px 0", borderTop: "1px solid var(--border)", marginTop: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>Total Nutrition</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent-pink)" }}>{totalCalories} kcal • {totalProtein}g protein</span>
              </div>
            </div>
          )}
        </div>

        {/* Mood and Medications sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Emojis Selector (Update Mood Instantly) */}
          <div
            className="apple-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>😌 Log Mood & Feelings</h3>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>
                Update your mood state directly. Recommended soundscapes sync instantly.
              </p>
            </div>

            {/* Emoji Grid */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", background: "var(--bg-surface)", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              {(["happy", "calm", "neutral", "stressed", "anxious"] as const).map((m) => {
                const isActive = log.mood === m;
                const emoji = m === "happy" ? "😊" : m === "calm" ? "😌" : m === "neutral" ? "😐" : m === "stressed" ? "😰" : "😟";
                return (
                  <button
                    key={m}
                    onClick={() => handleMoodSelect(m)}
                    title={m.charAt(0).toUpperCase() + m.slice(1)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      fontSize: "18px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: isActive ? "var(--purple-primary)" : "transparent",
                      color: isActive ? "white" : "inherit",
                      boxShadow: isActive ? "var(--shadow-purple)" : "none",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>

            {/* Custom feel write-in description if saved in log */}
            {log.custom_mood_text && (
              <div style={{ padding: "10px 14px", borderLeft: "3px solid var(--purple-primary)", background: "rgba(0,113,227,0.02)", borderRadius: "0 8px 8px 0" }}>
                <span style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 700, color: "var(--text-secondary)" }}>Logged feeling</span>
                <p style={{ margin: "2px 0 0", fontSize: "12px", fontStyle: "italic", color: "var(--text-primary)" }}>
                  &ldquo;{log.custom_mood_text}&rdquo;
                </p>
              </div>
            )}

            {/* Soundscapes Call-to-Action Link */}
            <Link
              href="/tracker/music"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "rgba(0,113,227,0.04)",
                color: "var(--purple-primary)",
                border: "1px solid rgba(0,113,227,0.15)",
                padding: "10px 14px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 700,
                textDecoration: "none",
                marginTop: "4px",
                transition: "all 0.2s"
              }}
              className="hover:scale-102"
            >
              🎧 Open Relaxer Music Tab
            </Link>
          </div>

          {/* Vitals & Meds Overview */}
          <div className="apple-card" style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>💊 Today&apos;s Medications</h3>
            {profile.medications.length === 0 ? (
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>No medications configured.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {profile.medications.map((med, i) => {
                  const taken = log.medications_taken.includes(med);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: taken ? "var(--severity-low)" : "var(--severity-high)" }} />
                      <span style={{ color: "var(--text-primary)", fontWeight: 600, flex: 1 }}>{med}</span>
                      <span style={{ color: taken ? "var(--severity-low)" : "var(--severity-high)", fontWeight: 700, fontSize: "10px" }}>{taken ? "✓ Taken" : "✗ Missed"}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Dashboard Action links */}
      <div
        className="animate-fade-in-up dashboard-quick-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "12px"
        }}
      >
        <Link href="/tracker/log" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          background: "var(--purple-primary)", color: "white", padding: "14px 24px", borderRadius: "100px",
          textDecoration: "none", fontWeight: 700, fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0, 113, 227, 0.15)", transition: "all 0.2s",
        }} className="hover:scale-102">
          📝 Log Today&apos;s Data
        </Link>
        <Link href="/tracker/chat" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          background: "var(--bg-card)", color: "var(--text-primary)", padding: "14px 24px", borderRadius: "100px",
          textDecoration: "none", fontWeight: 700, fontSize: "14px",
          border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", transition: "all 0.2s",
        }} className="hover:scale-102">
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
        @media (max-width: 480px) {
          .dashboard-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
