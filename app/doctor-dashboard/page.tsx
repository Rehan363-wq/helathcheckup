"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Send, User, MessageSquare, ArrowLeft, Heart, Award, CreditCard, Star, Brain, Loader2 } from "lucide-react";
import { loadPatientProfile, buildPatientSummaryForDoctor, buildDoctorContextForAI } from "@/lib/user-profile";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  lastMessage?: string;
  time?: string;
  avatar_url?: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [currentDoctor, setCurrentDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [dbStatus, setDbStatus] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createClient(), []);

  // Validate session
  useEffect(() => {
    document.title = "Doctor Dashboard — CliniHome AI";
    const session = localStorage.getItem("clinihome-session");
    if (!session) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(session);
    if (parsed.role !== "doctor") {
      router.push("/");
      return;
    }
    setCurrentDoctor(parsed);
  }, [router]);

  // Load patients list
  useEffect(() => {
    if (!currentDoctor) return;

    const loadPatients = async () => {
      if (!supabase || currentDoctor.isSandbox) {
        useFallbackPatients();
        return;
      }

      try {
        // Query distinct patients that have chat records with this doctor
        const { data: chats, error } = await supabase
          .from("chats")
          .select("id, patient_id, profiles!chats_patient_id_fkey(id, full_name, avatar_url)")
          .eq("doctor_id", currentDoctor.id);

        if (error) throw error;

        if (chats && chats.length > 0) {
          const formatted = chats.map((c: any) => ({
            id: c.profiles.id,
            full_name: c.profiles.full_name || "Unknown Patient",
            email: "patient@clinihome.ai",
            lastMessage: "Consultation initiated.",
            time: "Today",
          }));
          setPatients(formatted);
          setDbStatus("Connected to Supabase DB");
        } else {
          useFallbackPatients();
        }
      } catch (err) {
        console.warn("Supabase load failed, using local sandbox fallback for patient list:", err);
        useFallbackPatients();
      }
    };

    const useFallbackPatients = () => {
      const registryKey = `clinihome-sandbox-patients-${currentDoctor.id || "1"}`;
      try {
        const stored = localStorage.getItem(registryKey);
        if (stored) {
          const list = JSON.parse(stored);
          if (list && list.length > 0) {
            setPatients(list);
            setDbStatus("Sandbox Mode: Active Patient Queues");
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to parse sandbox patients registry:", e);
      }

      const defaults = [
        { id: "p1", full_name: "Rohan Verma", email: "rohan@gmail.com", lastMessage: "Experiencing dry patches on skin", time: "10:15 AM" },
        { id: "p2", full_name: "Simran Kaur", email: "simran@gmail.com", lastMessage: "Fever checking routine", time: "Yesterday" },
        { id: "p3", full_name: "Rahul Sharma", email: "rahul@gmail.com", lastMessage: "Hemoglobin 9.8 range advice", time: "2 days ago" },
      ];
      setPatients(defaults);
      try {
        localStorage.setItem(registryKey, JSON.stringify(defaults));
      } catch (e) {}
      setDbStatus("Sandbox Mode: Active Patient Queues");
    };

    loadPatients();

    // Storage listener to update active patient queue dynamically
    const registryKey = `clinihome-sandbox-patients-${currentDoctor.id || "1"}`;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === registryKey) {
        try {
          if (e.newValue) {
            setPatients(JSON.parse(e.newValue));
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [currentDoctor, supabase]);

  // Load messages when selected patient changes
  useEffect(() => {
    if (!selectedPatient || !currentDoctor) return;

    let activeChannel: any = null;
    const mockKey = `clinihome-chat-${selectedPatient.email}-${currentDoctor.id || "1"}`;

    const loadMockHistory = () => {
      // Patients chat key maps to the patient's local history (shared with patient)
      const saved = localStorage.getItem(mockKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const initialMsg: ChatMessage = {
          id: "init",
          sender_id: selectedPatient.id,
          content: selectedPatient.lastMessage || "Hello doctor, can you consult me?",
          created_at: new Date().toISOString(),
        };
        setMessages([initialMsg]);
        localStorage.setItem(mockKey, JSON.stringify([initialMsg]));
      }
    };

    const loadMessages = async () => {
      if (!supabase || currentDoctor.isSandbox) {
        loadMockHistory();
        return;
      }

      try {
        const { data: chatData } = await supabase
          .from("chats")
          .select("id")
          .eq("patient_id", selectedPatient.id)
          .eq("doctor_id", currentDoctor.id)
          .maybeSingle();

        if (chatData?.id) {
          const { data: msgData, error } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatData.id)
            .order("created_at", { ascending: true });

          if (error) throw error;

          setMessages(msgData || []);

          // Subscribe to Realtime messages
          activeChannel = supabase
            .channel(`room-${chatData.id}`)
            .on(
              "postgres_changes",
              { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatData.id}` },
              (payload: any) => {
                setMessages((prev) => [...prev, payload.new]);
              }
            )
            .subscribe();
        } else {
          loadMockHistory();
        }
      } catch (err) {
        console.warn("DB messages load failed, using local history:", err);
        loadMockHistory();
      }
    };

    loadMessages();

    // Storage listener to update chat stream in real time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === mockKey) {
        try {
          setMessages(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (activeChannel && supabase) {
        supabase.removeChannel(activeChannel);
      }
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [selectedPatient, currentDoctor, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedPatient || !currentDoctor) return;

    const replyContent = input.trim();
    setInput("");

    const newReply: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentDoctor.id || "doctor-demo-id",
      content: replyContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newReply]);

    const isSandboxFlow = !supabase || currentDoctor.isSandbox;

    if (!isSandboxFlow) {
      try {
        const { data: chatData } = await supabase
          .from("chats")
          .select("id")
          .eq("patient_id", selectedPatient.id)
          .eq("doctor_id", currentDoctor.id)
          .single();

        if (chatData?.id) {
          const { error } = await supabase.from("messages").insert({
            chat_id: chatData.id,
            sender_id: currentDoctor.id,
            content: replyContent,
          });
          if (error) throw error;
        }
      } catch (err) {
        console.warn("DB reply insert failed, using fallback storage");
      }
    }

    // Save locally to show in both screens
    const mockKey = `clinihome-chat-${selectedPatient.email}-${currentDoctor.id || "1"}`;
    const localHistory = [...messages, newReply];
    localStorage.setItem(mockKey, JSON.stringify(localHistory));

    // Update patient registry for sandbox mode
    if (isSandboxFlow || dbStatus?.includes("Sandbox")) {
      try {
        const registryKey = `clinihome-sandbox-patients-${currentDoctor.id || "1"}`;
        const stored = localStorage.getItem(registryKey);
        let registry = [];
        if (stored) {
          registry = JSON.parse(stored);
        }
        const existingIdx = registry.findIndex((p: any) => p.email === selectedPatient.email);
        const entry = {
          id: selectedPatient.id,
          full_name: selectedPatient.full_name,
          email: selectedPatient.email,
          lastMessage: replyContent,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        if (existingIdx >= 0) {
          registry[existingIdx] = entry;
        } else {
          registry.push(entry);
        }
        localStorage.setItem(registryKey, JSON.stringify(registry));
      } catch (e) {
        console.warn("Failed to update sandbox patient registry on reply:", e);
      }
    }

    // Update patient card last message preview
    setPatients((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, lastMessage: replyContent, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : p))
    );
  };

  return (
    <div
      className="doctor-dashboard-container"
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-surface)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Profile Card & Info */}
        {currentDoctor && (
          <div
            className={`doctor-profile-card ${selectedPatient ? "mobile-hidden" : ""}`}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                }}
              >
                🩺
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {currentDoctor.name}
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                  {currentDoctor.specialization || "General Physician"} • {currentDoctor.degree || "MBBS"}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              {[
                { icon: Heart, label: "Patients", val: patients.length, color: "var(--accent-pink)" },
                { icon: CreditCard, label: "Consult Fees", val: `₹${currentDoctor.fees || 300}`, color: "var(--severity-low)" },
                { icon: Star, label: "Rating", val: "4.8", color: "var(--accent-yellow)" },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                  <div>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", textTransform: "uppercase", display: "block" }}>
                      {stat.label}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {stat.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messaging Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "20px",
            height: "calc(100vh - 280px)",
          }}
          className="chat-container-layout"
        >
          {/* Patient Queue */}
          <div
            className={`left-sidebar ${selectedPatient ? "mobile-hidden" : ""}`}
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                Patient Consultation Queue
              </h3>
              {dbStatus && (
                <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                  🟢 {dbStatus}
                </span>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setSelectedPatient(pat)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px 20px",
                    background: selectedPatient?.id === pat.id ? "rgba(124,58,237,0.06)" : "transparent",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(124,58,237,0.1)",
                      color: "var(--purple-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {pat.full_name.substring(0, 2)}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                        {pat.full_name}
                      </p>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>{pat.time}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: "2px 0 0" }}>
                      {pat.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Feed */}
          <div
            className={`chat-feed-panel ${!selectedPatient ? "mobile-hidden" : ""}`}
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: "500px",
            }}
          >
            {selectedPatient ? (
              <>
                {/* Header */}
                <div
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="mobile-back-btn"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      padding: "6px",
                      display: "none",
                    }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(124,58,237,0.1)",
                      color: "var(--purple-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {selectedPatient.full_name.substring(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedPatient.full_name}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-secondary)" }}>
                      Patient Consultation Session
                    </p>
                  </div>
                  {/* AI Summary Button */}
                  <button
                    onClick={async () => {
                      setAiLoading(true);
                      setAiSummary(null);
                      try {
                        const sessionStr = localStorage.getItem("clinihome-session");
                        const session = sessionStr ? JSON.parse(sessionStr) : null;
                        const token = session?.email || "sandbox";

                        const res = await fetch("/api/doctor/assistant", {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            doctorContext: buildDoctorContextForAI(),
                            patientSummary: buildPatientSummaryForDoctor(),
                          }),
                        });
                        const data = await res.json();
                        setAiSummary(data);
                      } catch (err) { console.error(err); }
                      setAiLoading(false);
                    }}
                    disabled={aiLoading}
                    style={{
                      marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 16px", borderRadius: "10px", border: "none",
                      background: "var(--purple-glow)", color: "var(--purple-primary)",
                      fontSize: "12px", fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-body)", transition: "all 0.2s",
                    }}
                  >
                    {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Brain size={14} /> AI Summary</>}
                  </button>
                </div>

                {/* AI Summary Panel */}
                {aiSummary && (
                  <div style={{
                    padding: "16px 24px", background: "rgba(139,92,246,0.03)",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", flexDirection: "column", gap: "10px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--purple-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>🤖 AI Patient Brief</span>
                      <button onClick={() => setAiSummary(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px" }}>✕</button>
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.6 }}>{aiSummary.patient_brief}</p>
                    {aiSummary.key_risk_factors?.length > 0 && (
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--severity-high)" }}>⚠️ Risk Factors:</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px" }}>{aiSummary.key_risk_factors.join(", ")}</span>
                      </div>
                    )}
                    {aiSummary.suggested_questions?.length > 0 && (
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-blue)" }}>❓ Suggested Questions:</span>
                        <ul style={{ margin: "4px 0 0", paddingLeft: "16px" }}>
                          {aiSummary.suggested_questions.slice(0, 3).map((q: string, i: number) => (
                            <li key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiSummary.consultation_tip && (
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--severity-low)", fontWeight: 600 }}>💡 {aiSummary.consultation_tip}</p>
                    )}
                  </div>
                )}

                {/* Messages stream */}
                <div
                  style={{
                    flex: 1,
                    padding: "24px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    background: "rgba(0,0,0,0.01)",
                  }}
                >
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === (currentDoctor?.id || "doctor-demo-id");
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            background: isMe ? "var(--purple-primary)" : "var(--bg-card-dark)",
                            color: isMe ? "white" : "var(--text-primary)",
                            padding: "10px 16px",
                            borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            fontSize: "13px",
                            fontFamily: "var(--font-body)",
                            lineHeight: 1.5,
                            border: isMe ? "none" : "1px solid var(--border)",
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Form Input */}
                <form
                  onSubmit={handleSendReply}
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Reply to ${selectedPatient.full_name}...`}
                    className="chat-input"
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--purple-primary)",
                      color: "white",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: !input.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  color: "var(--text-secondary)",
                  padding: "48px",
                  textAlign: "center",
                }}
              >
                <MessageSquare size={48} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", color: "var(--text-primary)" }}>
                  No Patient Selected
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", maxWidth: "320px" }}>
                  Select a patient from the queue to start the consultation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-input:focus {
          border-color: var(--purple-primary) !important;
          box-shadow: 0 0 0 2px var(--purple-glow);
        }
        @media (max-width: 768px) {
          .doctor-dashboard-container {
            padding: 12px 12px !important;
          }
          .chat-container-layout {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            min-height: calc(100vh - 120px) !important;
          }
          .left-sidebar {
            width: 100% !important;
          }
          .mobile-hidden {
            display: none !important;
          }
          .mobile-back-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
