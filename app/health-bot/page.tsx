"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Bot, User, Stethoscope, Clock, ShieldAlert, Sparkles } from "lucide-react";
import { buildPatientContextForAI } from "@/lib/user-profile";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedSpecialization?: string | null;
  suggestedMedicine?: string | null;
}

export default function HealthBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Hello! I am CliniHome AI Health Bot. What health concerns do you have, or which medication details would you like to check? Feel free to describe them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPrompts = [
    "I have itchy, red ring-shaped rashes on my skin",
    "I have a mild fever and headache since last night",
    "What are the precautions and guidelines for taking Paracetamol?",
    "What does a low hemoglobin count in a CBC report mean?",
  ];

  useEffect(() => {
    document.title = "AI Health Bot — CliniHome AI";
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const sessionStr = localStorage.getItem("clinihome-session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const token = session?.email || "sandbox";

      const res = await fetch("/api/chat/bot", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages: history, patientContext: buildPatientContextForAI() }),
      });

      if (!res.ok) throw new Error("Failed to call chatbot");

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          recommendedSpecialization: data.recommendedSpecialization,
          suggestedMedicine: data.suggestedMedicine,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I cannot reply right now. There might be a server issue. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "var(--bg-surface)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "calc(100vh - 140px)",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 24px",
            background: "linear-gradient(135deg, #7C3AED, #EC4899)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={24} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
              }}
            >
              CliniHome Health Assistant
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                opacity: 0.9,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles size={12} /> Gemini 2.5 Flash Triage System
            </p>
          </div>
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            background: "rgba(0,0,0,0.01)",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "80%",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: msg.role === "user" ? "rgba(124,58,237,0.1)" : "rgba(236,72,153,0.1)",
                    color: msg.role === "user" ? "var(--purple-primary)" : "var(--accent-pink)",
                  }}
                >
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                {/* Text Bubble */}
                <div
                  style={{
                    background: msg.role === "user" ? "linear-gradient(135deg, #7C3AED, #EC4899)" : "var(--bg-card)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    padding: "14px 18px",
                    borderRadius: msg.role === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                    fontSize: "14px",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.5,
                    border: msg.role === "user" ? "none" : "1px solid var(--border)",
                    boxShadow: msg.role === "user" ? "0 4px 12px rgba(124,58,237,0.2)" : "var(--shadow-card)",
                  }}
                >
                  {msg.content}
                </div>
              </div>

              {/* Dynamic Triage Actions */}
              {msg.role === "assistant" && (msg.recommendedSpecialization || msg.suggestedMedicine) && (
                <div
                  className="animate-pop-in"
                  style={{
                    marginLeft: "42px",
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    maxWidth: "80%",
                  }}
                >
                  {/* Doctor Referral Button */}
                  {msg.recommendedSpecialization && (
                    <Link
                      href={`/doctors?specialization=${msg.recommendedSpecialization}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        background: "rgba(124,58,237,0.08)",
                        border: "1px solid rgba(124,58,237,0.2)",
                        borderRadius: "10px",
                        color: "var(--purple-primary)",
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <Stethoscope size={16} />
                      Find {msg.recommendedSpecialization} Doctors
                    </Link>
                  )}

                  {/* Medicine Reminder Button */}
                  {msg.suggestedMedicine && (
                    <Link
                      href={`/reminders?medicine=${encodeURIComponent(msg.suggestedMedicine)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        background: "rgba(16,185,129,0.08)",
                        border: "1px solid rgba(16,185,129,0.2)",
                        borderRadius: "10px",
                        color: "#10b981",
                        fontFamily: "var(--font-body)",
                        fontSize: "13px",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <Clock size={16} />
                      Set Reminder for {msg.suggestedMedicine}
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loader */}
          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(236,72,153,0.1)",
                  color: "var(--accent-pink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={16} />
              </div>
              <div style={{ display: "flex", gap: "4px", padding: "10px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--purple-primary)", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate" }}></span>
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--purple-primary)", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate 0.2s" }}></span>
                <span className="dot" style={{ width: "6px", height: "6px", background: "var(--purple-primary)", borderRadius: "50%", animation: "dotFill 0.8s infinite alternate 0.4s" }}></span>
              </div>
            </div>
          )}

          {/* Starter Prompts */}
          {messages.length === 1 && !loading && (
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  margin: "0 0 4px",
                }}
              >
                Try these common queries:
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
                className="starter-prompts-grid"
              >
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    style={{
                      padding: "12px 16px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      textAlign: "left",
                      lineHeight: 1.5,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: "var(--shadow-card)",
                    }}
                    className="hover:border-purple-primary"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer bar */}
        <div
          style={{
            padding: "8px 24px",
            background: "rgba(245,158,11,0.05)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ShieldAlert size={14} style={{ color: "var(--accent-yellow)", flexShrink: 0 }} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "11px",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            <strong>Disclaimer:</strong> AI Health Bot does not provide diagnosis. If symptoms worsen, please consult a certified doctor.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          style={{
            padding: "16px 24px",
            background: "var(--bg-card)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "12px",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message here..."
            aria-label="Type your message here"
            className="chat-input"
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #7C3AED, #EC4899)",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
              transition: "opacity 0.2s",
              opacity: loading || !input.trim() ? 0.7 : 1,
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style jsx>{`
        .chat-input:focus {
          border-color: var(--purple-primary) !important;
          box-shadow: 0 0 0 2px var(--purple-glow);
        }
        @media (max-width: 768px) {
          .starter-prompts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
