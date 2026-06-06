"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MOCK_DOCTORS } from "@/lib/doctors";
import { Send, User, MessageSquare, ArrowLeft, ShieldAlert } from "lucide-react";

const getInitials = (name: string) => {
  const clean = name.replace(/^Dr\.\s+/i, "");
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DR";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface Profile {
  id: string;
  full_name: string;
  role: string;
  specialization?: string;
  avatar_url?: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; role: string; name: string; isSandbox?: boolean } | null>(null);
  const [doctors, setDoctors] = useState<Profile[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Profile | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = useMemo(() => createClient(), []);

  // Check login session
  useEffect(() => {
    document.title = "Consultation Chat — CliniHome AI";
    const session = localStorage.getItem("clinihome-session");
    if (!session) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(session);
    setCurrentUser(parsed);
    
    if (parsed.role === "doctor") {
      router.push("/doctor-dashboard");
    }
  }, [router]);

  // Load doctors list
  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      if (!supabase || currentUser?.isSandbox) {
        if (active) useFallbackDoctors();
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, role, specialization, avatar_url")
          .eq("role", "doctor");

        if (error) throw error;

        if (active) {
          if (data && data.length > 0) {
            setDoctors(data);
            setDbStatus("Connected to Supabase DB");
          } else {
            useFallbackDoctors();
          }
        }
      } catch (err) {
        console.warn("Supabase profiles load failed, fallback to mock data:", err);
        if (active) useFallbackDoctors();
      }
    };

    const useFallbackDoctors = () => {
      let localDocs = [];
      try {
        const stored = localStorage.getItem("clinihome-doctors-list");
        if (stored) {
          localDocs = JSON.parse(stored);
        } else {
          localDocs = MOCK_DOCTORS.map(d => ({ ...d, is_approved: true }));
        }
      } catch (e) {}

      const approvedLocal = localDocs.filter((d: any) => d.is_approved === true);
      const formatted = approvedLocal.map((d: any) => ({
        id: d.id,
        full_name: d.name || d.full_name || "Doctor",
        role: "doctor",
        specialization: d.specialization,
      }));
      setDoctors(formatted);
      setDbStatus("Sandbox Mode: Loaded Pre-verified Doctors");
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, [supabase, currentUser]);

  // Load messages when selected doctor changes
  useEffect(() => {
    if (!selectedDoctor || !currentUser) return;
    
    let activeChannel: any = null;
    const mockKey = `clinihome-chat-${currentUser.email}-${selectedDoctor.id}`;

    const loadMockHistory = () => {
      const saved = localStorage.getItem(mockKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const greetMsg: ChatMessage = {
          id: "greet",
          sender_id: selectedDoctor.id,
          content: `Hello! I am ${selectedDoctor.full_name} (${selectedDoctor.specialization}). Please share your health symptoms in detail so that I can assist you.`,
          created_at: new Date().toISOString(),
        };
        setMessages([greetMsg]);
        localStorage.setItem(mockKey, JSON.stringify([greetMsg]));
      }
    };

    const loadMessages = async () => {
      if (!supabase || currentUser.isSandbox) {
        loadMockHistory();
        return;
      }

      try {
        // Find or create chat room
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select("id")
          .or(`and(patient_id.eq.${currentUser.id},doctor_id.eq.${selectedDoctor.id}),and(patient_id.eq.${selectedDoctor.id},doctor_id.eq.${currentUser.id})`)
          .maybeSingle();

        if (chatError) throw chatError;

        let chatId = chatData?.id;

        if (!chatId) {
          const { data: newChat, error: createError } = await supabase
            .from("chats")
            .insert({ patient_id: currentUser.id, doctor_id: selectedDoctor.id })
            .select("id")
            .single();

          if (createError) throw createError;
          chatId = newChat.id;
        }

        // Fetch messages for room
        const { data: msgData, error: msgError } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (msgError) throw msgError;

        setMessages(msgData || []);

        // Subscribe to Realtime messages
        activeChannel = supabase
          .channel(`room-${chatId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
            (payload: any) => {
              setMessages((prev) => [...prev, payload.new]);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn("Realtime fetch failed, fallback to mock conversation history:", err);
        loadMockHistory();
      }
    };

    loadMessages();

    // Storage listener for sandbox mode
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
  }, [selectedDoctor, currentUser, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedDoctor || !currentUser) return;

    const userMsgContent = input.trim();
    setInput("");

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender_id: currentUser.id || "patient-demo-id",
      content: userMsgContent,
      created_at: new Date().toISOString(),
    };

    const localHistory = [...messages, newMsg];
    setMessages(localHistory);

    // Save locally
    const mockKey = `clinihome-chat-${currentUser.email}-${selectedDoctor.id}`;
    localStorage.setItem(mockKey, JSON.stringify(localHistory));

    const isSandboxFlow = !supabase || currentUser.isSandbox;
    let chatId = null;

    if (!isSandboxFlow) {
      try {
        // Find room ID
        const { data: chatData } = await supabase
          .from("chats")
          .select("id")
          .or(`and(patient_id.eq.${currentUser.id},doctor_id.eq.${selectedDoctor.id}),and(patient_id.eq.${selectedDoctor.id},doctor_id.eq.${currentUser.id})`)
          .single();

        if (chatData?.id) {
          chatId = chatData.id;
          const { error } = await supabase.from("messages").insert({
            chat_id: chatData.id,
            sender_id: currentUser.id,
            content: userMsgContent,
          });
          if (error) throw error;
        }
      } catch (err) {
        console.warn("DB save failed, using local sandbox fallback for message");
      }
    }

    // Update patient registry for sandbox doctor dashboard queue
    if (isSandboxFlow || dbStatus?.includes("Sandbox")) {
      try {
        const registryKey = `clinihome-sandbox-patients-${selectedDoctor.id}`;
        const registry = JSON.parse(localStorage.getItem(registryKey) || "[]");
        const existingIdx = registry.findIndex((p: any) => p.email === currentUser.email);
        const entry = {
          id: currentUser.id || "patient-demo-id",
          full_name: currentUser.name || "Demo Patient",
          email: currentUser.email,
          lastMessage: userMsgContent,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        if (existingIdx >= 0) {
          registry[existingIdx] = entry;
        } else {
          registry.push(entry);
        }
        localStorage.setItem(registryKey, JSON.stringify(registry));
      } catch (e) {
        console.warn("Failed to update sandbox patient registry:", e);
      }
    }

    // Call API for Doctor AI reply simulation
    setLoading(true);
    try {
      let patientProfile = null;
      try {
        const storedProfile = localStorage.getItem("clinihome-patient-profile");
        if (storedProfile) {
          patientProfile = JSON.parse(storedProfile);
        }
      } catch (e) {}

      let token = "sandbox";
      try {
        const sessionStr = localStorage.getItem("clinihome-session");
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          token = session.email || "sandbox";
        }
      } catch (e) {}

      const response = await fetch("/api/chat/doctor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: localHistory,
          doctorProfile: {
            id: selectedDoctor.id,
            full_name: selectedDoctor.full_name,
            specialization: selectedDoctor.specialization,
          },
          patientProfile: patientProfile,
        }),
      });

      const data = await response.json();
      if (data.reply) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender_id: selectedDoctor.id,
          content: data.reply,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          localStorage.setItem(mockKey, JSON.stringify(updated));
          return updated;
        });

        // Save AI reply to DB if not sandbox
        if (!isSandboxFlow && chatId) {
          try {
            await supabase.from("messages").insert({
              chat_id: chatId,
              sender_id: selectedDoctor.id,
              content: data.reply,
            });
          } catch (dbErr) {
            console.warn("Failed to write AI reply to database:", dbErr);
          }
        }
      }
    } catch (err) {
      console.error("Failed to get doctor AI response:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 112px)",
        background: "var(--bg-surface)",
        display: "flex",
        padding: "24px",
        gap: "20px",
      }}
      className="chat-container-layout"
    >
      {/* Left Panel: Doctors List */}
      <div
        className={`left-sidebar ${selectedDoctor ? "mobile-hidden" : ""}`}
        style={{
          width: "320px",
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
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} style={{ color: "var(--purple-primary)" }} />
            Active Doctors
          </h3>
          {dbStatus && (
            <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
              🟢 {dbStatus}
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {doctors.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoctor(doc)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                background: selectedDoctor?.id === doc.id ? "rgba(124,58,237,0.06)" : "transparent",
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
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {getInitials(doc.full_name)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {doc.full_name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-secondary)" }}>
                  {doc.specialization}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat Stream */}
      <div
        className={`chat-feed-panel ${!selectedDoctor ? "mobile-hidden" : ""}`}
        style={{
          flex: 1,
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
        {selectedDoctor ? (
          <>
            {/* Active Header */}
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
                onClick={() => setSelectedDoctor(null)}
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
                  background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                {getInitials(selectedDoctor.full_name)}
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {selectedDoctor.full_name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-secondary)" }}>
                  Active Consultation • {selectedDoctor.specialization}
                </p>
              </div>
            </div>

            {/* Message History */}
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
                const isMe = msg.sender_id === (currentUser?.id || "patient-demo-id");
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
              {loading && (
                <div style={{ alignSelf: "flex-start", fontSize: "11px", color: "var(--text-secondary)" }}>
                  typing reply...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input */}
            <form
              onSubmit={handleSendMessage}
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
                placeholder={`Type a message to ${selectedDoctor.full_name}...`}
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
              No Active Conversation
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", maxWidth: "320px" }}>
              Select a doctor from the sidebar and send a message to start your consultation.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .chat-input:focus {
          border-color: var(--purple-primary) !important;
          box-shadow: 0 0 0 2px var(--purple-glow);
        }
        @media (max-width: 768px) {
          .chat-container-layout {
            flex-direction: column !important;
            padding: 12px !important;
            height: auto !important;
            min-height: calc(100vh - 64px) !important;
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
