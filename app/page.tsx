"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  Camera, 
  FileText, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Bot, 
  MessageSquare, 
  Bell, 
  Heart, 
  ChevronRight, 
  Plus, 
  Check, 
  Stethoscope,
  Clock
} from "lucide-react";

export default function LandingPage() {
  const [activeSimulatorTab, setActiveSimulatorTab] = useState<"triage" | "scan" | "reminders">("triage");

  return (
    <div style={{ background: "var(--bg-surface)", minHeight: "100vh", color: "var(--text-primary)", transition: "background 0.3s ease", overflowX: "hidden" }}>
      
      {/* Visual background accents for refined layout */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "600px",
          background: "radial-gradient(circle at 50% -100px, rgba(124,58,237,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ===== HERO SECTION ===== */}
      <section
        id="hero-section"
        style={{
          position: "relative",
          padding: "80px 24px 100px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          alignItems: "center",
          gap: "64px",
          zIndex: 1,
        }}
        className="hero-grid-layout"
      >
        {/* Left: Headline & Description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Pill Badge */}
          <div
            className="animate-fade-in-up"
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              padding: "6px 14px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--purple-primary)",
            }}
          >
            <Sparkles size={14} />
            <span>Smart Care Coordinator</span>
          </div>

          {/* Heading */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Your complete healthcare flow, <br />
            <span
              style={{
                background: "linear-gradient(135deg, #7C3AED 10%, #EC4899 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              powered by AI.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="animate-fade-in-up animation-delay-100"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "17px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "540px",
            }}
          >
            Symptom screening se lekar medicine reminders aur verified specialists se direct consultations tak — HealFlow AI coordinate karta hai aapki health journey ka har kadam.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-in-up animation-delay-200"
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "8px",
            }}
          >
            <Link
              href="/health-bot"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                padding: "14px 28px",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.25)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              className="hover-scale"
            >
              <Bot size={18} />
              AI Chatbot Triage
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/scan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "var(--bg-card)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                padding: "14px 28px",
                borderRadius: "12px",
                textDecoration: "none",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
                transition: "all 0.2s ease",
              }}
              className="hover-card-border"
            >
              <Camera size={18} />
              Skin Analyzer
            </Link>
          </div>

          {/* Trust points */}
          <div
            className="animate-fade-in-up animation-delay-300"
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              marginTop: "16px",
              borderTop: "1px solid var(--border)",
              paddingTop: "24px",
            }}
          >
            {[
              { text: "Secure & Encrypted", desc: "GDPR Compliant Data" },
              { text: "Verified Doctors", desc: "Expert Consultations" },
              { text: "Gemini 2.5 Engine", desc: "Advanced Medical Triage" }
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{item.text}</span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.desc}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Interactive Flow Simulator Dashboard */}
        <div
          className="animate-fade-in-up animation-delay-200"
          style={{
            background: "var(--bg-card)",
            borderRadius: "24px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            position: "relative",
          }}
        >
          {/* Simulator Tab Buttons */}
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.03)",
              padding: "4px",
              borderRadius: "12px",
              gap: "4px",
            }}
          >
            {[
              { id: "triage", label: "💬 Symptom Chat", color: "#7C3AED" },
              { id: "scan", label: "📸 Skin Scan", color: "#EC4899" },
              { id: "reminders", label: "⏰ Reminders", color: "#10B981" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSimulatorTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: activeSimulatorTab === tab.id ? "var(--bg-surface)" : "transparent",
                  color: activeSimulatorTab === tab.id ? tab.color : "var(--text-secondary)",
                  boxShadow: activeSimulatorTab === tab.id ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Simulator Display Panel */}
          <div
            style={{
              background: "rgba(0,0,0,0.01)",
              borderRadius: "16px",
              border: "1px dashed var(--border)",
              padding: "20px",
              minHeight: "260px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {activeSimulatorTab === "triage" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end", maxWidth: "80%" }}>
                  <div style={{ background: "linear-gradient(135deg, #7C3AED, #EC4899)", color: "white", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", fontSize: "12px", fontFamily: "var(--font-body)" }}>
                    Sar mein dard hai aur halka bukhar lag raha hai.
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px", alignSelf: "flex-start", maxWidth: "85%" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(124, 58, 237, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px" }}>🤖</div>
                  <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "10px 14px", borderRadius: "14px 14px 14px 2px", fontSize: "12px", lineHeight: 1.4, fontFamily: "var(--font-body)" }}>
                    Ye viral temperature ho sakta hai. Agar bukhar normal se upar jaye, toh **General Physician** ko consult karein. Paracetamol check-out button daba kar dosage guidelines padhein.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", paddingLeft: "36px", marginTop: "4px" }}>
                  <Link href="/doctors?specialization=General+Physician" style={{ fontSize: "11px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", background: "rgba(124, 58, 237, 0.08)", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Stethoscope size={12} /> Consult Doctor
                  </Link>
                  <Link href="/reminders?medicine=Paracetamol" style={{ fontSize: "11px", fontWeight: 600, color: "#10b981", textDecoration: "none", background: "rgba(16, 185, 129, 0.08)", padding: "6px 12px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Bell size={12} /> Set Medicine Reminder
                  </Link>
                </div>
              </div>
            )}

            {activeSimulatorTab === "scan" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "12px", border: "1px solid var(--border)", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    🧴
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#EC4899", background: "rgba(236,72,153,0.08)", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>Analysis Result</span>
                    <h4 style={{ margin: "4px 0 2px", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Contact Dermatitis</h4>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>AI Confidence: 89% | Severity: Low</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Home Guidance: Apply calamine lotion to soothe itching. Wear loose cotton clothes and avoid scratching. Consult a Dermatologist if it worsens.
                </p>
                <Link href="/scan" style={{ alignSelf: "flex-start", fontSize: "12px", fontWeight: 600, color: "#EC4899", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                  Try Skin Scan Simulator <ChevronRight size={14} />
                </Link>
              </div>
            )}

            {activeSimulatorTab === "reminders" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  Your Active Medicine Reminders
                </h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  {[
                    { name: "Paracetamol", time: "08:00 AM", dosage: "1 Tablet", instruction: "After Food" },
                    { name: "Cetirizine", time: "09:00 PM", dosage: "1 Tablet", instruction: "Before Sleep" }
                  ].map((med, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border)", padding: "10px 14px", borderRadius: "10px" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: 700 }}>{med.name}</p>
                        <p style={{ margin: 0, fontSize: "10px", color: "var(--text-secondary)" }}>{med.dosage} • {med.instruction}</p>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "white", background: "#10B981", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={12} /> {med.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Info Bottom Panel */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border)",
              paddingTop: "16px",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Heart size={14} color="#EF4444" />
              Live health flow simulator
            </span>
            <span style={{ fontWeight: 600, color: "var(--purple-primary)" }}>
              Interactive Mockup
            </span>
          </div>

        </div>

      </section>

      {/* ===== THE CORE BENTO GRID SECTION ===== */}
      <section
        id="features-section"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "60px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Explore HealFlow Features
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "var(--text-secondary)",
              maxWidth: "580px",
              margin: "0 auto",
            }}
          >
            Humare smart tools clinical guidance aur real-time data sync ke saath integrated hain. Apna checkup online initiate karein.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridAutoRows: "minmax(200px, auto)",
            gap: "24px",
          }}
          className="bento-grid"
        >
          {/* Bento Item 1: AI Health Bot (Large Row/Col) */}
          <div
            style={{
              gridColumn: "span 2",
              gridRow: "span 2",
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
            className="bento-card hover-glow"
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            
            <div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(124, 58, 237, 0.08)", color: "var(--purple-primary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
                <Bot size={24} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, margin: "0 0 10px", color: "var(--text-primary)" }}>
                🤖 Triage AI Health Bot
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "480px" }}>
                AI chatbot se symptoms share karein. Humara engine Gemini 2.5 use karke triage logic chalta hai jo automatic clinics, specialization levels, aur relevant medicine checks generate karta hai.
              </p>
            </div>

            <div style={{ marginTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--purple-primary)" }}>Powered by Gemini 2.5 Flash</span>
              <Link href="/health-bot" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                Open Health Bot <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Bento Item 2: Skin Scan (1x1) */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="bento-card hover-glow"
          >
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(236, 72, 153, 0.08)", color: "#EC4899", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Camera size={20} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)" }}>
                Skin Analyzer
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Instant skin analysis. Dryness, rashes, ya cuts ki photodiagnosis ke custom recommendations payein.
              </p>
            </div>

            <Link href="/scan" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#EC4899", fontWeight: 600, textDecoration: "none", fontSize: "13px", marginTop: "16px" }}>
              Scan Skin <ArrowRight size={14} />
            </Link>
          </div>

          {/* Bento Item 3: Reminders (1x1) */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="bento-card hover-glow"
          >
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.08)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Bell size={20} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)" }}>
                Meds Reminders
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Automatic notification alerts aur HTML5 voice read-outs. Aapke medicine timings par voice chimes.
              </p>
            </div>

            <Link href="/reminders" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#10B981", fontWeight: 600, textDecoration: "none", fontSize: "13px", marginTop: "16px" }}>
              Set Reminder <ArrowRight size={14} />
            </Link>
          </div>

          {/* Bento Item 4: Report Explainer (1x1) */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            className="bento-card hover-glow"
          >
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.08)", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-primary)" }}>
                Report Explainer
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Blood tests and CBC reports parsing. Clear visual parameters aur ranges breakdowns extract karein.
              </p>
            </div>

            <Link href="/report" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#3B82F6", fontWeight: 600, textDecoration: "none", fontSize: "13px", marginTop: "16px" }}>
              Upload Report <ArrowRight size={14} />
            </Link>
          </div>

          {/* Bento Item 5: Doctor Finder & Chats (2x1 Large Columns) */}
          <div
            style={{
              gridColumn: "span 2",
              background: "var(--bg-card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card)",
              padding: "28px 32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "24px",
            }}
            className="bento-card hover-glow"
          >
            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--purple-primary)", background: "rgba(124,58,237,0.06)", padding: "2px 8px", borderRadius: "6px" }}>Consult Verified Specialists</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, margin: "0 0 6px", color: "var(--text-primary)" }}>
                📍 Near Doctor Finder & Live Chat
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Apne city ke expert doctors search karein. Map pins layout se directions lo, verified doctors se call or secure real-time chats start karo.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link href="/doctors" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--purple-primary)", color: "white", padding: "10px 18px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                Find Doctors
              </Link>
              <Link href="/chat" style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "10px 18px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                Open Chats
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION (SUBTLE STEP TIMELINE) ===== */}
      <section
        id="how-it-works"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "40px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "60px" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              textAlign: "center",
              marginBottom: "48px",
              letterSpacing: "-0.02em",
            }}
          >
            How HealFlow AI Coordinates Your Health
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "40px",
              flexWrap: "wrap",
            }}
            className="how-it-works-timeline"
          >
            {[
              {
                step: "01",
                title: "Symptom Check & Upload",
                desc: "AI bot se chat karein ya skin image/medical lab reports safe drop-box mein upload karein.",
                icon: "💬",
              },
              {
                step: "02",
                title: "Automatic AI Triage",
                desc: "Gemini analysis instant recommendations create karta hai aur specialty requirements detect karta hai.",
                icon: "⚙️",
              },
              {
                step: "03",
                title: "Doctor Connect & Alerts",
                desc: "Verified clinic specialist se chats handle karein aur prescription notifications automatic save karein.",
                icon: "🏥",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                style={{
                  flex: 1,
                  minWidth: "280px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-card)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    {item.icon}
                  </div>
                  
                  {idx < 2 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "24px",
                        left: "64px",
                        right: "-20px",
                        height: "1px",
                        borderTop: "2px dashed var(--border)",
                        zIndex: -1,
                      }}
                      className="timeline-connector"
                    />
                  )}

                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--purple-primary)" }}>Step {item.step}</span>
                </div>
                
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EMERGENCY WARNING SECTION ===== */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(245, 158, 11, 0.05)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <ShieldAlert size={24} style={{ color: "var(--accent-yellow)", flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              ⚠️ Emergency Case and Critical Disclaimer
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              HealFlow AI ek triage aur care coordination tool hai, professional medical diagnosis nahi. Agar aapko koi emergency, severe breathing difficulties, chest pain, ya major bleeding hai, toh please bina delay kiye turant nearest hospital emergency ward visit karein.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            margin: 0,
          }}
        >
          HealFlow AI — Apna Doctor, Apni Zeb Mein • Secure Triage & Consultations © 2026. All rights reserved.
        </p>
      </footer>

      {/* Embedded CSS overrides for custom aesthetic behaviors */}
      <style jsx global>{`
        .hover-scale:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(124, 58, 237, 0.35) !important;
        }
        .hover-card-border:hover {
          border-color: var(--purple-primary) !important;
          background: rgba(124, 58, 237, 0.02) !important;
        }
        .hover-glow:hover {
          border-color: rgba(124, 58, 237, 0.3) !important;
          box-shadow: var(--shadow-purple) !important;
          transform: translateY(-2px);
        }
        .bento-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 992px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding-top: 40px !important;
          }
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-card {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
          .timeline-connector {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
