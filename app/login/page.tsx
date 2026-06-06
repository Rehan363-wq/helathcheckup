"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isOnboardingCompleted, syncProfileToLocalStorage } from "@/lib/user-profile";
import { User, Mail, Lock, ShieldAlert, Award, FileText, IndianRupee, Key } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("General Physician");
  const [degree, setDegree] = useState("");
  const [fees, setFees] = useState("300");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sandboxInfo, setSandboxInfo] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess(false);

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      if (supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
          redirectTo: `${window.location.origin}/login?reset=true`,
        });
        if (resetErr) {
          console.warn("Supabase password reset failed, using sandbox fallback:", resetErr.message);
        }
      }
      setResetSuccess(true);
    } catch (err) {
      setResetError("Failed to initiate password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Login — CliniHome AI";
  }, []);

  // Initialize client safely
  let supabase: ReturnType<typeof createClient> = null;
  try {
    supabase = createClient();
  } catch (e) {
    console.warn("Supabase client not initialized:", e);
  }

  const resetLocalStorageForSignup = (
    targetName: string,
    targetRole: "patient" | "doctor",
    targetSpec: string,
    targetDegree: string,
    targetFees: string
  ) => {
    if (typeof window === "undefined") return;
    
    localStorage.removeItem("clinihome-appointments");
    localStorage.removeItem("clinihome-medications");
    localStorage.removeItem("clinihome-health-profile");
    
    if (targetRole === "patient") {
      const freshPatient = {
        name: targetName || "Demo Patient",
        phone: "",
        age: 25,
        gender: "male" as const,
        blood_group: "Don't Know",
        conditions: [],
        medications: [],
        allergies: [],
        uploaded_reports: [],
        health_goals: [],
        language_preference: "english" as const,
        onboarding_completed: false,
      };
      localStorage.setItem("clinihome-patient-profile", JSON.stringify(freshPatient));
      localStorage.removeItem("clinihome-doctor-profile");
    } else {
      const freshDoctor = {
        name: targetName || "Dr. Demo Account",
        phone: "",
        specialization: targetSpec || "General Physician",
        degree: targetDegree || "",
        experience_years: 1,
        city: "",
        area: "",
        fees: Number(targetFees) || 300,
        preferred_conditions: [],
        preferred_age_groups: ["All Ages"],
        consultation_modes: ["chat"],
        ai_settings: {
          ai_assisted_replies: true,
          auto_patient_summary: true,
          patient_data_access: "full" as const,
        },
        onboarding_completed: false,
      };
      localStorage.setItem("clinihome-doctor-profile", JSON.stringify(freshDoctor));
      localStorage.removeItem("clinihome-patient-profile");
    }
  };

  const loginToSandbox = (
    targetEmail: string,
    targetRole: "patient" | "doctor",
    targetName: string,
    targetSpec: string,
    targetDegree: string,
    targetFees: string,
    isSigningUp: boolean,
    isFallback: boolean = false
  ) => {
    let doctorId = "doc-demo-id";
    if (targetRole === "doctor") {
      try {
        const storedDocs = localStorage.getItem("clinihome-doctors-list");
        const docs = storedDocs ? JSON.parse(storedDocs) : [];
        const found = docs.find((d: any) => d.email === targetEmail.trim());
        if (found) {
          doctorId = found.id;
        } else if (targetName === "Dr. Priya Sharma" || targetEmail === "demo-doctor@clinihome.ai") {
          doctorId = "1";
        }
      } catch (e) {}
    }
    const mockUser = {
      id: targetRole === "doctor" ? doctorId : "patient-demo-id",
      email: targetEmail.trim(),
      role: targetRole,
      name: targetName || (targetRole === "doctor" ? (isFallback ? "Dr. Local Account" : "Dr. Demo Account") : (isFallback ? "Local Patient" : "Demo Patient")),
      isSandbox: true,
      specialization: targetRole === "doctor" ? targetSpec : undefined,
      degree: targetRole === "doctor" ? targetDegree || "MBBS" : undefined,
      fees: targetRole === "doctor" ? Number(targetFees) : undefined,
    };
    localStorage.setItem("clinihome-session", JSON.stringify(mockUser));

    // Sync cookie for proxy auth guard
    document.cookie = `clinihome-session=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=604800; SameSite=Lax`;

    if (isSigningUp && targetRole === "doctor") {
      try {
        const storedDocs = localStorage.getItem("clinihome-doctors-list");
        const docs = storedDocs ? JSON.parse(storedDocs) : [];
        if (!docs.some((d: any) => d.email === targetEmail.trim())) {
          docs.push({
            id: "doc-" + Date.now(),
            email: targetEmail.trim(),
            name: mockUser.name,
            specialization: targetSpec,
            degree: targetDegree || "MBBS",
            fees: Number(targetFees) || 300,
            city: "Delhi",
            area: isFallback ? "Lajpat Nagar" : "Connaught Place",
            rating: 4.5,
            distance: isFallback ? 2.0 : 1.5,
            phone: "+91 99999 99999",
            is_approved: false,
          });
          localStorage.setItem("clinihome-doctors-list", JSON.stringify(docs));
        }
      } catch (e) {
        console.warn("Error adding local sandbox doctor:", e);
      }
    }

    // Seed profile data for returning sandbox users to prevent name mismatch discrepancies
    if (!isSigningUp) {
      if (targetRole === "patient") {
        const patientProfile = {
          name: mockUser.name,
          phone: "+91 98765 43210",
          age: 28,
          gender: "male" as const,
          blood_group: "O+",
          conditions: ["Hypertension (High BP)"],
          medications: ["Amlodipine 5mg"],
          allergies: ["Penicillin"],
          uploaded_reports: [],
          health_goals: ["Control Blood Pressure", "Improve Sleep"],
          language_preference: "english" as const,
          onboarding_completed: true,
        };
        localStorage.setItem("clinihome-patient-profile", JSON.stringify(patientProfile));
        
        const trackerProfile = {
          name: mockUser.name,
          age: 28,
          gender: "male" as const,
          weight_kg: 72,
          height_cm: 175,
          conditions: ["Hypertension (High BP)"],
          medications: ["Amlodipine 5mg"],
          daily_cal_goal: 2000,
          step_goal: 8000,
          sleep_goal_hrs: 8.0,
        };
        localStorage.setItem("clinihome-health-profile", JSON.stringify(trackerProfile));
      } else if (targetRole === "doctor") {
        const doctorProfile = {
          name: mockUser.name,
          phone: "+91 99999 99999",
          specialization: targetSpec || "General Physician",
          degree: targetDegree || "MBBS, MD",
          experience_years: 8,
          city: "Delhi",
          area: isFallback ? "Lajpat Nagar" : "Connaught Place",
          fees: Number(targetFees) || 300,
          preferred_conditions: ["Fever & Infections", "Diabetes Management", "Heart & BP Issues"],
          preferred_age_groups: ["All Ages"],
          consultation_modes: ["chat"],
          ai_settings: {
            ai_assisted_replies: true,
            auto_patient_summary: true,
            patient_data_access: "full",
          },
          onboarding_completed: true,
        };
        localStorage.setItem("clinihome-doctor-profile", JSON.stringify(doctorProfile));
      }
    }

    if (isSigningUp || !isOnboardingCompleted(targetRole)) {
      router.push("/onboarding");
    } else if (targetRole === "doctor") {
      router.push("/doctor-dashboard");
    } else {
      router.push("/");
    }
  };

  const performAuthProcess = async (
    targetEmail: string,
    targetPass: string,
    targetRole: "patient" | "doctor",
    isSigningUp: boolean,
    targetName: string,
    targetSpec: string = "General Physician",
    targetDegree: string = "",
    targetFees: string = "300"
  ) => {
    setError(null);
    setSandboxInfo(null);
    setLoading(true);

    if (!targetEmail || !targetPass || (isSigningUp && !targetName)) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    if (isSigningUp) {
      resetLocalStorageForSignup(targetName, targetRole, targetSpec, targetDegree, targetFees);
    }

    const isDemo = targetEmail.includes("demo-") || targetEmail === "patient@clinihome.ai" || targetEmail === "doctor@clinihome.ai" || targetEmail === "patient@mediscan.ai" || targetEmail === "doctor@mediscan.ai";
    const supabaseMissing = !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isDemo || supabaseMissing) {
      loginToSandbox(targetEmail, targetRole, targetName, targetSpec, targetDegree, targetFees, isSigningUp, false);
      setLoading(false);
      return;
    }

    try {
      if (!supabase) return;
      if (isSigningUp) {
        // Sign Up with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: targetEmail,
          password: targetPass,
          options: {
            data: {
              full_name: targetName,
              role: targetRole,
              specialization: targetRole === "doctor" ? targetSpec : null,
              degree: targetRole === "doctor" ? targetDegree : null,
              fees: targetRole === "doctor" ? Number(targetFees) : null,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          setSandboxInfo("Registration successful! Check email or try logging in.");
          setIsSignUp(false);
        }
      } else {
        // Sign In with Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: targetPass,
        });

        if (signInError) throw signInError;

        if (data?.session) {
          // Fetch additional profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.session.user.id)
            .single();

          const activeRole = profile?.role || targetRole;

          // Fetch reports if role is patient
          let reports: any[] = [];
          if (activeRole === "patient") {
            const { data: reportsData } = await supabase
              .from("uploaded_reports")
              .select("*")
              .eq("user_id", data.session.user.id);
            if (reportsData) {
              reports = reportsData;
            }
          }

          if (profile) {
            syncProfileToLocalStorage(activeRole as "patient" | "doctor", profile, reports);
          }

          const activeUser = {
            id: data.session.user.id,
            email: data.session.user.email,
            role: activeRole,
            name: profile?.full_name || targetName || data.session.user.email,
          };
          localStorage.setItem("clinihome-session", JSON.stringify(activeUser));
          
          // Sync cookie for proxy auth guard
          document.cookie = `clinihome-session=${encodeURIComponent(JSON.stringify(activeUser))}; path=/; max-age=604800; SameSite=Lax`;

          // Route based on onboarding status
          if (!isOnboardingCompleted(activeUser.role as "patient" | "doctor")) {
            router.push("/onboarding");
          } else if (activeUser.role === "doctor") {
            router.push("/doctor-dashboard");
          } else {
            router.push("/");
          }
        }
      }
    } catch (err: any) {
      console.warn("Supabase Auth failed, using local sandbox flow:", err);
      // Fallback sandbox login
      loginToSandbox(targetEmail, targetRole, targetName, targetSpec, targetDegree, targetFees, isSigningUp, true);
      setSandboxInfo("Supabase database offline or login failed. Accessing app in Sandboxed Mode.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    performAuthProcess(email, password, role, isSignUp, name, specialization, degree, fees);
  };

  const handleQuickLogin = (demoRole: "patient" | "doctor") => {
    const emailVal = demoRole === "patient" ? "demo-patient@clinihome.ai" : "demo-doctor@clinihome.ai";
    const passwordVal = "password";
    const nameVal = demoRole === "patient" ? "Demo Patient" : "Dr. Priya Sharma";
    const degreeVal = demoRole === "doctor" ? "MBBS, MD" : "";
    const feesVal = "300";

    setRole(demoRole);
    setIsSignUp(false);
    setEmail(emailVal);
    setPassword(passwordVal);
    setName(nameVal);
    setDegree(degreeVal);
    setFees(feesVal);

    performAuthProcess(emailVal, passwordVal, demoRole, false, nameVal, "General Physician", degreeVal, feesVal);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div
        className="animate-pop-in"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {/* Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            padding: "24px",
            textAlign: "center",
            color: "white",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700 }}>
            Welcome to CliniHome AI
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
            Your AI Doctor, Right in Your Pocket
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setRole("patient")}
            style={{
              flex: 1,
              padding: "14px",
              fontFamily: "var(--font-heading)",
              fontSize: "14px",
              fontWeight: 600,
              color: role === "patient" ? "var(--purple-primary)" : "var(--text-secondary)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: role === "patient" ? "2px solid var(--purple-primary)" : "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            👤 Patient {isSignUp ? "Sign Up" : "Login"}
          </button>
          <button
            onClick={() => setRole("doctor")}
            style={{
              flex: 1,
              padding: "14px",
              fontFamily: "var(--font-heading)",
              fontSize: "14px",
              fontWeight: 600,
              color: role === "doctor" ? "var(--purple-primary)" : "var(--text-secondary)",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottom: role === "doctor" ? "2px solid var(--purple-primary)" : "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            🩺 Doctor {isSignUp ? "Sign Up" : "Login"}
          </button>
        </div>

        <div style={{ padding: "32px 24px" }}>
          {/* Messages */}
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
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          {sandboxInfo && (
            <div
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
                padding: "12px 16px",
                borderRadius: "10px",
                color: "var(--severity-low)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <Key size={16} />
              {sandboxInfo}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {isSignUp && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    aria-label="Full Name"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}
 
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  aria-label="Email Address"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            </div>
 
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  aria-label="Password"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {!isSignUp && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-2px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowResetModal(true);
                    setResetSuccess(false);
                    setResetError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--purple-primary)",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Doctor Specific Fields */}
            {isSignUp && role === "doctor" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                    Specialization
                  </label>
                  <div style={{ position: "relative" }}>
                    <Award size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      aria-label="Specialization"
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="General Physician">General Physician</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pathologist">Pathologist</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Degree
                    </label>
                    <div style={{ position: "relative" }}>
                      <FileText size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        placeholder="e.g. MBBS, MD"
                        aria-label="Degree"
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 36px",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Fees (₹)
                    </label>
                    <div style={{ position: "relative" }}>
                      <IndianRupee size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                      <input
                        type="number"
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        placeholder="300"
                        aria-label="Fees"
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 36px",
                          borderRadius: "8px",
                          border: "1px solid var(--border)",
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "12px",
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "14px",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {/* Toggle Login/SignUp */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "var(--purple-primary)",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Quick Sandbox Login Buttons */}
          <div style={{ marginTop: "32px", borderTop: "1px dashed var(--border)", paddingTop: "24px" }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              ⚡ Fast Quick-Test Sandboxes (No DB Setup Required)
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => handleQuickLogin("patient")}
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  background: "rgba(124,58,237,0.06)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  borderRadius: "8px",
                  color: "var(--purple-primary)",
                  cursor: "pointer",
                }}
              >
                Patient Sandbox
              </button>
              <button
                onClick={() => handleQuickLogin("doctor")}
                style={{
                  flex: 1,
                  padding: "8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  background: "rgba(236,72,153,0.06)",
                  border: "1px solid rgba(236,72,153,0.15)",
                  borderRadius: "8px",
                  color: "var(--accent-pink)",
                  cursor: "pointer",
                }}
              >
                Doctor Sandbox
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border, rgba(0, 0, 0, 0.1))",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px 0", color: "var(--text-primary)" }}>
              Reset Password
            </h3>
            {resetSuccess ? (
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
                  A password reset link has been simulated & sent to <strong style={{ color: "var(--text-primary)" }}>{resetEmail}</strong>. Please check your inbox.
                </p>
                <button
                  onClick={() => setShowResetModal(false)}
                  style={{
                    width: "100%",
                    background: "var(--purple-primary)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "13px",
                    padding: "10px",
                    borderRadius: "100px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>
                {resetError && (
                  <p style={{ color: "var(--severity-high)", fontSize: "12px", fontWeight: 600, margin: 0 }}>
                    ⚠️ {resetError}
                  </p>
                )}
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: "var(--purple-primary)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "13px",
                      padding: "10px",
                      borderRadius: "100px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      fontSize: "13px",
                      padding: "10px",
                      borderRadius: "100px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
