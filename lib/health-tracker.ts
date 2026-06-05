// ============================================================
// HEALTH TRACKER — Types, Scoring, Calorie DB & Storage
// ============================================================

// ---------- Types ----------

export interface HealthProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  weight_kg: number;
  height_cm: number;
  conditions: string[];
  medications: string[];
  daily_cal_goal: number;
  step_goal: number;
  sleep_goal_hrs: number;
}

export interface MealEntry {
  id: string;
  time: string;          // "08:30"
  food: string;          // "2 roti, dal, dahi"
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  estimated_calories: number;
  estimated_protein: number;
}

export interface WorkoutEntry {
  id: string;
  type: "walk" | "yoga" | "gym" | "running" | "cycling" | "home_workout" | "other";
  duration_min: number;
  intensity: "light" | "moderate" | "intense";
  calories_burned: number;
}

export interface DailyLog {
  date: string;           // "2026-06-03"
  meals: MealEntry[];
  water_glasses: number;
  steps: number;
  workouts: WorkoutEntry[];
  sleep: {
    slept_at: string;     // "23:30"
    woke_at: string;      // "06:00"
    quality: "good" | "average" | "poor";
  };
  vitals: {
    bp?: string;          // "128/82"
    blood_sugar_fasting?: number;
    blood_sugar_post_meal?: number;
    weight_kg?: number;
    heart_rate?: number;
    spo2?: number;
    temperature?: number;
  };
  medications_taken: string[];
  medications_missed: string[];
  mood: "happy" | "calm" | "stressed" | "anxious" | "neutral";
  energy_level: number;   // 1-10
  daily_score?: number;   // 1-10, AI or algo calculated
  ai_summary?: string;
  custom_mood_text?: string;
}

export interface HealthChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface DayHistoryEntry {
  date: string;
  score: number;
  steps: number;
  sleep_hrs: number;
  calories: number;
  water: number;
}

// ---------- Indian Food Calorie Database ----------

export const INDIAN_FOOD_DB: Record<string, { calories: number; protein: number; label: string }> = {
  "roti":       { calories: 80,  protein: 3,  label: "Roti (1 medium)" },
  "rice":       { calories: 130, protein: 2,  label: "Rice (1 katori)" },
  "dal":        { calories: 150, protein: 9,  label: "Dal (1 katori)" },
  "rajma":      { calories: 160, protein: 8,  label: "Rajma (1 katori)" },
  "chole":      { calories: 170, protein: 9,  label: "Chole (1 katori)" },
  "sabzi":      { calories: 100, protein: 3,  label: "Sabzi (1 katori)" },
  "paratha":    { calories: 230, protein: 5,  label: "Paratha (1)" },
  "dahi":       { calories: 60,  protein: 4,  label: "Dahi (1 katori)" },
  "chai":       { calories: 65,  protein: 2,  label: "Chai (1 cup)" },
  "egg":        { calories: 78,  protein: 6,  label: "Egg (1 boiled)" },
  "paneer":     { calories: 120, protein: 8,  label: "Paneer (50g)" },
  "chicken":    { calories: 150, protein: 25, label: "Chicken (100g)" },
  "fish":       { calories: 120, protein: 22, label: "Fish (100g)" },
  "salad":      { calories: 40,  protein: 1,  label: "Salad (1 plate)" },
  "idli":       { calories: 60,  protein: 2,  label: "Idli (1)" },
  "dosa":       { calories: 170, protein: 4,  label: "Dosa (1 plain)" },
  "poha":       { calories: 180, protein: 4,  label: "Poha (1 katori)" },
  "upma":       { calories: 200, protein: 5,  label: "Upma (1 katori)" },
  "khichdi":    { calories: 200, protein: 7,  label: "Khichdi (1 katori)" },
  "biryani":    { calories: 350, protein: 12, label: "Biryani (1 plate)" },
  "samosa":     { calories: 260, protein: 4,  label: "Samosa (1)" },
  "lassi":      { calories: 150, protein: 5,  label: "Lassi (1 glass)" },
  "milk":       { calories: 100, protein: 6,  label: "Milk (1 glass)" },
  "bread":      { calories: 80,  protein: 3,  label: "Bread (1 slice)" },
  "banana":     { calories: 90,  protein: 1,  label: "Banana (1)" },
  "apple":      { calories: 80,  protein: 0,  label: "Apple (1)" },
  "maggi":      { calories: 310, protein: 7,  label: "Maggi (1 pack)" },
};

// ---------- Calorie Estimation ----------

export function estimateCalories(foodText: string): { totalCalories: number; totalProtein: number; items: string[] } {
  const text = foodText.toLowerCase();
  let totalCalories = 0;
  let totalProtein = 0;
  const items: string[] = [];

  // Check for quantity patterns like "2 roti" or "3 paratha"
  for (const [key, data] of Object.entries(INDIAN_FOOD_DB)) {
    const regex = new RegExp(`(\\d+)?\\s*${key}`, "gi");
    const match = text.match(regex);
    if (match) {
      for (const m of match) {
        const qtyMatch = m.match(/(\d+)/);
        const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        totalCalories += data.calories * qty;
        totalProtein += data.protein * qty;
        items.push(`${qty}x ${data.label}`);
      }
    }
  }

  // If nothing matched, give a rough estimate
  if (items.length === 0) {
    totalCalories = 300; // Default estimate for unknown meal
    totalProtein = 10;
    items.push("Custom meal (estimated)");
  }

  return { totalCalories, totalProtein, items };
}

// ---------- Workout Calorie Burn Estimation ----------

export function estimateWorkoutCalories(type: string, durationMin: number, intensity: string): number {
  const baseCal: Record<string, number> = {
    "walk": 4,
    "yoga": 3,
    "gym": 6,
    "running": 10,
    "cycling": 7,
    "home_workout": 5,
    "other": 4,
  };

  const intensityMultiplier: Record<string, number> = {
    "light": 0.7,
    "moderate": 1.0,
    "intense": 1.4,
  };

  const base = baseCal[type] || 4;
  const mult = intensityMultiplier[intensity] || 1.0;

  return Math.round(base * mult * durationMin);
}

// ---------- Sleep Hours Calculation ----------

export function calculateSleepHours(sleptAt: string, wokeAt: string): number {
  const [sleepH, sleepM] = sleptAt.split(":").map(Number);
  const [wakeH, wakeM] = wokeAt.split(":").map(Number);

  let sleepMinutes = sleepH * 60 + sleepM;
  let wakeMinutes = wakeH * 60 + wakeM;

  // If sleep time is in PM/night and wake is in AM, add 24 hours
  if (wakeMinutes <= sleepMinutes) {
    wakeMinutes += 24 * 60;
  }

  return Math.round(((wakeMinutes - sleepMinutes) / 60) * 10) / 10;
}

// ---------- Daily Health Score (1-10) ----------

export function calculateDailyScore(log: DailyLog, profile: HealthProfile): number {
  let score = 0;

  // Sleep: 2 points (7+ hrs = 2, 6hrs = 1, <6 = 0)
  const sleepHrs = calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at);
  if (sleepHrs >= 7) score += 2;
  else if (sleepHrs >= 6) score += 1;

  // Steps: 2 points (8k+ = 2, 5k+ = 1, <5k = 0)
  if (log.steps >= 8000) score += 2;
  else if (log.steps >= 5000) score += 1;

  // Water: 2 points (8+ glasses = 2, 5+ = 1, <5 = 0)
  if (log.water_glasses >= 8) score += 2;
  else if (log.water_glasses >= 5) score += 1;

  // Nutrition: 2 points (3 meals + balanced = 2, 2 meals = 1, poor = 0)
  const mealCount = log.meals.length;
  if (mealCount >= 3) score += 2;
  else if (mealCount >= 2) score += 1;

  // Mood: 1 point (calm/happy = 1, stressed = 0)
  if (log.mood === "happy" || log.mood === "calm" || log.mood === "neutral") score += 1;

  // Medicine: 1 point (all on time = 1, missed = 0)
  if (log.medications_missed.length === 0 && profile.medications.length > 0) {
    score += 1;
  } else if (profile.medications.length === 0) {
    score += 1; // No meds to take = full marks
  }

  return Math.min(score, 10);
}

// ---------- localStorage Helpers ----------

const STORAGE_KEYS = {
  PROFILE: "clinihome-health-profile",
  LOG_PREFIX: "clinihome-health-log-",
  CHAT_HISTORY: "clinihome-health-chat",
};

export function getDefaultProfile(): HealthProfile {
  return {
    name: "User",
    age: 25,
    gender: "male",
    weight_kg: 70,
    height_cm: 170,
    conditions: [],
    medications: [],
    daily_cal_goal: 2000,
    step_goal: 8000,
    sleep_goal_hrs: 7.5,
  };
}

export function loadProfile(): HealthProfile {
  if (typeof window === "undefined") return getDefaultProfile();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultProfile();
}

export function saveProfile(profile: HealthProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getTodayDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultDailyLog(date?: string): DailyLog {
  return {
    date: date || getTodayDateStr(),
    meals: [],
    water_glasses: 0,
    steps: 0,
    workouts: [],
    sleep: { slept_at: "23:00", woke_at: "07:00", quality: "average" },
    vitals: {},
    medications_taken: [],
    medications_missed: [],
    mood: "neutral",
    energy_level: 5,
  };
}

export function loadTodayLog(): DailyLog {
  if (typeof window === "undefined") return getDefaultDailyLog();
  const dateStr = getTodayDateStr();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LOG_PREFIX + dateStr);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultDailyLog(dateStr);
}

export function saveDailyLog(log: DailyLog): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.LOG_PREFIX + log.date, JSON.stringify(log));
}

export function loadLogForDate(dateStr: string): DailyLog | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LOG_PREFIX + dateStr);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export function loadWeekHistory(): DayHistoryEntry[] {
  const history: DayHistoryEntry[] = [];
  const today = new Date();
  const profile = loadProfile();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getTodayDateStr(d);
    const log = loadLogForDate(dateStr);

    if (log) {
      const totalCal = log.meals.reduce((sum, m) => sum + m.estimated_calories, 0);
      const sleepHrs = calculateSleepHours(log.sleep.slept_at, log.sleep.woke_at);
      history.push({
        date: dateStr,
        score: log.daily_score || calculateDailyScore(log, profile),
        steps: log.steps,
        sleep_hrs: sleepHrs,
        calories: totalCal,
        water: log.water_glasses,
      });
    } else {
      history.push({
        date: dateStr,
        score: 0,
        steps: 0,
        sleep_hrs: 0,
        calories: 0,
        water: 0,
      });
    }
  }

  return history;
}

export function loadChatHistory(): HealthChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function saveChatHistory(messages: HealthChatMessage[]): void {
  if (typeof window === "undefined") return;
  // Keep last 50 messages to prevent bloat
  const trimmed = messages.slice(-50);
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
}

// ---------- Build Health Data JSON for AI ----------

export function buildHealthDataForAI(profile: HealthProfile, todayLog: DailyLog, weekHistory: DayHistoryEntry[]) {
  const totalCalories = todayLog.meals.reduce((s, m) => s + m.estimated_calories, 0);
  const totalProtein = todayLog.meals.reduce((s, m) => s + m.estimated_protein, 0);
  const sleepHrs = calculateSleepHours(todayLog.sleep.slept_at, todayLog.sleep.woke_at);

  return {
    user: {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      weight_kg: profile.weight_kg,
      height_cm: profile.height_cm,
      conditions: profile.conditions,
      medications: profile.medications,
    },
    today: {
      date: todayLog.date,
      meals: todayLog.meals.map(m => ({
        time: m.time,
        food: m.food,
        meal_type: m.meal_type,
        estimated_calories: m.estimated_calories,
      })),
      total_calories: totalCalories,
      total_protein: totalProtein,
      water_glasses: todayLog.water_glasses,
      steps: todayLog.steps,
      workouts: todayLog.workouts.map(w => ({
        type: w.type,
        duration_min: w.duration_min,
        intensity: w.intensity,
      })),
      sleep: { ...todayLog.sleep, total_hours: sleepHrs },
      vitals: todayLog.vitals,
      medications_taken: todayLog.medications_taken,
      medications_missed: todayLog.medications_missed,
      mood: todayLog.mood,
      energy_level: todayLog.energy_level,
    },
    weekly_history: weekHistory.filter(h => h.score > 0),
  };
}
