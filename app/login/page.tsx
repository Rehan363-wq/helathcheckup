"use client";

import { useState } from "react";
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

  // Initialize client safely
  let supabase: any = null;
  try {
    supabase = createClient();
  } catch (e) {
    console.warn("Supabase client not initialized:", e);
  }

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

    const isDemo = targetEmail.includes("demo-") || targetEmail === "patient@healflow.ai" || targetEmail === "doctor@healflow.ai" || targetEmail === "patient@mediscan.ai" || targetEmail === "doctor@mediscan.ai";
    const supabaseMissing = !supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isDemo || supabaseMissing) {
      // Simulate login using local storage sandbox session
      setTimeout(() => {
        const mockUser = {
          email: targetEmail.trim(),
          role: targetRole,
          name: targetName || (targetRole === "doctor" ? "Dr. Demo Account" : "Demo Patient"),
          isSandbox: true,
          specialization: targetRole === "doctor" ? targetSpec : undefined,
          degree: targetRole === "doctor" ? targetDegree || "MBBS" : undefined,
          fees: targetRole === "doctor" ? Number(targetFees) : undefined,
        };
        localStorage.setItem("healflow-session", JSON.stringify(mockUser));
        setLoading(false);

        // Route: new signup → onboarding, returning user → dashboard
        if (isSigningUp || !isOnboardingCompleted(targetRole)) {
          router.push("/onboarding");
        } else if (targetRole === "doctor") {
          router.push("/doctor-dashboard");
        } else {
          router.push("/");
        }
      }, 1000);
      return;
    }

    try {
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
          let reports = [];
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
          localStorage.setItem("healflow-session", JSON.stringify(activeUser));

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
      const fallbackUser = {
        email: targetEmail.trim(),
        role: targetRole,
        name: targetName || (targetRole === "doctor" ? "Dr. Local Account" : "Local Patient"),
        isSandbox: true,
      };
      localStorage.setItem("healflow-session", JSON.stringify(fallbackUser));
      setSandboxInfo("Supabase database offline or login failed. Accessing app in Sandboxed Mode.");
      
      setTimeout(() => {
        if (targetRole === "doctor") {
          router.push("/doctor-dashboard");
        } else {
          router.push("/");
        }
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    performAuthProcess(email, password, role, isSignUp, name, specialization, degree, fees);
  };

  const handleQuickLogin = (demoRole: "patient" | "doctor") => {
    const emailVal = demoRole === "patient" ? "demo-patient@healflow.ai" : "demo-doctor@healflow.ai";
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
            Welcome to HealFlow AI
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
            Apna Doctor, Apni Zeb Mein
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
            👤 Patient Login
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
            🩺 Doctor Login
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
    </div>
  );
}
