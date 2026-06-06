"use client";

import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Clock, Plus, Trash2, ShieldAlert, CheckCircle, Volume2 } from "lucide-react";

interface MedicineReminder {
  id: string;
  name: string;
  dosage: string;
  instruction: string;
  timings: string[]; // ['08:00', '20:00']
}

function RemindersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string; name: string; isSandbox?: boolean } | null>(null);
  
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 Tablet");
  const [instruction, setInstruction] = useState("After Food");
  const [timeInput, setTimeInput] = useState("08:00");
  const [selectedTimings, setSelectedTimings] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  
  // Real-time alert simulation
  const [activeAlert, setActiveAlert] = useState<{ medicine: string; dosage: string; instruction: string } | null>(null);

  // Initialize client safely
  const supabase = useMemo(() => createClient(), []);

  // Prefill medicine name from query param (AI chatbot redirect)
  useEffect(() => {
    document.title = "Medicine Reminders — CliniHome AI";
    const medParam = searchParams.get("medicine");
    if (medParam) {
      setName(medParam);
    }
  }, [searchParams]);

  // Validate session
  useEffect(() => {
    const session = localStorage.getItem("clinihome-session");
    if (!session) {
      router.push("/login");
      return;
    }
    setCurrentUser(JSON.parse(session));
  }, [router]);

  // Load reminders
  useEffect(() => {
    if (!currentUser) return;

    const loadReminders = async () => {
      if (!supabase || currentUser.isSandbox) {
        useFallbackReminders();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("medicine_reminders")
          .select("*")
          .eq("user_id", currentUser.id);

        if (error) throw error;

        setReminders(data || []);
        setDbStatus("Connected to Supabase DB");
      } catch (err) {
        console.warn("Supabase load failed, using local sandbox fallback for reminders:", err);
        useFallbackReminders();
      }
    };

    const useFallbackReminders = () => {
      const saved = localStorage.getItem(`clinihome-reminders-${currentUser.email}`);
      if (saved) {
        setReminders(JSON.parse(saved));
      } else {
        const defaultReminders = [
          { id: "r1", name: "Paracetamol", dosage: "1 Tablet", instruction: "After Food", timings: ["08:00", "20:00"] },
          { id: "r2", name: "Vitamin C", dosage: "1 Tablet", instruction: "Before Food", timings: ["10:00"] },
        ];
        setReminders(defaultReminders);
        localStorage.setItem(`clinihome-reminders-${currentUser.email}`, JSON.stringify(defaultReminders));
      }
      setDbStatus("Sandbox Mode: Saving Reminders Locally");
    };

    loadReminders();
  }, [currentUser, supabase]);

  const triggerAlertNotification = useCallback((reminder: any) => {
    setActiveAlert({
      medicine: reminder.name,
      dosage: reminder.dosage,
      instruction: reminder.instruction,
    });

    if ("speechSynthesis" in window) {
      const text = `Time to take your medicine: ${reminder.name}. ${reminder.dosage}, ${reminder.instruction}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Global Clock / Reminder Checker (Interval runs every 10 seconds)
  useEffect(() => {
    const lastTriggeredTimings: Record<string, string> = {}; // { reminderId: 'YYYY-MM-DD HH:MM' }

    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const todayDateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      reminders.forEach((rem) => {
        if (rem.timings.includes(currentTimeString)) {
          const triggerKey = `${rem.id}-${currentTimeString}`;
          const triggerValue = `${todayDateString} ${currentTimeString}`;

          // Avoid double trigger in the same minute
          if (lastTriggeredTimings[triggerKey] !== triggerValue) {
            lastTriggeredTimings[triggerKey] = triggerValue;
            triggerAlertNotification(rem);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [reminders, triggerAlertNotification]);

  const handleAddTiming = () => {
    if (timeInput && !selectedTimings.includes(timeInput)) {
      setSelectedTimings((prev) => [...prev, timeInput].sort());
    }
  };

  const handleRemoveTiming = (timeToRemove: string) => {
    setSelectedTimings((prev) => prev.filter((t) => t !== timeToRemove));
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Please enter medicine name.");
      return;
    }
    if (selectedTimings.length === 0) {
      setError("Please add at least one timing.");
      return;
    }

    const newReminderData = {
      id: Date.now().toString(),
      name: name.trim(),
      dosage,
      instruction,
      timings: selectedTimings,
    };

    const updatedReminders = [...reminders, newReminderData];
    setReminders(updatedReminders);

    const isSandboxFlow = !supabase || currentUser?.isSandbox;

    if (!isSandboxFlow && currentUser) {
      try {
        const { error } = await supabase.from("medicine_reminders").insert({
          user_id: currentUser.id,
          name: name.trim(),
          dosage,
          instruction,
          timings: selectedTimings,
        });
        if (error) throw error;
      } catch (err) {
        console.warn("DB save failed, saving local reminder");
      }
    }

    // Persist to local cache
    if (currentUser) {
      localStorage.setItem(`clinihome-reminders-${currentUser.email}`, JSON.stringify(updatedReminders));
    }

    setSuccess(`Reminder set for ${name}!`);
    setName("");
    setSelectedTimings([]);
  };

  const handleDeleteReminder = async (id: string) => {
    const updated = reminders.filter((rem) => rem.id !== id);
    setReminders(updated);

    const isSandboxFlow = !supabase || currentUser?.isSandbox;

    if (!isSandboxFlow) {
      try {
        const { error } = await supabase.from("medicine_reminders").delete().eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.warn("DB delete failed");
      }
    }

    if (currentUser) {
      localStorage.setItem(`clinihome-reminders-${currentUser.email}`, JSON.stringify(updated));
    }
  };

  // Trigger a test notification immediately (Demo purposes)
  const handleTestAlert = () => {
    triggerAlertNotification({
      id: "demo-test",
      name: name || "Test Medicine",
      dosage: dosage,
      instruction: instruction,
      timings: [],
    });
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-surface)",
        padding: "32px 24px",
      }}
    >
      {/* Visual Reminder Alert Pop-up */}
      {activeAlert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="animate-pop-in"
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
              padding: "32px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(124,58,237,0.1)",
                color: "var(--purple-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Bell size={32} className="animate-float" />
            </div>

            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Medication Alert!
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              It's time to take your scheduled medication.
            </p>

            <div
              style={{
                background: "rgba(124,58,237,0.06)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "left",
              }}
            >
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                💊 {activeAlert.medicine}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Dosage: {activeAlert.dosage}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--purple-primary)", fontWeight: 500, marginTop: "2px" }}>
                Instructions: {activeAlert.instruction}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveAlert(null);
                if ("speechSynthesis" in window) window.speechSynthesis.cancel();
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "white",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Done, I took it!
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
        }}
        className="reminders-layout-grid"
      >
        {/* Left: Schedule Form */}
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              ⏰ Medicine Reminders
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)" }}>
              Schedule your daily medications and receive timely alerts and notifications.
            </p>
            {dbStatus && (
              <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                🟢 {dbStatus}
              </span>
            )}
          </div>

          <form
            onSubmit={handleSaveReminder}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", color: "var(--severity-high)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <ShieldAlert size={14} />
                {error}
              </div>
            )}
            {success && (
              <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "8px", color: "var(--severity-low)", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={14} />
                {success}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Medicine Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paracetamol, Cetirizine"
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Dosage
                </label>
                <select
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="1 Tablet">1 Tablet</option>
                  <option value="1/2 Tablet">1/2 Tablet</option>
                  <option value="1 Capsule">1 Capsule</option>
                  <option value="5 ml (1 Spoon)">5 ml (1 Spoon)</option>
                  <option value="10 ml (2 Spoons)">10 ml (2 Spoons)</option>
                  <option value="2 Drops">2 Drops</option>
                </select>
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Instruction
                </label>
                <select
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Food">Before Food</option>
                  <option value="With Milk">With Milk</option>
                  <option value="Before Sleep">Before Sleep</option>
                </select>
              </div>
            </div>

            {/* Timings Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                Medication Timings
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="time"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTiming}
                  style={{
                    padding: "10px 16px",
                    background: "rgba(124,58,237,0.08)",
                    color: "var(--purple-primary)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Plus size={16} /> Add Time
                </button>
              </div>

              {/* Selected Timing Badges */}
              {selectedTimings.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {selectedTimings.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "4px 10px",
                        background: "var(--bg-card-dark)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Clock size={12} style={{ color: "var(--purple-primary)" }} />
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTiming(t)}
                        style={{ background: "none", border: "none", color: "var(--severity-high)", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                }}
              >
                Save Schedule
              </button>
              <button
                type="button"
                onClick={handleTestAlert}
                style={{
                  padding: "12px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "var(--severity-low)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Test Trigger Notification Immediately"
              >
                <Volume2 size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Right: Active Reminders List */}
        <div>
          <h3
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "24px",
            }}
          >
            Active Medications ({reminders.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {reminders.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--bg-card)",
                  border: "1px dashed var(--border)",
                  borderRadius: "16px",
                  color: "var(--text-secondary)",
                }}
              >
                <Bell size={36} style={{ color: "var(--text-muted)", margin: "0 auto 12px", opacity: 0.6 }} />
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                  No active reminders.
                  <br />
                  Add medicines using the form to schedule alerts.
                </p>
              </div>
            ) : (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-card)",
                    borderRadius: "14px",
                    padding: "18px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      💊 {rem.name}
                    </h4>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      {rem.dosage} • {rem.instruction}
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {rem.timings.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            padding: "2px 6px",
                            background: "var(--bg-card-dark)",
                            borderRadius: "4px",
                            color: "var(--purple-primary)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock size={8} /> {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.12)",
                      borderRadius: "8px",
                      padding: "8px",
                      color: "var(--severity-high)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    title="Delete Reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .reminders-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function RemindersPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "calc(100vh - 64px)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", color: "var(--text-secondary)" }}>Loading reminders...</div>}>
      <RemindersContent />
    </Suspense>
  );
}
