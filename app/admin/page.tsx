"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Doctor } from "@/types/doctor";
import { MOCK_DOCTORS } from "@/lib/doctors";
import { ShieldCheck, UserCheck, UserX, Key, RefreshCw, LogOut, Check, Ban } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize client safely
  const supabase = useMemo(() => createClient(), []);

  // Check auth session
  useEffect(() => {
    document.title = "Admin Portal — CliniHome AI";
    if (typeof window !== "undefined") {
      const isAdmin = sessionStorage.getItem("clinihome-admin-auth");
      if (isAdmin === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.authenticated) {
        sessionStorage.setItem("clinihome-admin-auth", "true");
        setIsAuthenticated(true);
        setAuthError("");
      } else {
        setAuthError(data.error || "Incorrect password. Please try again.");
      }
    } catch (err) {
      setAuthError("An error occurred during authentication.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("clinihome-admin-auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  // Fetch doctors (both from Supabase and Local Storage list)
  const fetchAllDoctors = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    // Load local list first (for fallback/sandbox)
    let localDocs: any[] = [];
    try {
      const stored = localStorage.getItem("clinihome-doctors-list");
      if (stored) {
        localDocs = JSON.parse(stored);
      } else {
        localDocs = MOCK_DOCTORS.map(d => ({
          id: d.id,
          email: `${d.name.toLowerCase().replace(/\s+/g, "").replace(".", "")}@clinihome.ai`,
          full_name: d.name,
          role: "doctor",
          specialization: d.specialization,
          degree: d.degree,
          fees: d.fees,
          city: d.city,
          area: d.area,
          is_approved: true,
          rating: d.rating,
          phone: d.phone,
        }));
        localStorage.setItem("clinihome-doctors-list", JSON.stringify(localDocs));
      }
    } catch (e) {
      console.warn("Local storage read failed:", e);
    }

    if (!supabase) {
      setDoctors(localDocs);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "doctor");

      if (error) throw error;

      if (data) {
        // Sync local sandbox docs that aren't in Supabase (for full simulation)
        const combined = [...data];
        localDocs.forEach((ld) => {
          if (!combined.some((cd) => cd.email === ld.email || cd.id === ld.id)) {
            combined.push(ld);
          }
        });
        setDoctors(combined);
      } else {
        setDoctors(localDocs);
      }
    } catch (err: any) {
      console.warn("Failed to fetch from DB, using local fallback:", err);
      setDoctors(localDocs);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDoctors();
    }
  }, [isAuthenticated, fetchAllDoctors]);

  // Approve Doctor listing
  const handleApprove = async (docId: string, email: string) => {
    setMessage(null);
    let success = false;

    // 1. Update in local storage list (sandbox)
    try {
      const stored = localStorage.getItem("clinihome-doctors-list");
      if (stored) {
        const docs = JSON.parse(stored);
        const updated = docs.map((d: any) => 
          d.id === docId || d.email === email ? { ...d, is_approved: true } : d
        );
        localStorage.setItem("clinihome-doctors-list", JSON.stringify(updated));
        success = true;
      }
    } catch (e) {
      console.error("Local storage update error:", e);
    }

    // 2. Update in Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_approved: true })
          .eq("id", docId);

        if (!error) {
          success = true;
        } else {
          // If updating by ID fails because it's a sandbox mock doc not in DB, it's fine
          console.warn("Supabase doctor update error:", error);
        }
      } catch (err) {
        console.error("Database update error:", err);
      }
    }

    if (success) {
      setMessage({ type: "success", text: "Doctor listed approved successfully!" });
      // Update local state
      setDoctors(prev => prev.map(d => 
        d.id === docId || d.email === email ? { ...d, is_approved: true } : d
      ));
    } else {
      setMessage({ type: "error", text: "Failed to approve listing." });
    }
  };

  // Revoke/Reject Listing
  const handleRevoke = async (docId: string, email: string) => {
    setMessage(null);
    let success = false;

    // 1. Update local storage list
    try {
      const stored = localStorage.getItem("clinihome-doctors-list");
      if (stored) {
        const docs = JSON.parse(stored);
        const updated = docs.map((d: any) => 
          d.id === docId || d.email === email ? { ...d, is_approved: false } : d
        );
        localStorage.setItem("clinihome-doctors-list", JSON.stringify(updated));
        success = true;
      }
    } catch (e) {
      console.error("Local storage revoke error:", e);
    }

    // 2. Update in Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ is_approved: false })
          .eq("id", docId);

        if (!error) {
          success = true;
        }
      } catch (err) {
        console.error("Database revoke error:", err);
      }
    }

    if (success) {
      setMessage({ type: "success", text: "Doctor listing suspended/declined successfully." });
      setDoctors(prev => prev.map(d => 
        d.id === docId || d.email === email ? { ...d, is_approved: false } : d
      ));
    } else {
      setMessage({ type: "error", text: "Failed to suspend listing." });
    }
  };

  const pendingDoctors = doctors.filter((d) => d.is_approved === false);
  const approvedDoctors = doctors.filter((d) => d.is_approved === true);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "400px", background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", borderRadius: "20px", overflow: "hidden", padding: "32px 24px" }} className="animate-pop-in">
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-primary)", margin: "0 auto 16px" }}>
              <ShieldCheck size={28} />
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>CliniHome AI Admin Portal</h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Enter passkey to manage doctor listings</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Admin Key</label>
              <div style={{ position: "relative" }}>
                <Key size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin passkey"
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid var(--border)",
                    background: "var(--bg-surface)", color: "var(--text-primary)", fontSize: "14px", outline: "none",
                  }}
                />
              </div>
              {authError && <p style={{ color: "var(--severity-high)", fontSize: "11px", fontWeight: 600, marginTop: "4px", display: "flex", gap: "4px", alignItems: "center" }}>⚠️ {authError}</p>}
            </div>

            <button type="submit" style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg, #7C3AED, #EC4899)", border: "none", color: "white", fontSize: "14px", fontWeight: 700, borderRadius: "8px", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 16px rgba(124,58,237,0.2)" }}>
              Access Controls
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-surface)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
        
        {/* Header Block */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>🛡️ Doctor Listings Approval Control</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Approve newly registered doctors to list them in the search directory</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={fetchAllDoctors} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={handleLogout} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.08)", color: "var(--severity-high)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>

        {/* Info Banner messages */}
        {message && (
          <div style={{ padding: "12px 18px", borderRadius: "10px", background: message.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, color: message.type === "success" ? "var(--severity-low)" : "var(--severity-high)", fontSize: "13px", fontWeight: 600 }}>
            {message.type === "success" ? "✓" : "✗"} {message.text}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "20px", borderRadius: "14px", boxShadow: "var(--shadow-card)" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Total Listed Doctors</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>{doctors.length}</p>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "20px", borderRadius: "14px", boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--severity-med)" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Pending Approvals</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "var(--severity-med)" }}>{pendingDoctors.length}</p>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "20px", borderRadius: "14px", boxShadow: "var(--shadow-card)", borderLeft: "4px solid var(--severity-low)" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Active / Approved Listings</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 800, color: "var(--severity-low)" }}>{approvedDoctors.length}</p>
          </div>
        </div>

        {/* Tabs Control */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", gap: "16px" }}>
          <button onClick={() => setActiveTab("pending")} style={{ background: "none", border: "none", padding: "12px 6px", fontSize: "14px", fontWeight: 700, cursor: "pointer", color: activeTab === "pending" ? "var(--purple-primary)" : "var(--text-secondary)", borderBottom: activeTab === "pending" ? "2px solid var(--purple-primary)" : "none" }}>
            ⏳ Pending Approval ({pendingDoctors.length})
          </button>
          <button onClick={() => setActiveTab("approved")} style={{ background: "none", border: "none", padding: "12px 6px", fontSize: "14px", fontWeight: 700, cursor: "pointer", color: activeTab === "approved" ? "var(--purple-primary)" : "var(--text-secondary)", borderBottom: activeTab === "approved" ? "2px solid var(--purple-primary)" : "none" }}>
            🟢 Approved Listings ({approvedDoctors.length})
          </button>
        </div>

        {/* Doctors List */}
        <div style={{ minHeight: "200px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Loading doctor profiles...</div>
          ) : (activeTab === "pending" ? pendingDoctors : approvedDoctors).length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center", background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "14px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>
                No doctors in this section.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(activeTab === "pending" ? pendingDoctors : approvedDoctors).map((doc) => (
                <div key={doc.id || doc.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", boxShadow: "var(--shadow-card)", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(124,58,237,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🩺</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {doc.full_name || doc.name}
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {doc.specialization} • {doc.degree} • Fees: ₹{doc.fees}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                        Email: {doc.email} | Clinic Area: {doc.area || "N/A"}, {doc.city || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {activeTab === "pending" ? (
                      <>
                        <button onClick={() => handleApprove(doc.id, doc.email)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "8px", border: "none", background: "#10B981", color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                          <Check size={14} /> Approve listing
                        </button>
                        <button onClick={() => handleRevoke(doc.id, doc.email)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.06)", color: "var(--severity-high)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleRevoke(doc.id, doc.email)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.08)", color: "var(--severity-high)", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                        <Ban size={14} /> Suspend Listing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
