// ============================================================
// USER PROFILE — Types, Storage & AI Context Builders
// ============================================================

// ---------- Patient Profile ----------

export interface PatientProfile {
  name: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other";
  blood_group: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  uploaded_reports: UploadedReport[];
  health_goals: string[];
  language_preference: "hinglish" | "hindi" | "english";
  onboarding_completed: boolean;
}

export interface UploadedReport {
  id: string;
  name: string;
  type: "lab_report" | "prescription" | "scan" | "other";
  upload_date: string;
  // For hackathon MVP: store small text summaries, not full base64
  summary?: string;
  file_type: string; // "image/png", "application/pdf"
}

// ---------- Doctor Profile ----------

export interface DoctorProfile {
  name: string;
  phone: string;
  specialization: string;
  degree: string;
  experience_years: number;
  city: string;
  area: string;
  fees: number;
  preferred_conditions: string[];
  preferred_age_groups: string[];
  consultation_modes: string[];
  ai_settings: {
    ai_assisted_replies: boolean;
    auto_patient_summary: boolean;
    patient_data_access: "full" | "summary_only" | "none";
  };
  onboarding_completed: boolean;
}

const getLocalDateStr = (d: Date = new Date()): string => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ---------- Constants ----------

export const COMMON_CONDITIONS = [
  "Diabetes (Type 1/2)",
  "Hypertension (High BP)",
  "Thyroid Disorder",
  "Asthma / COPD",
  "Heart Disease",
  "PCOD / PCOS",
  "Arthritis",
  "Kidney Disease",
  "Liver Disease",
  "Anemia",
  "Obesity",
  "Depression / Anxiety",
  "Migraine",
  "Epilepsy",
  "Cancer (any type)",
  "None of the above",
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Don't Know"];

export const HEALTH_GOALS = [
  "Weight Loss",
  "Weight Gain / Muscle Building",
  "Manage Diabetes",
  "Control Blood Pressure",
  "Improve Sleep",
  "Fitness & Stamina",
  "Mental Health / Stress",
  "Skin / Hair Health",
  "Pregnancy Planning",
  "General Wellness",
];

export const DOCTOR_SPECIALIZATIONS = [
  "General Physician",
  "Dermatologist",
  "Pathologist",
  "Cardiologist",
  "Orthopedic",
  "Neurologist",
  "Gynecologist",
  "Pediatrician",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
];

export const DOCTOR_PREFERRED_CONDITIONS = [
  "Skin Diseases",
  "Fever & Infections",
  "Diabetes Management",
  "Heart & BP Issues",
  "Bone & Joint Pain",
  "Women's Health",
  "Child Health",
  "Mental Health",
  "Lab Report Analysis",
  "General Checkups",
  "Chronic Disease Management",
  "Emergency Cases",
];

export const AGE_GROUPS = [
  "Children (0-12)",
  "Teenagers (13-19)",
  "Young Adults (20-35)",
  "Middle Aged (36-55)",
  "Seniors (56+)",
  "All Ages",
];

// ---------- Storage Keys ----------

const STORAGE_KEYS = {
  PATIENT_PROFILE: "clinihome-patient-profile",
  DOCTOR_PROFILE: "clinihome-doctor-profile",
};

// ---------- Default Profiles ----------

export function getDefaultPatientProfile(): PatientProfile {
  return {
    name: "",
    phone: "",
    age: 25,
    gender: "male",
    blood_group: "Don't Know",
    conditions: [],
    medications: [],
    allergies: [],
    uploaded_reports: [],
    health_goals: [],
    language_preference: "english",
    onboarding_completed: false,
  };
}

export function getDefaultDoctorProfile(): DoctorProfile {
  return {
    name: "",
    phone: "",
    specialization: "General Physician",
    degree: "",
    experience_years: 1,
    city: "",
    area: "",
    fees: 300,
    preferred_conditions: [],
    preferred_age_groups: ["All Ages"],
    consultation_modes: ["chat"],
    ai_settings: {
      ai_assisted_replies: true,
      auto_patient_summary: true,
      patient_data_access: "full",
    },
    onboarding_completed: false,
  };
}

// ---------- CRUD Helpers ----------

export function loadPatientProfile(): PatientProfile {
  if (typeof window === "undefined") return getDefaultPatientProfile();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultPatientProfile();
}

export function savePatientProfile(profile: PatientProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(profile));

  // Also sync to clinihome-health-profile for the tracker
  const trackerProfile = {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    weight_kg: 70,
    height_cm: 170,
    conditions: profile.conditions,
    medications: profile.medications,
    daily_cal_goal: 2000,
    step_goal: 8000,
    sleep_goal_hrs: 7.5,
  };
  localStorage.setItem("clinihome-health-profile", JSON.stringify(trackerProfile));
}

export function loadDoctorProfile(): DoctorProfile {
  if (typeof window === "undefined") return getDefaultDoctorProfile();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCTOR_PROFILE);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultDoctorProfile();
}

export function saveDoctorProfile(profile: DoctorProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.DOCTOR_PROFILE, JSON.stringify(profile));
}

export function isOnboardingCompleted(role: "patient" | "doctor"): boolean {
  if (typeof window === "undefined") return false;
  if (role === "patient") {
    return loadPatientProfile().onboarding_completed;
  }
  return loadDoctorProfile().onboarding_completed;
}

// ---------- AI Context Builders ----------

export function buildPatientContextForAI(patientProfile?: PatientProfile): string {
  const profile = patientProfile || loadPatientProfile();

  if (!profile.onboarding_completed) {
    return "Patient has not completed onboarding. No profile data available.";
  }

  const ctx: Record<string, unknown> = {
    patient_name: profile.name,
    age: profile.age,
    gender: profile.gender,
    blood_group: profile.blood_group,
    existing_conditions: profile.conditions.length > 0 ? profile.conditions : ["None reported"],
    current_medications: profile.medications.length > 0 ? profile.medications : ["None"],
    known_allergies: profile.allergies.length > 0 ? profile.allergies : ["None reported"],
    health_goals: profile.health_goals.length > 0 ? profile.health_goals : ["General wellness"],
    language_preference: profile.language_preference,
    uploaded_reports_count: profile.uploaded_reports.length,
  };

  // Add report summaries if available
  if (profile.uploaded_reports.length > 0) {
    ctx.recent_reports = profile.uploaded_reports
      .slice(-3)
      .map((r) => ({
        name: r.name,
        type: r.type,
        date: r.upload_date,
        summary: r.summary || "No summary extracted yet",
      }));
  }

  return JSON.stringify(ctx, null, 2);
}

export function buildDoctorContextForAI(doctorProfile?: DoctorProfile): string {
  const profile = doctorProfile || loadDoctorProfile();

  return JSON.stringify(
    {
      doctor_name: profile.name,
      specialization: profile.specialization,
      degree: profile.degree,
      experience_years: profile.experience_years,
      preferred_conditions: profile.preferred_conditions,
      preferred_age_groups: profile.preferred_age_groups,
      ai_settings: profile.ai_settings,
    },
    null,
    2
  );
}

export function buildPatientSummaryForDoctor(patientProfile?: PatientProfile): string {
  const profile = patientProfile || loadPatientProfile();

  if (!profile.onboarding_completed) {
    return "Patient profile not available.";
  }

  // Load today's health data if available
  let healthData: Record<string, unknown> = {};
  if (typeof window !== "undefined") {
    try {
      const todayStr = getLocalDateStr();
      const logStr = localStorage.getItem(`clinihome-health-log-${todayStr}`);
      if (logStr) {
        const log = JSON.parse(logStr);
        healthData = {
          todays_meals: log.meals?.length || 0,
          todays_steps: log.steps || 0,
          todays_water: log.water_glasses || 0,
          todays_mood: log.mood || "unknown",
          todays_score: log.daily_score || "not calculated",
          sleep_quality: log.sleep?.quality || "unknown",
          vitals: log.vitals || {},
        };
      }
    } catch {}
  }

  return JSON.stringify(
    {
      patient_name: profile.name,
      phone: profile.phone,
      age: profile.age,
      gender: profile.gender,
      blood_group: profile.blood_group,
      conditions: profile.conditions,
      medications: profile.medications,
      allergies: profile.allergies,
      health_goals: profile.health_goals,
      reports_uploaded: profile.uploaded_reports.length,
      recent_health_data: healthData,
    },
    null,
    2
  );
}

// ---------- Client-Side Supabase Sync Helpers ----------

export function syncProfileToLocalStorage(role: "patient" | "doctor", dbProfile: Record<string, any>, reports?: Record<string, any>[]): void {
  if (typeof window === "undefined") return;

  if (role === "patient") {
    const patientProfile: PatientProfile = {
      name: dbProfile.full_name || "",
      phone: dbProfile.phone || "",
      age: dbProfile.age || 25,
      gender: dbProfile.gender || "male",
      blood_group: dbProfile.blood_group || "Don't Know",
      conditions: dbProfile.conditions || [],
      medications: dbProfile.medications || [],
      allergies: dbProfile.allergies || [],
      uploaded_reports: reports ? reports.map((r: any) => ({
        id: r.id,
        name: r.name,
        type: r.report_type || "lab_report",
        upload_date: r.created_at ? getLocalDateStr(new Date(r.created_at)) : getLocalDateStr(),
        file_type: r.file_type || "application/pdf",
        summary: r.summary || "",
      })) : [],
      health_goals: dbProfile.health_goals || [],
      language_preference: dbProfile.language_preference || "english",
      onboarding_completed: dbProfile.onboarding_completed || false,
    };
    savePatientProfile(patientProfile);
  } else {
    const doctorProfile: DoctorProfile = {
      name: dbProfile.full_name || "",
      phone: dbProfile.phone || "",
      specialization: dbProfile.specialization || "General Physician",
      degree: dbProfile.degree || "",
      experience_years: dbProfile.experience_years || 1,
      city: dbProfile.city || "",
      area: dbProfile.area || "",
      fees: dbProfile.fees || 300,
      preferred_conditions: dbProfile.preferred_conditions || [],
      preferred_age_groups: dbProfile.preferred_age_groups || ["All Ages"],
      consultation_modes: dbProfile.consultation_modes || ["chat"],
      ai_settings: dbProfile.ai_settings || {
        ai_assisted_replies: true,
        auto_patient_summary: true,
        patient_data_access: "full",
      },
      onboarding_completed: dbProfile.onboarding_completed || false,
    };
    saveDoctorProfile(doctorProfile);
  }
}
