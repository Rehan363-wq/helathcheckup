"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import {
  loadProfile, loadTodayLog, loadWeekHistory,
  buildHealthDataForAI, loadChatHistory, saveChatHistory,
  type HealthChatMessage,
} from "@/lib/health-tracker";
import { loadPatientProfile } from "@/lib/user-profile";

export default function HealthCoachChat() {
  const [messages, setMessages] = useState<HealthChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "Give me today's summary",
    "I had 2 rotis, dal, and yogurt for lunch — how was it?",
    "I went for a 30-minute walk",
    "I haven't been sleeping well lately",
    "Give me weekly insights",
  ];

  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([{
        id: "initial",
        role: "assistant",
        content: "Hello! 🙏 I am your AI Health Coach. Share details about your diet, workouts, sleep, or symptoms, and I will provide personalized health insights. Shall we begin? 💪",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: HealthChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Build context
      const profile = loadProfile();
      const todayLog = loadTodayLog();
      const weekHistory = loadWeekHistory();
      const healthData = buildHealthDataForAI(profile, todayLog, weekHistory);
      const patientProfile = loadPatientProfile();
      const lang = patientProfile?.language_preference || "hinglish";

      // Only send last 10 messages as history to keep token count reasonable
      const recentHistory = updatedMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const sessionStr = localStorage.getItem("clinihome-session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const token = session?.email || "sandbox";

      const res = await fetch("/api/tracker/coach", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ healthData, messages: recentHistory, languagePreference: lang }),
      });

      if (!res.ok) throw new Error("Failed to call Health Coach");
      const data = await res.json();

      let replyContent = data.reply || "I couldn't process that. Please try again.";
      if (data.tip) replyContent += `\n\n💡 Tip: ${data.tip}`;
      if (data.daily_score) {
        let scoreLabel = "Today's Health Score";
        if (lang === "hindi") scoreLabel = "आज का हेल्थ स्कोर";
        else if (lang === "hinglish") scoreLabel = "Aaj ka Health Score";
        replyContent += `\n\n📊 ${scoreLabel}: ${data.daily_score}/10 🌟`;
      }

      const assistantMessage: HealthChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toISOString(),
      };

      // Check for alert
      let alertMessage: HealthChatMessage | null = null;
      if (data.alert) {
        alertMessage = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `⚠️ ${data.alert}`,
          timestamp: new Date().toISOString(),
        };
      }

      const newMessages = [...updatedMessages, assistantMessage, ...(alertMessage ? [alertMessage] : [])];
      setMessages(newMessages);
      saveChatHistory(newMessages);
    } catch (err) {
      const errorMessage: HealthChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I cannot generate a response right now. There might be a server issue. Please try again.",
        timestamp: new Date().toISOString(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      saveChatHistory(newMessages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 220px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            CliniHome Health Coach
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", opacity: 0.85, margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={12} /> Gemini 2.5 Flash • Personalized Health Insights
          </p>
        </div>
      </div>

      {/* Messages Stream */}
      <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "18px", background: "rgba(0,0,0,0.01)" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", width: "100%" }}>
            <div style={{ display: "flex", gap: "10px", maxWidth: "85%", flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
              {/* Icon */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: msg.role === "user" ? "rgba(59,130,246,0.1)" : "rgba(16,185,129,0.1)",
                color: msg.role === "user" ? "#3B82F6" : "#10B981",
              }}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div style={{
                background: msg.role === "user" ? "#3B82F6" : msg.content.startsWith("⚠️") ? "rgba(245,158,11,0.06)" : "var(--bg-card)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                padding: "14px 18px",
                borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                fontSize: "14px", fontFamily: "var(--font-body)", lineHeight: 1.6,
                border: msg.role === "user" ? "none" : msg.content.startsWith("⚠️") ? "1px solid rgba(245,158,11,0.2)" : "1px solid var(--border)",
                boxShadow: msg.role === "user" ? "0 4px 12px rgba(59,130,246,0.15)" : "var(--shadow-card)",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Loader */}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(16,185,129,0.1)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={16} />
            </div>
            <div style={{ display: "flex", gap: "4px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <span style={{ width: "6px", height: "6px", background: "#3B82F6", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate" }}></span>
              <span style={{ width: "6px", height: "6px", background: "#3B82F6", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate 0.2s" }}></span>
              <span style={{ width: "6px", height: "6px", background: "#3B82F6", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate 0.4s" }}></span>
            </div>
          </div>
        )}

        {/* Starter Prompts */}
        {messages.length <= 1 && !loading && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 4px" }}>
              Try asking:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {starterPrompts.map((prompt) => (
                <button key={prompt} onClick={() => handleSend(prompt)} style={{
                  padding: "10px 16px", background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "100px", color: "var(--text-secondary)", fontFamily: "var(--font-body)",
                  fontSize: "12px", cursor: "pointer", transition: "all 0.2s", boxShadow: "var(--shadow-card)",
                  fontWeight: 500,
                }}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div style={{ padding: "8px 24px", background: "rgba(245,158,11,0.04)", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
        <ShieldAlert size={14} style={{ color: "var(--accent-yellow)", flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "var(--text-secondary)", margin: 0 }}>
          <strong>Disclaimer:</strong> The Health Coach provides wellness tracking and tips, not medical diagnoses. For serious symptoms, consult a doctor.
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
        style={{ padding: "16px 24px", background: "var(--bg-card)", borderTop: "1px solid var(--border)", display: "flex", gap: "12px" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Share your diet, walk, sleep, or wellness details..."
          className="chat-input"
          style={{
            flex: 1, padding: "12px 18px", borderRadius: "12px", border: "1px solid var(--border)",
            background: "var(--bg-card)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
            fontSize: "14px", outline: "none", transition: "all 0.2s ease",
          }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "#3B82F6", color: "white", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
          transition: "opacity 0.2s", opacity: loading || !input.trim() ? 0.7 : 1,
        }}>
          <Send size={18} />
        </button>
      </form>
      <style jsx>{`
        .chat-input:focus {
          border-color: var(--purple-primary) !important;
          box-shadow: 0 0 0 2px var(--purple-glow);
        }
      `}</style>
    </div>
  );
}
