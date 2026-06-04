"use client";

import { useState, useEffect } from "react";
import {
  Utensils, Footprints, Moon, Heart, Pill, Save,
  Plus, X, Droplets, Dumbbell, Smile, Frown, Meh, Zap,
  Clock, Sparkles
} from "lucide-react";
import {
  loadProfile, loadTodayLog, saveDailyLog, calculateDailyScore,
  estimateCalories, estimateWorkoutCalories,
  calculateSleepHours,
  type DailyLog, type MealEntry, type WorkoutEntry, type HealthProfile,
} from "@/lib/health-tracker";

type LogTab = "food" | "activity" | "sleep" | "vitals" | "meds";

export default function LogPage() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [log, setLog] = useState<DailyLog | null>(null);
  const [activeTab, setActiveTab] = useState<LogTab>("food");
  const [saved, setSaved] = useState(false);

  // Food form
  const [foodText, setFoodText] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [mealTime, setMealTime] = useState(() => {
    const h = new Date().getHours();
    const m = new Date().getMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  // Activity form
  const [workoutType, setWorkoutType] = useState("walk");
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [workoutIntensity, setWorkoutIntensity] = useState<"light" | "moderate" | "intense">("moderate");

  useEffect(() => {
    setProfile(loadProfile());
    setLog(loadTodayLog());
  }, []);

  if (!profile || !log) return null;

  const handleSave = () => {
    const score = calculateDailyScore(log, profile);
    const updatedLog = { ...log, daily_score: score };
    saveDailyLog(updatedLog);
    setLog(updatedLog);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addMeal = () => {
    if (!foodText.trim()) return;
    const est = estimateCalories(foodText);
    const meal: MealEntry = {
      id: Date.now().toString(),
      time: mealTime,
      food: foodText.trim(),
      meal_type: mealType,
      estimated_calories: est.totalCalories,
      estimated_protein: est.totalProtein,
    };
    setLog({ ...log, meals: [...log.meals, meal] });
    setFoodText("");
  };

  const removeMeal = (id: string) => {
    setLog({ ...log, meals: log.meals.filter(m => m.id !== id) });
  };

  const addWorkout = () => {
    const cal = estimateWorkoutCalories(workoutType, workoutDuration, workoutIntensity);
    const w: WorkoutEntry = {
      id: Date.now().toString(),
      type: workoutType as WorkoutEntry["type"],
      duration_min: workoutDuration,
      intensity: workoutIntensity,
      calories_burned: cal,
    };
    setLog({ ...log, workouts: [...log.workouts, w] });
  };

  const removeWorkout = (id: string) => {
    setLog({ ...log, workouts: log.workouts.filter(w => w.id !== id) });
  };

  // Adjust time helper
  const adjustMealTime = (hoursOffset: number, minsOffset: number) => {
    const [h, m] = mealTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h + hoursOffset, m + minsOffset);
    setMealTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };

  const adjustSleepTime = (type: "slept" | "woke", minsOffset: number) => {
    const currentVal = type === "slept" ? log.sleep.slept_at : log.sleep.woke_at;
    const [h, m] = currentVal.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + minsOffset);
    const newVal = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    
    setLog({
      ...log,
      sleep: {
        ...log.sleep,
        [type === "slept" ? "slept_at" : "woke_at"]: newVal
      }
    });
  };

  const tabs: { id: LogTab; label: string; icon: React.ReactNode }[] = [
    { id: "food", label: "Food", icon: <Utensils size={16} /> },
    { id: "activity", label: "Activity", icon: <Dumbbell size={16} /> },
    { id: "sleep", label: "Sleep", icon: <Moon size={16} /> },
    { id: "vitals", label: "Vitals", icon: <Heart size={16} /> },
    { id: "meds", label: "Meds", icon: <Pill size={16} /> },
  ];

  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "16px",
    border: "1px solid var(--border)",
    padding: "28px",
    boxShadow: "var(--shadow-card)",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "var(--bg-surface)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    outline: "none",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          📝 Log Today&apos;s Health Data
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          Record nutrition, sensor steps, sleep intervals, vitals, and feeling triggers.
        </p>
      </div>

      {/* Tab Selector bar (Branded theme active styles) */}
      <div style={{ display: "flex", gap: "6px", background: "var(--bg-card)", borderRadius: "14px", padding: "4px", border: "1px solid var(--border)" }} className="log-tab-bar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
            fontFamily: "var(--font-body)", fontWeight: activeTab === t.id ? 700 : 500, fontSize: "13px",
            color: activeTab === t.id ? "white" : "var(--text-secondary)",
            background: activeTab === t.id ? "var(--purple-primary)" : "transparent",
            boxShadow: activeTab === t.id ? "var(--shadow-purple)" : "none",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            {t.icon}
            <span className="log-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ===== FOOD TAB ===== */}
      {activeTab === "food" && (
        <div style={cardStyle} className="animate-fade-in">
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>🍽️ Add Meal</h3>

          {/* Quick suggestions */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {["2 roti, dal", "rice, rajma", "paratha, dahi", "chai", "egg, bread", "poha", "idli", "maggi"].map(food => (
              <button key={food} onClick={() => setFoodText(food)} style={{
                padding: "6px 14px", borderRadius: "100px", border: "1px solid var(--border)",
                background: "rgba(0,113,227,0.04)", color: "var(--purple-primary)",
                fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
                transition: "all 0.2s",
              }} className="hover:scale-103">
                {food}
              </button>
            ))}
          </div>

          {/* Meal Details Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input value={foodText} onChange={e => setFoodText(e.target.value)} placeholder="E.g. 2 roti, dal, dahi" style={inputStyle} />
            
            {/* Meal Time Selector with quick offsets */}
            <div>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Meal Log Time</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <input type="time" value={mealTime} onChange={e => setMealTime(e.target.value)} style={{ ...inputStyle, width: "130px" }} />
                <button
                  type="button"
                  onClick={() => {
                    const h = new Date().getHours();
                    const m = new Date().getMinutes();
                    setMealTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
                  }}
                  style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: "rgba(0,113,227,0.06)", color: "var(--purple-primary)", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => adjustMealTime(1, 0)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  +1h
                </button>
                <button
                  type="button"
                  onClick={() => adjustMealTime(-1, 0)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  -1h
                </button>
                <button
                  type="button"
                  onClick={() => adjustMealTime(0, 15)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => adjustMealTime(0, -15)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-surface)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                >
                  -15m
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }} className="meal-form-grid">
              <select value={mealType} onChange={e => setMealType(e.target.value as MealEntry["meal_type"])} style={selectStyle}>
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍿 Snack</option>
              </select>
              <button onClick={addMeal} disabled={!foodText.trim()} style={{
                flex: 1, padding: "11px", borderRadius: "8px", border: "none", cursor: foodText.trim() ? "pointer" : "not-allowed",
                background: foodText.trim() ? "var(--purple-primary)" : "var(--border)", color: "white",
                fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all 0.2s",
              }}>
                <Plus size={16} /> Add Meal
              </button>
            </div>

            {/* Live Calorie Estimate Preview */}
            {foodText.trim() && (
              <div style={{ padding: "12px 16px", background: "rgba(0,113,227,0.04)", borderRadius: "12px", border: "1px dashed rgba(0,113,227,0.15)" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--purple-primary)", fontWeight: 600 }}>
                  ⚡ Estimated: {estimateCalories(foodText).totalCalories} kcal • {estimateCalories(foodText).totalProtein}g protein
                </p>
              </div>
            )}
          </div>

          {/* Logged Meals List */}
          {log.meals.length > 0 && (
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Logged Meals</h4>
              {log.meals.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>{m.food}</p>
                    <p style={{ margin: 0, fontSize: "10px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{m.meal_type} • {m.time} • {m.estimated_calories} kcal</p>
                  </div>
                  <button onClick={() => removeMeal(m.id)} style={{ background: "none", border: "none", color: "var(--severity-high)", cursor: "pointer", padding: "4px" }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Water Intake Section */}
          <div style={{ marginTop: "28px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: 700 }}>💧 Water Intake</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button onClick={() => setLog({ ...log, water_glasses: Math.max(0, log.water_glasses - 1) })} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "32px", fontWeight: 800, color: "var(--purple-light)" }}>{log.water_glasses}</span>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", marginLeft: "4px" }}>glasses</span>
              </div>
              <button onClick={() => setLog({ ...log, water_glasses: log.water_glasses + 1 })} style={{ width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "var(--purple-light)", color: "white", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ACTIVITY TAB ===== */}
      {activeTab === "activity" && (
        <div style={cardStyle} className="animate-fade-in">
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>🏃 Log Activity</h3>

          {/* Manual Steps override */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Steps Walked (Manual Entry)</label>
            <input type="number" value={log.steps} onChange={e => setLog({ ...log, steps: parseInt(e.target.value) || 0 })} style={inputStyle} placeholder="E.g., 6200" />
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Note: You can enable auto-tracking directly from the Steps Card on the Dashboard.
            </p>
          </div>

          {/* Add workout */}
          <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700 }}>Add Workout Activity</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "12px", marginBottom: "16px" }} className="workout-form-grid">
            <select value={workoutType} onChange={e => setWorkoutType(e.target.value)} style={selectStyle}>
              <option value="walk">🚶 Walk</option>
              <option value="running">🏃 Running</option>
              <option value="yoga">🧘 Yoga</option>
              <option value="gym">🏋️ Gym</option>
              <option value="cycling">🚴 Cycling</option>
              <option value="home_workout">🏠 Home</option>
            </select>
            <input type="number" value={workoutDuration} onChange={e => setWorkoutDuration(parseInt(e.target.value) || 0)} style={inputStyle} placeholder="Min" />
            <select value={workoutIntensity} onChange={e => setWorkoutIntensity(e.target.value as "light" | "moderate" | "intense")} style={selectStyle}>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="intense">Intense</option>
            </select>
            <button onClick={addWorkout} style={{ padding: "10px 18px", borderRadius: "8px", border: "none", background: "var(--purple-primary)", color: "white", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={16} />
            </button>
          </div>

          {/* Preview workout burn */}
          <div style={{ padding: "12px 16px", background: "rgba(0,113,227,0.04)", borderRadius: "12px", border: "1px dashed rgba(0,113,227,0.15)", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--purple-primary)", fontWeight: 600 }}>
              ⚡ {workoutDuration} min {workoutType} ({workoutIntensity}) ≈ {estimateWorkoutCalories(workoutType, workoutDuration, workoutIntensity)} kcal burned
            </p>
          </div>

          {/* Logged Workouts List */}
          {log.workouts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {log.workouts.map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg-surface)" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, textTransform: "capitalize" }}>{w.type} — {w.duration_min} min ({w.intensity})</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--purple-primary)", fontWeight: 600 }}>{w.calories_burned} kcal</span>
                    <button onClick={() => removeWorkout(w.id)} style={{ background: "none", border: "none", color: "var(--severity-high)", cursor: "pointer" }}><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SLEEP TAB ===== */}
      {activeTab === "sleep" && (
        <div style={cardStyle} className="animate-fade-in">
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>💤 Sleep Log</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="sleep-form-grid">
            {/* Slept At with quick adjusters */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Slept At</label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input type="time" value={log.sleep.slept_at} onChange={e => setLog({ ...log, sleep: { ...log.sleep, slept_at: e.target.value } })} style={{ ...inputStyle, flex: 1 }} />
                <button
                  type="button"
                  onClick={() => adjustSleepTime("slept", 30)}
                  style={{ padding: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => adjustSleepTime("slept", -30)}
                  style={{ padding: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  -30m
                </button>
              </div>
            </div>

            {/* Woke Up At with quick adjusters */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Woke Up At</label>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input type="time" value={log.sleep.woke_at} onChange={e => setLog({ ...log, sleep: { ...log.sleep, woke_at: e.target.value } })} style={{ ...inputStyle, flex: 1 }} />
                <button
                  type="button"
                  onClick={() => adjustSleepTime("woke", 30)}
                  style={{ padding: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => adjustSleepTime("woke", -30)}
                  style={{ padding: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
                >
                  -30m
                </button>
              </div>
            </div>
          </div>

          {/* Live computed sleep duration feedback */}
          <div style={{ marginTop: "20px", padding: "14px 18px", background: "rgba(0,113,227,0.04)", border: "1.5px solid rgba(0,113,227,0.12)", borderRadius: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
              Real-time Sleep Duration:
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "white",
                background: calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at) >= 7 ? "var(--severity-low)" : "var(--severity-high)",
                padding: "2px 10px",
                borderRadius: "100px",
              }}
            >
              {calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at)} hours ({calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at) >= 7 ? "Optimal Goal" : "Poor Duration"})
            </span>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Sleep Quality</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {(["good", "average", "poor"] as const).map(q => (
                <button key={q} onClick={() => setLog({ ...log, sleep: { ...log.sleep, quality: q } })} style={{
                  flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--border)",
                  background: log.sleep.quality === q ? (q === "good" ? "var(--severity-low)" : q === "average" ? "var(--severity-med)" : "var(--severity-high)") : "var(--bg-card)",
                  color: log.sleep.quality === q ? "white" : "var(--text-secondary)",
                  fontWeight: 700, fontSize: "13px", cursor: "pointer", textTransform: "capitalize",
                  transition: "all 0.2s",
                }}>
                  {q === "good" ? "😊" : q === "average" ? "😐" : "😴"} {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== VITALS TAB ===== */}
      {activeTab === "vitals" && (
        <div style={cardStyle} className="animate-fade-in">
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700 }}>❤️ Vitals</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="vitals-form-grid">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Blood Pressure</label>
              <input value={log.vitals.bp || ""} onChange={e => setLog({ ...log, vitals: { ...log.vitals, bp: e.target.value } })} placeholder="E.g., 120/80" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Fasting Blood Sugar</label>
              <input type="number" value={log.vitals.blood_sugar_fasting || ""} onChange={e => setLog({ ...log, vitals: { ...log.vitals, blood_sugar_fasting: parseInt(e.target.value) || undefined } })} placeholder="mg/dL" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Weight (kg)</label>
              <input type="number" step="0.1" value={log.vitals.weight_kg || ""} onChange={e => setLog({ ...log, vitals: { ...log.vitals, weight_kg: parseFloat(e.target.value) || undefined } })} placeholder="Kg" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Heart Rate</label>
              <input type="number" value={log.vitals.heart_rate || ""} onChange={e => setLog({ ...log, vitals: { ...log.vitals, heart_rate: parseInt(e.target.value) || undefined } })} placeholder="bpm" style={inputStyle} />
            </div>
          </div>
        </div>
      )}

      {/* ===== MEDS & MOOD TAB ===== */}
      {activeTab === "meds" && (
        <div style={cardStyle} className="animate-fade-in">
          
          {/* Mood selection */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Mood Bucket</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["happy", "calm", "neutral", "stressed", "anxious"] as const).map(m => (
                <button key={m} onClick={() => setLog({ ...log, mood: m })} style={{
                  padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--border)",
                  background: log.mood === m ? "var(--purple-primary)" : "var(--bg-card)",
                  color: log.mood === m ? "white" : "var(--text-secondary)",
                  fontWeight: 600, fontSize: "13px", cursor: "pointer", textTransform: "capitalize",
                  transition: "all 0.2s",
                }}>
                  {m === "happy" ? "😊" : m === "calm" ? "😌" : m === "neutral" ? "😐" : m === "stressed" ? "😰" : "😟"} {m}
                </button>
              ))}
            </div>
          </div>

          {/* Custom feeling tag write-in textbox */}
          <div style={{ marginBottom: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              Describe your feeling (Dynamic write-in)
            </label>
            <input 
              type="text" 
              value={log.custom_mood_text || ""} 
              onChange={e => setLog({ ...log, custom_mood_text: e.target.value })} 
              placeholder="E.g. Feeling very sleepy, exhausted after walk, highly energetic" 
              style={inputStyle} 
            />
          </div>

          {/* Energy bar */}
          <div style={{ marginBottom: "24px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Energy Level: {log.energy_level}/10</label>
            <input type="range" min={1} max={10} value={log.energy_level} onChange={e => setLog({ ...log, energy_level: parseInt(e.target.value) })} style={{ width: "100%", accentColor: "var(--purple-primary)" }} />
          </div>

          {/* Medication Checklist */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Mark Medications</label>
            {profile.medications.length > 0 ? (
              <div>
                {profile.medications.map((med, i) => {
                  const taken = log.medications_taken.includes(med);
                  return (
                    <button key={i} onClick={() => {
                      if (taken) {
                        setLog({
                          ...log,
                          medications_taken: log.medications_taken.filter(m => m !== med),
                          medications_missed: [...log.medications_missed, med],
                        });
                      } else {
                        setLog({
                          ...log,
                          medications_taken: [...log.medications_taken, med],
                          medications_missed: log.medications_missed.filter(m => m !== med),
                        });
                      }
                    }} style={{
                      display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "12px 16px",
                      borderRadius: "12px", border: `1.5px solid ${taken ? "var(--severity-low)" : "var(--border)"}`,
                      background: taken ? "rgba(52,199,89,0.03)" : "var(--bg-card)",
                      cursor: "pointer", marginBottom: "8px", transition: "all 0.2s",
                    }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "6px", border: taken ? "none" : "2px solid var(--border)", background: taken ? "var(--severity-low)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px" }}>
                        {taken && "✓"}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{med}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                No medications configured in your profile. Update your Health Profile to add medications.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Global Save Button */}
      <button onClick={handleSave} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%",
        padding: "16px", borderRadius: "100px", border: "none",
        background: saved ? "var(--severity-low)" : "var(--purple-primary)", color: "white",
        fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "15px", cursor: "pointer",
        boxShadow: saved ? "0 4px 12px rgba(52,199,89,0.15)" : "0 4px 12px rgba(0,113,227,0.15)",
        transition: "all 0.3s ease",
      }}>
        <Save size={18} />
        {saved ? "✓ Logs Saved Successfully!" : "Save Daily Logs"}
      </button>

      <style jsx global>{`
        @media (max-width: 640px) {
          .log-tab-bar { flex-wrap: wrap !important; }
          .log-tab-label { display: none !important; }
          .meal-form-grid { grid-template-columns: 1fr !important; }
          .workout-form-grid { grid-template-columns: 1fr 1fr !important; }
          .sleep-form-grid { grid-template-columns: 1fr !important; }
          .vitals-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
