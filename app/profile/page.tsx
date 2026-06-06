"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  loadPatientProfile,
  savePatientProfile,
  loadDoctorProfile,
  saveDoctorProfile,
  COMMON_CONDITIONS,
  BLOOD_GROUPS,
  HEALTH_GOALS,
  DOCTOR_SPECIALIZATIONS,
} from "@/lib/user-profile";
import { User, Phone, Calendar, Heart, Shield, Save, ArrowLeft, Loader2, Check, Download, Upload } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Patient Profile state
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientAge, setPatientAge] = useState(25);
  const [patientGender, setPatientGender] = useState<"male" | "female" | "other">("male");
  const [patientBloodGroup, setPatientBloodGroup] = useState("O+");
  const [patientConditions, setPatientConditions] = useState<string[]>([]);
  const [patientMedications, setPatientMedications] = useState<string[]>([]);
  const [patientGoals, setPatientGoals] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  // Doctor Profile state
  const [doctorName, setDoctorName] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorSpec, setDoctorSpec] = useState("General Physician");
  const [doctorDegree, setDoctorDegree] = useState("");
  const [doctorExp, setDoctorExp] = useState(5);
  const [doctorCity, setDoctorCity] = useState("");
  const [doctorArea, setDoctorArea] = useState("");
  const [doctorFees, setDoctorFees] = useState(300);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    document.title = "Edit Profile & Settings — CliniHome AI";
    const session = localStorage.getItem("clinihome-session");
    if (!session) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(session);
    setCurrentUser(parsed);

    if (parsed.role === "patient") {
      const p = loadPatientProfile();
      setPatientName(p.name || parsed.name || "");
      setPatientPhone(p.phone || "");
      setPatientAge(p.age || 25);
      setPatientGender(p.gender || "male");
      setPatientBloodGroup(p.blood_group || "O+");
      setPatientConditions(p.conditions || []);
      setPatientMedications(p.medications || []);
      setPatientGoals(p.health_goals || []);
    } else {
      const d = loadDoctorProfile();
      setDoctorName(d.name || parsed.name || "");
      setDoctorPhone(d.phone || "");
      setDoctorSpec(d.specialization || "General Physician");
      setDoctorDegree(d.degree || "");
      setDoctorExp(d.experience_years || 5);
      setDoctorCity(d.city || "");
      setDoctorArea(d.area || "");
      setDoctorFees(d.fees || 300);
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const isPatient = currentUser?.role === "patient";

    try {
      if (isPatient) {
        const updatedPatient = {
          name: patientName.trim(),
          phone: patientPhone.trim(),
          age: Number(patientAge) || 25,
          gender: patientGender,
          blood_group: patientBloodGroup,
          conditions: patientConditions,
          medications: patientMedications,
          allergies: [],
          uploaded_reports: loadPatientProfile().uploaded_reports || [],
          health_goals: patientGoals,
          language_preference: loadPatientProfile().language_preference || "hinglish",
          onboarding_completed: true,
        };

        // 1. Save locally
        savePatientProfile(updatedPatient);

        // 2. Sync to session
        const session = localStorage.getItem("clinihome-session");
        if (session) {
          const parsed = JSON.parse(session);
          parsed.name = updatedPatient.name;
          localStorage.setItem("clinihome-session", JSON.stringify(parsed));
          window.dispatchEvent(new Event("local-session-change"));
        }

        // 3. Sync to Supabase if logged in
        if (supabase && currentUser?.id && !currentUser.isSandbox) {
          const { error: dbErr } = await supabase
            .from("profiles")
            .update({
              full_name: updatedPatient.name,
              phone: updatedPatient.phone,
              age: updatedPatient.age,
              gender: updatedPatient.gender,
              blood_group: updatedPatient.blood_group,
              conditions: updatedPatient.conditions,
              medications: updatedPatient.medications,
              health_goals: updatedPatient.health_goals,
            })
            .eq("id", currentUser.id);

          if (dbErr) throw dbErr;
        }
      } else {
        const updatedDoctor = {
          name: doctorName.trim(),
          phone: doctorPhone.trim(),
          specialization: doctorSpec,
          degree: doctorDegree.trim(),
          experience_years: Number(doctorExp) || 5,
          city: doctorCity.trim(),
          area: doctorArea.trim(),
          fees: Number(doctorFees) || 300,
          preferred_conditions: loadDoctorProfile().preferred_conditions || [],
          preferred_age_groups: loadDoctorProfile().preferred_age_groups || ["All Ages"],
          consultation_modes: loadDoctorProfile().consultation_modes || ["chat"],
          ai_settings: loadDoctorProfile().ai_settings || {
            ai_assisted_replies: true,
            auto_patient_summary: true,
            patient_data_access: "full",
          },
          onboarding_completed: true,
        };

        // 1. Save locally
        saveDoctorProfile(updatedDoctor);

        // Update directories list
        try {
          const stored = localStorage.getItem("clinihome-doctors-list");
          if (stored) {
            const list = JSON.parse(stored);
            const index = list.findIndex((d: any) => d.id === currentUser.id || d.email === currentUser.email);
            if (index !== -1) {
              list[index] = {
                ...list[index],
                name: updatedDoctor.name,
                specialization: updatedDoctor.specialization,
                degree: updatedDoctor.degree,
                fees: updatedDoctor.fees,
                city: updatedDoctor.city,
                area: updatedDoctor.area,
                phone: updatedDoctor.phone,
              };
              localStorage.setItem("clinihome-doctors-list", JSON.stringify(list));
            }
          }
        } catch {}

        // 2. Sync to session
        const session = localStorage.getItem("clinihome-session");
        if (session) {
          const parsed = JSON.parse(session);
          parsed.name = updatedDoctor.name;
          localStorage.setItem("clinihome-session", JSON.stringify(parsed));
          window.dispatchEvent(new Event("local-session-change"));
        }

        // 3. Sync to Supabase
        if (supabase && currentUser?.id && !currentUser.isSandbox) {
          const { error: dbErr } = await supabase
            .from("profiles")
            .update({
              full_name: updatedDoctor.name,
              phone: updatedDoctor.phone,
              specialization: updatedDoctor.specialization,
              degree: updatedDoctor.degree,
              experience_years: updatedDoctor.experience_years,
              city: updatedDoctor.city,
              area: updatedDoctor.area,
              fees: updatedDoctor.fees,
            })
            .eq("id", currentUser.id);

          if (dbErr) throw dbErr;
        }
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save changes. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCondition = (cond: string) => {
    setPatientConditions(prev =>
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const toggleGoal = (goal: string) => {
    setPatientGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const addCustomCondition = () => {
    if (newCondition.trim() && !patientConditions.includes(newCondition.trim())) {
      setPatientConditions(prev => [...prev, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const addCustomMedication = () => {
    if (newMedication.trim() && !patientMedications.includes(newMedication.trim())) {
      setPatientMedications(prev => [...prev, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (med: string) => {
    setPatientMedications(prev => prev.filter(m => m !== med));
  };

  const handleExportData = () => {
    try {
      const backupData: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("clinihome-")) {
          const val = localStorage.getItem(key);
          if (val !== null) {
            backupData[key] = val;
          }
        }
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `clinihome-backup-${currentUser?.email || "user"}-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e: any) {
      alert("Failed to export backup data: " + e.message);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Invalid backup file structure.");
        }
        
        let importCount = 0;
        Object.keys(parsed).forEach((key) => {
          if (key.startsWith("clinihome-")) {
            localStorage.setItem(key, parsed[key]);
            importCount++;
          }
        });

        setImportStatus(`Successfully restored ${importCount} keys. Reloading page...`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        alert("Failed to import data: " + err.message);
      }
    };

    fileReader.readAsText(files[0]);
  };

  if (!currentUser) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Back Link */}
        <Link
          href={currentUser.role === "doctor" ? "/doctor-dashboard" : "/dashboard"}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, marginBottom: "28px" }}
          className="hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* Profile Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", boxShadow: "var(--shadow-card)" }}>
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "24px", marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              👤 Edit Profile & Settings
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Configure your credentials, personal info and metrics.
            </p>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {currentUser.role === "patient" ? (
              // Patient Profile Form
              <>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                  <User size={18} style={{ color: "var(--purple-primary)" }} /> Personal Information
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Full Name</label>
                    <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Phone Number</label>
                    <input type="text" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="form-grid-3">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Age</label>
                    <input type="number" value={patientAge} onChange={e => setPatientAge(parseInt(e.target.value) || 25)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Gender</label>
                    <select value={patientGender} onChange={e => setPatientGender(e.target.value as any)} style={inputStyle}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Blood Group</label>
                    <select value={patientBloodGroup} onChange={e => setPatientBloodGroup(e.target.value)} style={inputStyle}>
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                    <Heart size={18} style={{ color: "var(--purple-primary)" }} /> Medical Conditions
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                    {COMMON_CONDITIONS.filter(c => c !== "None of the above").map(cond => {
                      const isSelected = patientConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            background: isSelected ? "var(--purple-primary)" : "var(--bg-surface)",
                            color: isSelected ? "white" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--purple-primary)" : "1px solid var(--border)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" placeholder="Custom condition (e.g. Migraine)" value={newCondition} onChange={e => setNewCondition(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={addCustomCondition} style={buttonSecondaryStyle}>Add</button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                    <Heart size={18} style={{ color: "var(--purple-primary)" }} /> Current Medications
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                    {patientMedications.map(med => (
                      <span
                        key={med}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "100px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "rgba(124,58,237,0.08)",
                          color: "var(--purple-primary)",
                          border: "1px solid rgba(124,58,237,0.15)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {med}
                        <button type="button" onClick={() => removeMedication(med)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple-primary)", fontWeight: 700 }}>×</button>
                      </span>
                    ))}
                    {patientMedications.length === 0 && (
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0 }}>No medications listed.</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" placeholder="Add medication name and dosage (e.g. Paracetamol 500mg)" value={newMedication} onChange={e => setNewMedication(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={addCustomMedication} style={buttonSecondaryStyle}>Add</button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                    <Shield size={18} style={{ color: "var(--purple-primary)" }} /> Health Goals
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {HEALTH_GOALS.map(goal => {
                      const isSelected = patientGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleGoal(goal)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "100px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            background: isSelected ? "var(--purple-primary)" : "var(--bg-surface)",
                            color: isSelected ? "white" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--purple-primary)" : "1px solid var(--border)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              // Doctor Profile Form
              <>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
                  <User size={18} style={{ color: "var(--purple-primary)" }} /> Credentials & Consult Details
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Full Name</label>
                    <input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Contact Number</label>
                    <input type="text" value={doctorPhone} onChange={e => setDoctorPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="form-grid">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Specialization</label>
                    <select value={doctorSpec} onChange={e => setDoctorSpec(e.target.value)} style={inputStyle}>
                      {DOCTOR_SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Degree & Certifications</label>
                    <input type="text" value={doctorDegree} onChange={e => setDoctorDegree(e.target.value)} required placeholder="E.g. MBBS, MD" style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="form-grid-3">
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Years Experience</label>
                    <input type="number" value={doctorExp} onChange={e => setDoctorExp(parseInt(e.target.value) || 0)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>City</label>
                    <input type="text" value={doctorCity} onChange={e => setDoctorCity(e.target.value)} required placeholder="Delhi" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Area/Locality</label>
                    <input type="text" value={doctorArea} onChange={e => setDoctorArea(e.target.value)} required placeholder="Lajpat Nagar" style={inputStyle} />
                  </div>
                </div>

                <div style={{ maxWidth: "50%" }}>
                  <label style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Clinic Consultation Fee (INR)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", fontWeight: 600, color: "var(--text-muted)" }}>₹</span>
                    <input type="number" value={doctorFees} onChange={e => setDoctorFees(parseInt(e.target.value) || 0)} style={{ ...inputStyle, paddingLeft: "26px" }} />
                  </div>
                </div>
              </>
            )}

            {error && (
              <p style={{ color: "var(--severity-high)", fontSize: "13px", fontWeight: 600, margin: 0 }}>
                ⚠️ {error}
              </p>
            )}

            {/* Action buttons */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: success ? "var(--severity-low)" : "var(--purple-primary)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "100px",
                  fontWeight: 600,
                  fontSize: "14px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : success ? <Check size={16} /> : <Save size={16} />}
                {loading ? "Saving..." : success ? "Saved Successfully!" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Backup & Restore Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", boxShadow: "var(--shadow-card)", marginTop: "24px" }} className="animate-fade-in-up">
          <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
              📦 Data Backup & Recovery
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
              Export your local medical history, profile parameters, reminders, and chat logs to a local backup file, or restore them from a previous backup.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                Export Backup
              </p>
              <button
                type="button"
                onClick={handleExportData}
                style={{
                  background: "var(--purple-primary)",
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  fontWeight: 600,
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
                }}
              >
                <Download size={15} /> Export Settings & Logs
              </button>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                Restore Backup
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                  }}
                />
              </div>
              {importStatus && (
                <p style={{ color: "var(--severity-low)", fontSize: "12px", fontWeight: 600, marginTop: "8px" }}>
                  ✓ {importStatus}
                </p>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                🔒 Local Storage Data Privacy Notice
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.45 }}>
                CliniHome AI stores your health metrics, consultation history, and prescriptions locally in your browser's <code>localStorage</code> for fast access and offline sandbox capability. If you are using a shared or public computer, please remember to **sign out** or use **Privacy & Data Erasure** below to erase your health records from this browser.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                Privacy & Data Erasure (GDPR / DPDPA)
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.45 }}>
                Under GDPR and DPDPA regulations, you have the right to erase all your personal health data. Wiping your records deletes your patient metrics, upload logs, reminders, local appointments, and sandbox chats.
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Are you sure you want to permanently delete all your health records, logs, and account session? This action is irreversible.")) {
                    let deleteCount = 0;
                    const keysToDelete: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith("clinihome-")) {
                        keysToDelete.push(key);
                      }
                    }
                    keysToDelete.forEach(k => {
                      localStorage.removeItem(k);
                      deleteCount++;
                    });

                    if (supabase && currentUser?.id && !currentUser.isSandbox) {
                      try {
                        await supabase.auth.signOut();
                      } catch (err) {}
                    }

                    alert(`Privacy request processed. Erased ${deleteCount} local data records and signed out.`);
                    router.push("/login");
                  }
                }}
                style={{
                  background: "none",
                  border: "1px solid var(--severity-high)",
                  color: "var(--severity-high)",
                  padding: "10px 20px",
                  borderRadius: "100px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Permanently Delete My Data & Account
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .form-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  background: "var(--bg-surface)",
  fontSize: "13px",
  outline: "none",
  color: "var(--text-primary)",
  transition: "border 0.15s ease",
};

const buttonSecondaryStyle: React.CSSProperties = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "10px 20px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  color: "var(--text-primary)",
};
