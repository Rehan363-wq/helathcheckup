"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Heart, Pill, FileUp, Target, ArrowRight, ArrowLeft,
  Check, Stethoscope, Building, Brain, ChevronRight, Sparkles,
  Shield, X
} from "lucide-react";
import {
  type PatientProfile, type DoctorProfile, type UploadedReport,
  getDefaultPatientProfile, getDefaultDoctorProfile,
  savePatientProfile, saveDoctorProfile,
  COMMON_CONDITIONS, BLOOD_GROUPS, HEALTH_GOALS,
  DOCTOR_SPECIALIZATIONS, DOCTOR_PREFERRED_CONDITIONS, AGE_GROUPS,
} from "@/lib/user-profile";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [step, setStep] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Patient state
  const [patient, setPatient] = useState<PatientProfile>(getDefaultPatientProfile());
  const [medInput, setMedInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");

  // Doctor state
  const [doctor, setDoctor] = useState<DoctorProfile>(getDefaultDoctorProfile());

  const totalSteps = role === "patient" ? 5 : 3;

  // Initialize client safely
  let supabase: any = null;
  try {
    supabase = createClient();
  } catch (e) {
    console.warn("Supabase client not initialized:", e);
  }

  useEffect(() => {
    document.title = "Patient Onboarding — CliniHome AI";
    const session = localStorage.getItem("clinihome-session");
    if (session) {
      const parsed = JSON.parse(session);
      setRole(parsed.role || "patient");
      if (parsed.name) {
        if (parsed.role === "doctor") {
          setDoctor(prev => ({ ...prev, name: parsed.name, specialization: parsed.specialization || "General Physician", degree: parsed.degree || "", fees: parsed.fees || 300 }));
        } else {
          setPatient(prev => ({ ...prev, name: parsed.name }));
        }
      }
    }

    const loadDbProfile = async () => {
      if (!supabase) return;
      try {
        const { data: { session: dbSession } } = await supabase.auth.getSession();
        if (dbSession?.user) {
          const userId = dbSession.user.id;
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (profile) {
            setRole(profile.role as "patient" | "doctor");
            if (profile.role === "doctor") {
              setDoctor({
                name: profile.full_name || "",
                phone: profile.phone || "",
                specialization: profile.specialization || "General Physician",
                degree: profile.degree || "",
                experience_years: profile.experience_years || 1,
                city: profile.city || "",
                area: profile.area || "",
                fees: profile.fees || 300,
                preferred_conditions: profile.preferred_conditions || [],
                preferred_age_groups: profile.preferred_age_groups || ["All Ages"],
                consultation_modes: ["chat"],
                ai_settings: profile.ai_settings || {
                  ai_assisted_replies: true,
                  auto_patient_summary: true,
                  patient_data_access: "full",
                },
                onboarding_completed: profile.onboarding_completed || false,
              });
            } else {
              // Fetch reports
              let reports = [];
              const { data: reportsData } = await supabase
                .from("uploaded_reports")
                .select("*")
                .eq("user_id", userId);
              if (reportsData) {
                reports = reportsData.map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  type: r.report_type || "lab_report",
                  upload_date: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                  file_type: r.file_type || "application/pdf",
                  summary: r.summary || "",
                }));
              }

              setPatient({
                name: profile.full_name || "",
                phone: profile.phone || "",
                age: profile.age || 25,
                gender: (profile.gender as "male" | "female" | "other") || "male",
                blood_group: profile.blood_group || "Don't Know",
                conditions: profile.conditions || [],
                medications: profile.medications || [],
                allergies: profile.allergies || [],
                uploaded_reports: reports,
                health_goals: profile.health_goals || [],
                language_preference: (profile.language_preference as "hinglish" | "hindi" | "english") || "hinglish",
                onboarding_completed: profile.onboarding_completed || false,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load profile from database, using local session:", err);
      }
    };

    loadDbProfile();
  }, []);

  const goNext = () => {
    setError(null);
    if (step === 1) {
      if (role === "patient") {
        if (!patient.name.trim()) {
          setError("Name is required.");
          return;
        }
        if (!patient.phone.trim()) {
          setError("Phone number is required.");
          return;
        }
        if (!patient.age || patient.age <= 0) {
          setError("Please enter a valid age.");
          return;
        }
      } else {
        if (!doctor.name.trim()) {
          setError("Doctor's name is required.");
          return;
        }
        if (!doctor.phone.trim()) {
          setError("Phone number is required.");
          return;
        }
        if (!doctor.degree.trim()) {
          setError("Medical degree (e.g. MBBS) is required.");
          return;
        }
        if (!doctor.city.trim()) {
          setError("City is required.");
          return;
        }
        if (!doctor.area.trim()) {
          setError("Clinic area is required.");
          return;
        }
      }
    }

    if (step >= totalSteps) return handleComplete();
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 200);
  };

  const goBack = () => {
    if (step <= 1) return;
    setError(null);
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 200);
  };

  const handleComplete = async () => {
    // 1. Update session in localStorage first so credentials are ready
    const sessionStr = localStorage.getItem("clinihome-session");
    let userId = "";
    let userEmail = "";
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      parsed.onboarding_completed = true;
      parsed.name = role === "patient" ? patient.name : doctor.name;
      localStorage.setItem("clinihome-session", JSON.stringify(parsed));
      userId = parsed.id || "";
      userEmail = parsed.email || "";
    }

    // 2. Mark onboarding completed in local profiles
    const finalPatient = { ...patient, onboarding_completed: true };
    const finalDoctor = { ...doctor, onboarding_completed: true };

    if (role === "patient") {
      savePatientProfile(finalPatient);
    } else {
      saveDoctorProfile(finalDoctor);
      try {
        const storedDocs = localStorage.getItem("clinihome-doctors-list");
        const docs = storedDocs ? JSON.parse(storedDocs) : [];
        const email = userEmail || `doc-${Date.now()}@clinihome.ai`;
        const id = userId || `doc-${Date.now()}`;
        
        if (!docs.some((d: any) => d.id === id || d.email === email)) {
          docs.push({
            id: id,
            email: email,
            name: finalDoctor.name,
            specialization: finalDoctor.specialization,
            degree: finalDoctor.degree,
            fees: finalDoctor.fees,
            city: finalDoctor.city,
            area: finalDoctor.area,
            rating: 4.5,
            distance: 1.5,
            phone: finalDoctor.phone,
            is_approved: false,
          });
          localStorage.setItem("clinihome-doctors-list", JSON.stringify(docs));
        }
      } catch (e) {
        console.warn("Failed to sync new doctor to directory list:", e);
      }
    }

    // 3. Sync to Supabase
    if (supabase && userId) {
      try {
        if (role === "patient") {
          // Update patient profile details in public.profiles table
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              full_name: finalPatient.name,
              phone: finalPatient.phone,
              age: finalPatient.age,
              gender: finalPatient.gender,
              blood_group: finalPatient.blood_group,
              conditions: finalPatient.conditions,
              medications: finalPatient.medications,
              allergies: finalPatient.allergies,
              health_goals: finalPatient.health_goals,
              language_preference: finalPatient.language_preference,
              onboarding_completed: true,
            })
            .eq("id", userId);

          if (profileErr) throw profileErr;

          // Insert uploaded reports metadata
          if (finalPatient.uploaded_reports.length > 0) {
            // First, delete old reports for this user to avoid duplication if running again
            await supabase
              .from("uploaded_reports")
              .delete()
              .eq("user_id", userId);

            const reportsToInsert = finalPatient.uploaded_reports.map(r => ({
              user_id: userId,
              name: r.name,
              report_type: r.type,
              summary: r.summary || "",
              file_type: r.file_type || "application/pdf",
              file_url: "", // local mock file
            }));

            const { error: reportsErr } = await supabase
              .from("uploaded_reports")
              .insert(reportsToInsert);
            if (reportsErr) throw reportsErr;
          }
        } else {
          // Update doctor profile details in public.profiles table
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              full_name: finalDoctor.name,
              phone: finalDoctor.phone,
              specialization: finalDoctor.specialization,
              degree: finalDoctor.degree,
              experience_years: finalDoctor.experience_years,
              city: finalDoctor.city,
              area: finalDoctor.area,
              fees: finalDoctor.fees,
              preferred_conditions: finalDoctor.preferred_conditions,
              preferred_age_groups: finalDoctor.preferred_age_groups,
              ai_settings: finalDoctor.ai_settings,
              onboarding_completed: true,
            })
            .eq("id", userId);

          if (profileErr) throw profileErr;
        }
      } catch (dbErr) {
        console.warn("Failed to sync onboarding details to Supabase database:", dbErr);
      }
    }

    router.push(role === "doctor" ? "/doctor-dashboard" : "/");
  };

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  };

  const addTag = (value: string, field: "medications" | "allergies") => {
    if (!value.trim()) return;
    if (field === "medications") {
      setPatient(prev => ({ ...prev, medications: [...prev.medications, value.trim()] }));
      setMedInput("");
    } else {
      setPatient(prev => ({ ...prev, allergies: [...prev.allergies, value.trim()] }));
      setAllergyInput("");
    }
  };

  const removeTag = (index: number, field: "medications" | "allergies") => {
    if (field === "medications") {
      setPatient(prev => ({ ...prev, medications: prev.medications.filter((_, i) => i !== index) }));
    } else {
      setPatient(prev => ({ ...prev, allergies: prev.allergies.filter((_, i) => i !== index) }));
    }
  };

  // --- Styles ---
  const cardStyle: React.CSSProperties = {
    background: "var(--bg-card)", borderRadius: "24px", border: "1px solid var(--border)",
    padding: "36px", boxShadow: "var(--shadow-card)", width: "100%", maxWidth: "640px",
  };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 18px", borderRadius: "100px", border: `1.5px solid ${active ? "#3B82F6" : "var(--border)"}`,
    background: active ? "rgba(59,130,246,0.08)" : "var(--bg-card)", color: active ? "#3B82F6" : "var(--text-secondary)",
    fontWeight: active ? 700 : 500, fontSize: "13px", cursor: "pointer", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
    fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: "6px",
  });
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)",
    background: "var(--bg-card)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "14px", outline: "none",
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-surface)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" }}>

      {/* Progress Bar */}
      <div style={{ width: "100%", maxWidth: "640px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <Sparkles size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {role === "patient" ? "Patient" : "Doctor"} Onboarding
          </span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Step {step} of {totalSteps}
          </span>
        </div>
        <div style={{ height: "6px", borderRadius: "3px", background: "var(--border)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(step / totalSteps) * 100}%`, borderRadius: "3px",
            background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
            transition: "width 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
      </div>

      {/* Step Content */}
      <div style={{ ...cardStyle, opacity: animating ? 0 : 1, transform: animating ? "translateY(12px)" : "none", transition: "all 0.25s ease" }}>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              padding: "12px 16px",
              borderRadius: "10px",
              color: "var(--severity-high)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <Shield size={16} />
            {error}
          </div>
        )}

        {/* ===== PATIENT STEPS ===== */}
        {role === "patient" && step === 1 && (
          <div>
            {/* Welcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1.5px solid rgba(59,130,246,0.15)",
                borderRadius: "16px",
                padding: "18px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div style={{ fontSize: "28px" }}>👋</div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Welcome to CliniHome AI!
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Please enter your details so the AI can understand your health reports and questions accurately.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <User size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Basic Information</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Tell us a bit about yourself</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Full Name</label>
                <input value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Phone Number</label>
                <input value={patient.phone} onChange={e => setPatient({ ...patient, phone: e.target.value })} placeholder="Your mobile number (e.g. +91 9876543210)" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Age</label>
                  <input type="number" value={patient.age} onChange={e => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Gender</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["male", "female", "other"] as const).map(g => (
                      <button key={g} onClick={() => setPatient({ ...patient, gender: g })} style={chipStyle(patient.gender === g)}>
                        {g === "male" ? "👨" : g === "female" ? "👩" : "🧑"} {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Blood Group</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {BLOOD_GROUPS.map(bg => (
                    <button key={bg} onClick={() => setPatient({ ...patient, blood_group: bg })} style={chipStyle(patient.blood_group === bg)}>
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {role === "patient" && step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
                <Heart size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Health Conditions</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Do you have any existing health conditions?</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COMMON_CONDITIONS.map(condition => (
                <button key={condition} onClick={() => {
                  if (condition === "None of the above") {
                    setPatient({ ...patient, conditions: ["None"] });
                  } else {
                    setPatient({ ...patient, conditions: toggleArrayItem(patient.conditions.filter(c => c !== "None"), condition) });
                  }
                }} style={chipStyle(patient.conditions.includes(condition) || (condition === "None of the above" && patient.conditions.includes("None")))}>
                  {patient.conditions.includes(condition) && <Check size={14} />}
                  {condition}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === "patient" && step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(16,185,129,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
                <Pill size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Medications & Allergies</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Are you currently taking any medications or have allergies?</p>
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Current Medications</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={medInput} onChange={e => setMedInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(medInput, "medications"))} placeholder="E.g., Metformin 500mg" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addTag(medInput, "medications")} style={{ padding: "12px 20px", borderRadius: "12px", border: "none", background: "#3B82F6", color: "white", fontWeight: 700, cursor: "pointer" }}>Add</button>
              </div>
              {patient.medications.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                  {patient.medications.map((med, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontSize: "12px", fontWeight: 600 }}>
                      💊 {med}
                      <button onClick={() => removeTag(i, "medications")} style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", padding: 0 }}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Known Allergies</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(allergyInput, "allergies"))} placeholder="E.g., Penicillin, Dust" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => addTag(allergyInput, "allergies")} style={{ padding: "12px 20px", borderRadius: "12px", border: "none", background: "#EF4444", color: "white", fontWeight: 700, cursor: "pointer" }}>Add</button>
              </div>
              {patient.allergies.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                  {patient.allergies.map((a, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: "12px", fontWeight: 600 }}>
                      ⚠️ {a}
                      <button onClick={() => removeTag(i, "allergies")} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 0 }}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {role === "patient" && step === 4 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
                <FileUp size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Upload Reports</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Upload your medical reports or prescriptions</p>
              </div>
            </div>

            {/* Upload Zone */}
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px",
              padding: "48px 32px", borderRadius: "16px", border: "2px dashed var(--border)", cursor: "pointer",
              background: "rgba(139,92,246,0.02)", transition: "all 0.2s",
            }}>
              <FileUp size={32} style={{ color: "#8B5CF6" }} />
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Click to upload or drag & drop</p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>Lab reports, prescriptions, scan images (PNG, JPG, PDF)</p>
              <input type="file" accept="image/*,.pdf" multiple style={{ display: "none" }} onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;

                const processFile = async (file: File) => {
                  const id = Date.now().toString() + Math.random().toString(36).slice(2);
                  const isPrescription = file.name.toLowerCase().includes("prescription");
                  const type = isPrescription ? "prescription" : "lab_report";

                  const initialReport: UploadedReport = {
                    id,
                    name: file.name,
                    type,
                    upload_date: new Date().toISOString().split("T")[0],
                    file_type: file.type,
                    summary: "Processing report with AI...",
                  };

                  setPatient(prev => ({ ...prev, uploaded_reports: [...prev.uploaded_reports, initialReport] }));

                  if (file.type.startsWith("image/")) {
                    try {
                      const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          resolve(result.split(",")[1]);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });

                      const sessionStr = localStorage.getItem("clinihome-session");
                      const sessionObj = sessionStr ? JSON.parse(sessionStr) : null;
                      const token = sessionObj?.email || "sandbox";

                      const response = await fetch("/api/analyze/report", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          imageBase64: base64,
                          mimeType: file.type,
                          isImage: true,
                        }),
                      });

                      const data = await response.json();
                      const summary = data.summary || `Analysis complete: ${file.name}`;

                      setPatient(prev => ({
                        ...prev,
                        uploaded_reports: prev.uploaded_reports.map(r =>
                          r.id === id ? { ...r, summary } : r
                        ),
                      }));
                    } catch (err) {
                      console.error("AI report parsing error during onboarding:", err);
                      setPatient(prev => ({
                        ...prev,
                        uploaded_reports: prev.uploaded_reports.map(r =>
                          r.id === id ? { ...r, summary: `Uploaded: ${file.name} (Analysis offline)` } : r
                        ),
                      }));
                    }
                  } else {
                    setPatient(prev => ({
                      ...prev,
                      uploaded_reports: prev.uploaded_reports.map(r =>
                        r.id === id ? { ...r, summary: `Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)` } : r
                      ),
                    }));
                  }
                };

                for (const file of Array.from(files)) {
                  await processFile(file);
                }
              }} />
            </label>

            {/* Uploaded Files List */}
            {patient.uploaded_reports.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {patient.uploaded_reports.map((report, i) => (
                  <div key={report.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "16px" }}>📄</span>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{report.name}</p>
                        <p style={{ margin: 0, fontSize: "10px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{report.type.replace("_", " ")} • {report.upload_date}</p>
                      </div>
                    </div>
                    <button onClick={() => setPatient(prev => ({ ...prev, uploaded_reports: prev.uploaded_reports.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
              🔒 Your data is secure and used strictly for personalized AI analysis. You can also skip this step.
            </p>
          </div>
        )}

        {role === "patient" && step === 5 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(245,158,11,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                <Target size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Health Goals</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>What would you like to achieve?</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {HEALTH_GOALS.map(goal => (
                <button key={goal} onClick={() => setPatient({ ...patient, health_goals: toggleArrayItem(patient.health_goals, goal) })} style={chipStyle(patient.health_goals.includes(goal))}>
                  {patient.health_goals.includes(goal) && <Check size={14} />}
                  {goal}
                </button>
              ))}
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Preferred Language</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["hinglish", "hindi", "english"] as const).map(lang => (
                  <button key={lang} onClick={() => setPatient({ ...patient, language_preference: lang })} style={chipStyle(patient.language_preference === lang)}>
                    {lang === "hinglish" ? "🇮🇳 Hinglish" : lang === "hindi" ? "🇮🇳 Hindi" : "🇺🇸 English"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== DOCTOR STEPS ===== */}
        {role === "doctor" && step === 1 && (
          <div>
            {/* Welcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1.5px solid rgba(236,72,153,0.15)",
                borderRadius: "16px",
                padding: "18px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div style={{ fontSize: "28px" }}>🩺</div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Setup Your Practice Profile
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  Configure your specialty and consultation fee to start receiving patient requests with AI summaries.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(59,130,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                <Stethoscope size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Practice Details</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>Tell us about your medical practice</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Full Name</label>
                  <input value={doctor.name} onChange={e => setDoctor({ ...doctor, name: e.target.value })} placeholder="Dr. Your Name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Phone Number</label>
                  <input value={doctor.phone} onChange={e => setDoctor({ ...doctor, phone: e.target.value })} placeholder="E.g. +91 9876543210" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Specialization</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {DOCTOR_SPECIALIZATIONS.map(spec => (
                    <button key={spec} onClick={() => setDoctor({ ...doctor, specialization: spec })} style={chipStyle(doctor.specialization === spec)}>
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Degree</label>
                  <input value={doctor.degree} onChange={e => setDoctor({ ...doctor, degree: e.target.value })} placeholder="MBBS, MD" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Experience (years)</label>
                  <input type="number" value={doctor.experience_years} onChange={e => setDoctor({ ...doctor, experience_years: parseInt(e.target.value) || 0 })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>City</label>
                  <input value={doctor.city} onChange={e => setDoctor({ ...doctor, city: e.target.value })} placeholder="Delhi" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Area</label>
                  <input value={doctor.area} onChange={e => setDoctor({ ...doctor, area: e.target.value })} placeholder="Lajpat Nagar" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Fees (₹)</label>
                  <input type="number" value={doctor.fees} onChange={e => setDoctor({ ...doctor, fees: parseInt(e.target.value) || 0 })} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        )}

        {role === "doctor" && step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(236,72,153,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EC4899" }}>
                <Heart size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>Patient Preferences</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>What patients do you prefer to see?</p>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Preferred Conditions to Treat</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {DOCTOR_PREFERRED_CONDITIONS.map(cond => (
                  <button key={cond} onClick={() => setDoctor({ ...doctor, preferred_conditions: toggleArrayItem(doctor.preferred_conditions, cond) })} style={chipStyle(doctor.preferred_conditions.includes(cond))}>
                    {doctor.preferred_conditions.includes(cond) && <Check size={14} />}
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Preferred Age Groups</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {AGE_GROUPS.map(ag => (
                  <button key={ag} onClick={() => setDoctor({ ...doctor, preferred_age_groups: toggleArrayItem(doctor.preferred_age_groups, ag) })} style={chipStyle(doctor.preferred_age_groups.includes(ag))}>
                    {doctor.preferred_age_groups.includes(ag) && <Check size={14} />}
                    {ag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {role === "doctor" && step === 3 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6" }}>
                <Brain size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}>AI Assistant Settings</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>How would you like to use the AI Assistant?</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Toggle: AI-Assisted Replies */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>🤖 AI-Assisted Replies</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>AI will analyze patient symptoms and suggest clinical replies</p>
                </div>
                <button onClick={() => setDoctor({ ...doctor, ai_settings: { ...doctor.ai_settings, ai_assisted_replies: !doctor.ai_settings.ai_assisted_replies } })} style={{
                  width: "48px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
                  background: doctor.ai_settings.ai_assisted_replies ? "#3B82F6" : "var(--border)",
                  position: "relative", transition: "all 0.3s ease",
                }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%", background: "white",
                    position: "absolute", top: "3px", left: doctor.ai_settings.ai_assisted_replies ? "23px" : "3px",
                    transition: "left 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }} />
                </button>
              </div>

              {/* Toggle: Auto Patient Summary */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>📋 Auto Patient Summary</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>Generates a patient overview prior to starting consultations</p>
                </div>
                <button onClick={() => setDoctor({ ...doctor, ai_settings: { ...doctor.ai_settings, auto_patient_summary: !doctor.ai_settings.auto_patient_summary } })} style={{
                  width: "48px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
                  background: doctor.ai_settings.auto_patient_summary ? "#3B82F6" : "var(--border)",
                  position: "relative", transition: "all 0.3s ease",
                }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%", background: "white",
                    position: "absolute", top: "3px", left: doctor.ai_settings.auto_patient_summary ? "23px" : "3px",
                    transition: "left 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }} />
                </button>
              </div>

              {/* Patient Data Access */}
              <div style={{ padding: "16px 20px", borderRadius: "14px", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
                <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>🔐 Patient Data Access Level</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {(["full", "summary_only", "none"] as const).map(level => (
                    <button key={level} onClick={() => setDoctor({ ...doctor, ai_settings: { ...doctor.ai_settings, patient_data_access: level } })} style={chipStyle(doctor.ai_settings.patient_data_access === level)}>
                      {level === "full" ? "🔓 Full" : level === "summary_only" ? "📝 Summary" : "🚫 None"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Navigation Buttons ===== */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px", gap: "12px" }}>
          {step > 1 ? (
            <button onClick={goBack} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "12px 24px", borderRadius: "12px",
              border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)",
              fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
            }}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            {step < totalSteps && step > 1 && (
              <button onClick={goNext} style={{
                padding: "12px 20px", borderRadius: "12px", border: "1px solid var(--border)",
                background: "var(--bg-card)", color: "var(--text-secondary)",
                fontWeight: 500, fontSize: "13px", cursor: "pointer",
              }}>
                Skip
              </button>
            )}
            <button onClick={goNext} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "12px 28px", borderRadius: "12px",
              border: "none", background: step >= totalSteps ? "linear-gradient(135deg, #10B981, #059669)" : "#3B82F6",
              color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer",
              boxShadow: `0 6px 20px ${step >= totalSteps ? "rgba(16,185,129,0.25)" : "rgba(59,130,246,0.25)"}`,
              transition: "all 0.3s ease",
            }}>
              {step >= totalSteps ? (
                <><Check size={16} /> Complete Setup</>
              ) : (
                <>Continue <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "24px", fontSize: "11px", color: "var(--text-muted)" }}>
        <Shield size={12} />
        <span>Your data is fully encrypted and used solely for AI personalization.</span>
      </div>
    </div>
  );
}
