"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Activity, 
  Calendar, 
  Plus, 
  Check, 
  Trash2, 
  FileText, 
  Heart, 
  Clock, 
  User, 
  ChevronRight,
  TrendingUp
} from "lucide-react";

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  patientName: string;
  reason: string;
  status: string;
  fees: number;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: "Morning" | "Afternoon" | "Evening" | "Night";
  taken: boolean;
}

interface LabResult {
  name: string;
  value: number;
  unit: string;
  minRange: number;
  maxRange: number;
  status: "optimal" | "normal" | "low" | "high";
}

const DEFAULT_MEDICATIONS: Medication[] = [
  { id: "med-1", name: "Vitamin D3", dosage: "60K IU, 1 tablet", timing: "Morning", taken: false },
  { id: "med-2", name: "Metformin", dosage: "500mg, 1 tablet", timing: "Evening", taken: true },
  { id: "med-3", name: "Cetirizine", dosage: "10mg, 1 tablet", timing: "Night", taken: false },
];

const DEFAULT_LAB_RESULTS: LabResult[] = [
  { name: "Hemoglobin", value: 14.2, unit: "g/dL", minRange: 13.5, maxRange: 17.5, status: "optimal" },
  { name: "Vitamin D3", value: 34.5, unit: "ng/mL", minRange: 30.0, maxRange: 100.0, status: "normal" },
  { name: "Total Cholesterol", value: 185.0, unit: "mg/dL", minRange: 100.0, maxRange: 200.0, status: "optimal" },
  { name: "Vitamin B12", value: 210.0, unit: "pg/mL", minRange: 200.0, maxRange: 900.0, status: "low" },
];

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [patientName, setPatientName] = useState("Guest Patient");

  // Medication Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTiming, setNewMedTiming] = useState<"Morning" | "Afternoon" | "Evening" | "Night">("Morning");
  const [isAddingMed, setIsAddingMed] = useState(false);

  // Sync data from localStorage
  useEffect(() => {
    document.title = "Patient Dashboard — CliniHome AI";
    if (typeof window !== "undefined") {
      // 1. User Session
      const session = localStorage.getItem("clinihome-session");
      if (session) {
        try {
          const user = JSON.parse(session);
          setPatientName(user.name || "Aman Sharma");
        } catch {
          setPatientName("Guest Patient");
        }
      }

      // 2. Appointments
      const storedApts = localStorage.getItem("clinihome-appointments");
      if (storedApts) {
        try {
          const apts = JSON.parse(storedApts);
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          let changed = false;

          const updatedApts = apts.map((apt: any) => {
            if (apt.status === "confirmed") {
              if (apt.date < todayStr) {
                changed = true;
                return { ...apt, status: "completed" };
              } else if (apt.date === todayStr) {
                try {
                  const match = apt.time.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
                  if (match) {
                    let hrs = parseInt(match[1]);
                    const mins = parseInt(match[2]);
                    const pm = match[3].toUpperCase() === "PM";
                    if (pm && hrs < 12) hrs += 12;
                    if (!pm && hrs === 12) hrs = 0;
                    
                    const aptTime = new Date();
                    aptTime.setHours(hrs, mins, 0, 0);
                    aptTime.setHours(aptTime.getHours() + 1); // 1-hour buffer
                    
                    if (now > aptTime) {
                      changed = true;
                      return { ...apt, status: "completed" };
                    }
                  }
                } catch {}
              }
            }
            return apt;
          });

          if (changed) {
            localStorage.setItem("clinihome-appointments", JSON.stringify(updatedApts));
          }
          setAppointments(updatedApts);
        } catch {
          setAppointments([]);
        }
      }

      // 3. Medications
      const storedMeds = localStorage.getItem("clinihome-medications");
      if (storedMeds) {
        try {
          setMedications(JSON.parse(storedMeds));
        } catch {
          setMedications([]);
        }
      } else {
        const profileStr = localStorage.getItem("clinihome-patient-profile");
        let initialMeds = DEFAULT_MEDICATIONS;
        if (profileStr) {
          try {
            const profile = JSON.parse(profileStr);
            if (profile.medications && profile.medications.length > 0) {
              initialMeds = profile.medications.map((m: string, idx: number) => ({
                id: `med-${Date.now()}-${idx}`,
                name: m,
                dosage: "As prescribed",
                timing: ["Morning", "Afternoon", "Evening", "Night"][idx % 4] as any,
                taken: false
              }));
            }
          } catch {}
        }
        setMedications(initialMeds);
        localStorage.setItem("clinihome-medications", JSON.stringify(initialMeds));
      }

      // 4. Lab Results
      const storedLabs = localStorage.getItem("clinihome-lab-results");
      if (storedLabs) {
        try {
          setLabResults(JSON.parse(storedLabs));
        } catch {
          setLabResults(DEFAULT_LAB_RESULTS);
        }
      } else {
        setLabResults(DEFAULT_LAB_RESULTS);
        localStorage.setItem("clinihome-lab-results", JSON.stringify(DEFAULT_LAB_RESULTS));
      }
    }
  }, []);

  const handleToggleMed = (medId: string) => {
    const updated = medications.map((med) => 
      med.id === medId ? { ...med, taken: !med.taken } : med
    );
    setMedications(updated);
    localStorage.setItem("clinihome-medications", JSON.stringify(updated));
  };

  const handleAddMedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const newMed: Medication = {
      id: "med-" + Date.now(),
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      timing: newMedTiming,
      taken: false,
    };

    const updated = [...medications, newMed];
    setMedications(updated);
    localStorage.setItem("clinihome-medications", JSON.stringify(updated));

    // Clear form
    setNewMedName("");
    setNewMedDosage("");
    setNewMedTiming("Morning");
    setIsAddingMed(false);
  };

  const handleDeleteMed = (medId: string) => {
    const updated = medications.filter((m) => m.id !== medId);
    setMedications(updated);
    localStorage.setItem("clinihome-medications", JSON.stringify(updated));
  };

  const handleCancelAppointment = (aptId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      const updated = appointments.filter((apt) => apt.id !== aptId);
      setAppointments(updated);
      localStorage.setItem("clinihome-appointments", JSON.stringify(updated));
    }
  };

  // Find next upcoming appointment
  const nextAppointment = useMemo(() => {
    if (appointments.length === 0) return null;
    // Simple sort by date ascending
    const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[0];
  }, [appointments]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        
        {/* Welcome Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>
              Welcome back, <span className="serif-italic" style={{ color: "var(--purple-primary)" }}>{patientName.split(" ")[0]}</span>
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
              CliniHome AI • Personalized health status & care overview
            </p>
          </div>
          <Link href="/doctors" style={{ background: "var(--purple-primary)", color: "white", padding: "10px 22px", borderRadius: "100px", fontSize: "13px", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 12px rgba(0,113,227,0.12)" }}>
            Book Consultation
          </Link>
        </div>

        {/* 3-Card Summary Panels Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {/* Card 1: Next Visit */}
          <div className="apple-card" style={{ padding: "20px", display: "flex", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(0,113,227,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-primary)", flexShrink: 0 }}>
              <Calendar size={18} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Next Appointment</span>
              {nextAppointment ? (
                <div style={{ marginTop: "4px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{nextAppointment.doctorName}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>{nextAppointment.date} • {nextAppointment.time}</p>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>No upcoming consultations scheduled.</p>
              )}
            </div>
          </div>

          {/* Card 2: Daily Prescriptions */}
          <div className="apple-card" style={{ padding: "20px", display: "flex", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(52,199,89,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--severity-low)", flexShrink: 0 }}>
              <Activity size={18} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Daily Prescriptions</span>
              <p style={{ fontSize: "18px", fontWeight: 800, margin: "4px 0 0" }}>
                {medications.filter(m => m.taken).length} / {medications.length} taken
              </p>
            </div>
          </div>

          {/* Card 3: Health Score */}
          <div className="apple-card" style={{ padding: "20px", display: "flex", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,149,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--severity-med)", flexShrink: 0 }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Biomarker Panels</span>
              <p style={{ fontSize: "14px", fontWeight: 700, margin: "4px 0 0" }}>
                {labResults.filter(r => r.status === "optimal" || r.status === "normal").length} Labs Optimal
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                {labResults.find(r => r.status === "low" || r.status === "high") 
                  ? `${labResults.find(r => r.status === "low" || r.status === "high")?.name} requires check` 
                  : "All biomarkers optimal"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "32px" }} className="dashboard-grid">
          
          {/* Left Area: Appointments and Lab results */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Appointments Block */}
            <div className="apple-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                📅 Scheduled Visits ({appointments.length})
              </h3>

              {appointments.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", background: "var(--bg-surface)", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                    You have no active appointments booked.
                  </p>
                  <Link href="/doctors" style={{ color: "var(--purple-primary)", fontSize: "13px", fontWeight: 600, display: "inline-block", marginTop: "10px", textDecoration: "none" }}>
                    Find specialists nearby →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {appointments.map((apt) => (
                    <div key={apt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--border)", borderRadius: "12px", background: "var(--bg-surface)", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>{apt.doctorName}</h4>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>{apt.specialization} • Visit fee: ₹{apt.fees}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                          Date: <strong>{apt.date}</strong> | Time: <strong>{apt.time}</strong>
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(52,199,89,0.12)", color: "var(--severity-low)", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>
                          {apt.status}
                        </span>
                        <button 
                          onClick={() => handleCancelAppointment(apt.id)}
                          style={{ background: "none", border: "none", color: "var(--severity-high)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                          title="Cancel Appointment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lab Results Block */}
            <div className="apple-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                📊 Lab Results & Biomarkers
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {labResults.map((result) => {
                  const percentage = Math.min(100, Math.max(0, ((result.value - (result.minRange * 0.5)) / (result.maxRange * 1.2 - (result.minRange * 0.5))) * 100));
                  
                  let color = "var(--severity-low)";
                  if (result.status === "low") color = "var(--severity-med)";
                  if (result.status === "high") color = "var(--severity-high)";

                  return (
                    <div key={result.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <span style={{ fontSize: "14px", fontWeight: 700 }}>{result.name}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "8px" }}>
                            Healthy: {result.minRange} - {result.maxRange} {result.unit}
                          </span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color }}>
                          {result.value} {result.unit} ({result.status.toUpperCase()})
                        </span>
                      </div>
                      {/* Visual gauge bar */}
                      <div style={{ height: "6px", width: "100%", background: "var(--bg-surface)", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                        <div style={{ width: `${percentage}%`, height: "100%", background: color, borderRadius: "10px" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Area: Medication Tracker */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Med Tracker Panel */}
            <div className="apple-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  💊 Daily Prescriptions
                </h3>
                <button
                  onClick={() => setIsAddingMed(!isAddingMed)}
                  style={{
                    background: "none", border: "none", color: "var(--purple-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 600
                  }}
                >
                  <Plus size={16} /> Add Med
                </button>
              </div>

              {/* Add Med Form */}
              {isAddingMed && (
                <form onSubmit={handleAddMedSubmit} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }} className="animate-slide-down">
                  <input 
                    type="text" 
                    placeholder="Medication Name (e.g. Omega 3)" 
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", background: "var(--bg-card)", outline: "none", color: "var(--text-primary)" }}
                  />
                  <input 
                    type="text" 
                    placeholder="Dosage (e.g. 1000mg, 1 softgel)" 
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", background: "var(--bg-card)", outline: "none", color: "var(--text-primary)" }}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>Timing:</span>
                    <select
                      value={newMedTiming}
                      onChange={(e) => setNewMedTiming(e.target.value as any)}
                      style={{ padding: "6px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "12px", background: "var(--bg-card)", outline: "none", color: "var(--text-primary)" }}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button type="submit" style={{ background: "var(--purple-primary)", color: "white", border: "none", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Save</button>
                    <button type="button" onClick={() => setIsAddingMed(false)} style={{ background: "transparent", border: "1px solid var(--border)", padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Meds List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {medications.map((med) => (
                  <div 
                    key={med.id} 
                    style={{ 
                      display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1.5px solid var(--border)", borderRadius: "12px", 
                      background: med.taken ? "rgba(52,199,89,0.02)" : "var(--bg-surface)",
                      borderColor: med.taken ? "rgba(52,199,89,0.15)" : "var(--border)",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button
                        onClick={() => handleToggleMed(med.id)}
                        style={{
                          width: "22px", height: "22px", borderRadius: "50%", 
                          border: med.taken ? "none" : "1.5px solid var(--text-muted)",
                          background: med.taken ? "var(--severity-low)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", cursor: "pointer", transition: "all 0.15s"
                        }}
                      >
                        {med.taken && <Check size={12} />}
                      </button>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: med.taken ? "var(--text-secondary)" : "var(--text-primary)", textDecoration: med.taken ? "line-through" : "none" }}>
                          {med.name}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>
                          {med.dosage} • <strong style={{ color: "var(--purple-primary)" }}>{med.timing}</strong>
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMed(med.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", opacity: 0.6 }}
                      className="hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
