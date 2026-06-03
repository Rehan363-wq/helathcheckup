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
  Clock,
  Star,
  Users,
  Building,
  TrendingUp,
  Sliders,
  ChevronDown
} from "lucide-react";

export default function LandingPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("james");
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div style={{ background: "var(--bg-surface)", minHeight: "100vh", color: "var(--text-primary)", transition: "background 0.3s ease", overflowX: "hidden" }}>
      
      {/* Visual background accents */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "800px",
          background: "radial-gradient(circle at 50% -100px, rgba(59, 130, 246, 0.05) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ================= HERO SECTION ================= */}
      <section
        id="hero-section"
        style={{
          position: "relative",
          padding: "100px 24px 120px",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          alignItems: "center",
          gap: "80px",
          zIndex: 1,
        }}
        className="hero-grid-layout"
      >
        {/* Left Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Pill Badge */}
          <div
            className="animate-fade-in-up"
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
              padding: "6px 14px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#3B82F6",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} className="glow-point"></span>
            <span>Reliable Solutions for Everyday Care</span>
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.75rem, 5.5vw, 4.25rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>Better care</span> for <br />
            every patient <br />
            in one place
          </h1>

          {/* Description */}
          <p
            className="animate-fade-in-up animation-delay-100"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "520px",
            }}
          >
            From daily wellness to advanced health insights, our platform is designed to support you — wherever you are on your health journey.
          </p>

          {/* Action Buttons */}
          <div
            className="animate-fade-in-up animation-delay-200"
            style={{
              display: "flex",
              gap: "16px",
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
                background: "#3B82F6",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                padding: "14px 32px",
                borderRadius: "100px",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
                transition: "all 0.3s ease",
              }}
              className="hover-scale"
            >
              Book an appointment
            </Link>

            <Link
              href="/doctors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "transparent",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                padding: "14px 32px",
                borderRadius: "100px",
                textDecoration: "none",
                border: "1px solid var(--border)",
                transition: "all 0.3s ease",
              }}
              className="hover-card-border"
            >
              Learn more
            </Link>
          </div>

        </div>

        {/* Right Graphic: Glass Heart with Callout Labels */}
        <div
          className="animate-fade-in-up animation-delay-200"
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Main Glass Heart Image */}
          <div style={{ position: "relative", width: "100%", maxWidth: "520px" }}>
            <img 
              src="/glass_heart_flowers.png" 
              alt="Glassmorphic Heart with Flowers" 
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 20px 50px rgba(59, 130, 246, 0.1))",
              }}
              className="animate-float"
            />

            {/* Label 1: Fast Diagnosis */}
            <div
              style={{
                position: "absolute",
                top: "28%",
                left: "2%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                zIndex: 10,
              }}
              className="heart-label-container"
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E3A8A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Fast Diagnosis</span>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#3B82F6" }}></span>
              </div>
              {/* Pointing Line and Dot */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "40px", height: "1px", background: "rgba(59, 130, 246, 0.4)" }}></div>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} className="glow-point"></div>
              </div>
            </div>

            {/* Label 2: High-Quality Care */}
            <div
              style={{
                position: "absolute",
                top: "55%",
                left: "-12%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                zIndex: 10,
              }}
              className="heart-label-container"
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E3A8A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>High-Quality Care</span>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#3B82F6" }}></span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "30px", height: "1px", background: "rgba(59, 130, 246, 0.4)" }}></div>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} className="glow-point"></div>
              </div>
            </div>

            {/* Label 3: Diagnosis Accuracy */}
            <div
              style={{
                position: "absolute",
                bottom: "22%",
                right: "-2%",
                display: "flex",
                alignItems: "center",
                flexDirection: "row-reverse",
                gap: "8px",
                zIndex: 10,
              }}
              className="heart-label-container"
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1E3A8A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>Diagnosis Accuracy</span>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#3B82F6" }}></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse" }}>
                <div style={{ width: "35px", height: "1px", background: "rgba(59, 130, 246, 0.4)" }}></div>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B82F6" }} className="glow-point"></div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ================= BENTO GRID SECTION ================= */}
      <section
        id="features-section"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 24px 100px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: "64px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3B82F6" }}>Features</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: "8px",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            Everything you need for <br />
            <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>modern healthcare</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "580px",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Our platform combines cutting-edge AI with a human-first approach — so every patient receives care that's personal, precise, and proactive.
          </p>
        </div>

        {/* Feature Cards Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 1fr 1fr 1fr",
            gap: "24px",
          }}
          className="bento-row-layout"
        >
          {/* Card 1: AI-Powered Diagnostics */}
          <div
            style={{
              background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
              borderRadius: "24px",
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "360px",
              color: "white",
              boxShadow: "0 20px 40px rgba(29, 79, 216, 0.15)",
              position: "relative",
              overflow: "hidden",
            }}
            className="smooth-transition hover-scale"
          >
            <div
              style={{
                position: "absolute",
                top: "-10%",
                right: "-10%",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            
            <div>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FFFFFF", marginBottom: "32px", opacity: 0.8 }}></div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.2 }}>
                AI-Powered Diagnostics
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                Get instant, data-backed insights that help physicians detect conditions earlier and with greater accuracy than ever before.
              </p>
            </div>

            <Link href="/health-bot" style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "white",
              color: "#1E3A8A",
              padding: "10px 22px",
              borderRadius: "100px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
              marginTop: "24px",
              transition: "transform 0.2s",
            }} className="hover-scale">
              Learn more
            </Link>
          </div>

          {/* Card 2: Smart Appointment Booking */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "36px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "360px",
            }}
            className="hover-premium"
          >
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "32px" }}>02</span>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
                Smart Appointment Booking
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Book, reschedule, or cancel visits in seconds. Our scheduling engine matches patients with the right specialist — automatically.
              </p>
            </div>
            <div></div>
          </div>

          {/* Card 3: 24/7 Patient Support */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "36px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "360px",
            }}
            className="hover-premium"
          >
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "32px" }}>03</span>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
                24/7 Patient Support
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Round-the-clock access to medical advisors, chat assistants, and follow-up care — so no question ever goes unanswered.
              </p>
            </div>
            <div></div>
          </div>

          {/* Card 4: Bank-Level Data Security */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "36px 30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "360px",
            }}
            className="hover-premium"
          >
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "32px" }}>04</span>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", fontWeight: 700, margin: "0 0 12px", color: "var(--text-primary)" }}>
                Bank-Level Data Security
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                All medical records are encrypted end-to-end fully HIPAA-compliant. Your privacy is our highest priority.
              </p>
            </div>
            <div></div>
          </div>

        </div>
      </section>

      {/* ================= ABOUT US (TEAM SECTION) ================= */}
      <section
        id="about-us"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 24px 100px",
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3B82F6" }}>About Us</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: "8px",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            A team that helps <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>improve</span> your health
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            Doctors and other specialists who will be available whenever you need help.
          </p>
        </div>

        {/* --- Doctors Row --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: "48px",
            alignItems: "start",
            marginBottom: "80px",
          }}
          className="team-row-layout"
        >
          {/* Label Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#3B82F6" }}>Doctors</h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
              People that help advancing medical research on a daily basis.
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="team-cards-grid">
            
            {/* Dr. James Mitchell */}
            <div
              onClick={() => setSelectedDoctor("james")}
              style={{
                background: selectedDoctor === "james" ? "#1E3A8A" : "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                cursor: "pointer",
                color: selectedDoctor === "james" ? "white" : "var(--text-primary)",
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              {selectedDoctor === "james" ? (
                /* Description view */
                <div style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/dr_james_mitchell.png" alt="Dr. James Mitchell" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Dr. James Mitchell</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Cardiologist</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: "24px 0" }}>
                    Dr. Mitchell specializes in the diagnosis and treatment of heart conditions. He is dedicated to helping patients improve their cardiovascular health and overall quality of life.
                  </p>
                  <Link href="/doctors" style={{ fontSize: "12px", fontWeight: 600, color: "#3B82F6", background: "white", padding: "8px 16px", borderRadius: "100px", textDecoration: "none", textAlign: "center" }}>
                    Book Appointment
                  </Link>
                </div>
              ) : (
                /* Regular photo view */
                <>
                  <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                    <img src="/dr_james_mitchell.png" alt="Dr. James Mitchell" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Dr. James Mitchell</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Cardiologist</p>
                  </div>
                </>
              )}
            </div>

            {/* Dr. David Lee */}
            <div
              onClick={() => setSelectedDoctor("david")}
              style={{
                background: selectedDoctor === "david" ? "#1E3A8A" : "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                cursor: "pointer",
                color: selectedDoctor === "david" ? "white" : "var(--text-primary)",
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              {selectedDoctor === "david" ? (
                <div style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/dr_david_lee.png" alt="Dr. David Lee" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Dr. David Lee</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Neurologist</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: "24px 0" }}>
                    Dr. Lee is a leading neurologist specializing in brain mapping and neuro-diagnostics. He ensures accurate clinical assessment for all complex neurological concerns.
                  </p>
                  <Link href="/doctors" style={{ fontSize: "12px", fontWeight: 600, color: "#3B82F6", background: "white", padding: "8px 16px", borderRadius: "100px", textDecoration: "none", textAlign: "center" }}>
                    Book Appointment
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                    <img src="/dr_david_lee.png" alt="Dr. David Lee" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Dr. David Lee</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Neurologist</p>
                  </div>
                </>
              )}
            </div>

            {/* Dr. Aisha Brown */}
            <div
              onClick={() => setSelectedDoctor("aisha")}
              style={{
                background: selectedDoctor === "aisha" ? "#1E3A8A" : "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                cursor: "pointer",
                color: selectedDoctor === "aisha" ? "white" : "var(--text-primary)",
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              {selectedDoctor === "aisha" ? (
                <div style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/dr_aisha_brown.png" alt="Dr. Aisha Brown" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Dr. Aisha Brown</h4>
                      <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Dermatologist</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: "24px 0" }}>
                    Dr. Aisha specializes in photodiagnosis and aesthetic dermatology, helping diagnose skin rashes, eczema, dryness, and complex lesions accurately.
                  </p>
                  <Link href="/doctors" style={{ fontSize: "12px", fontWeight: 600, color: "#3B82F6", background: "white", padding: "8px 16px", borderRadius: "100px", textDecoration: "none", textAlign: "center" }}>
                    Book Appointment
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                    <img src="/dr_aisha_brown.png" alt="Dr. Aisha Brown" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Dr. Aisha Brown</h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Dermatologist</p>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* --- Advisors Row --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gap: "48px",
            alignItems: "start",
          }}
          className="team-row-layout"
        >
          {/* Label Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "12px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#3B82F6" }}>Our Select Advisors</h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
              Advisors that support us with deep medical knowledge and strategy.
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }} className="team-cards-grid">
            
            {/* Michael Patel */}
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                <img src="/michael_patel.png" alt="Michael Patel" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Michael Patel</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Clinical Strategy</p>
              </div>
            </div>

            {/* Sarah Johnson */}
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                <img src="/sarah_johnson.png" alt="Sarah Johnson" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Sarah Johnson</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Bioinformatics</p>
              </div>
            </div>

            {/* Lisa Martinez */}
            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              className="smooth-transition hover-scale"
            >
              <div style={{ width: "100%", height: "240px", overflow: "hidden", position: "relative" }}>
                <img src="/lisa_martinez.png" alt="Lisa Martinez" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "20px" }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Lisa Martinez</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>Clinical Operations Specialist</p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ================= MEASURE IMPACT (METRICS SECTION) ================= */}
      <section
        id="metrics-section"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 24px 100px",
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3B82F6" }}>By the Numbers</span>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginTop: "8px",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Healthcare impact you can actually <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>measure</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "var(--text-secondary)",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            Healthcare is trust built by leading hospitals and clinics across 20 countries. Here is what the data says.
          </p>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr 1.25fr",
            gap: "24px",
          }}
          className="metrics-row-layout"
        >
          {/* Card 1: Patient Satisfaction */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "340px",
            }}
            className="hover-premium"
          >
            <div>
              {/* Trust Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
                {/* Overlapping avatars */}
                <div style={{ display: "flex", alignItems: "center", marginLeft: "-6px" }}>
                  <img src="/dr_james_mitchell.png" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid var(--bg-card)", objectFit: "cover" }} />
                  <img src="/dr_aisha_brown.png" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid var(--bg-card)", objectFit: "cover", marginLeft: "-8px" }} />
                  <img src="/sarah_johnson.png" style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid var(--bg-card)", objectFit: "cover", marginLeft: "-8px" }} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-secondary)" }}>15,000+ patients trust us</span>
              </div>
              
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#3B82F6" }}>• Patient Satisfaction</span>
              <h3 style={{ fontSize: "72px", fontWeight: 800, margin: "8px 0 12px", color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                95%
              </h3>
            </div>
            
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              We measure satisfaction at every stage — from first consultation to full recovery.
            </p>
          </div>

          {/* Card 2: Partner Clinics */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "340px",
            }}
            className="hover-premium"
          >
            <div>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#3B82F6", display: "block", marginBottom: "28px" }}>• Partner Clinics</span>
              <h3 style={{ fontSize: "72px", fontWeight: 800, margin: "0 0 12px", color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                50+
              </h3>
            </div>

            <div>
              <p style={{ margin: "0 0 24px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Our network ensures patients always have access to the right specialist at the right time.
              </p>
              
              <Link
                href="/doctors"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#3B82F6",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "13px",
                  padding: "10px 24px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                  width: "100%",
                }}
              >
                Book an appointment
              </Link>
            </div>
          </div>

          {/* Card 3: Diagnosis Accuracy */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "40px 32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "340px",
              position: "relative",
            }}
            className="hover-premium"
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#3B82F6" }}>• Diagnosis Accuracy</span>
                
                <div style={{ display: "flex", alignItems: "center", gap: "4px", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", background: "rgba(0,0,0,0.02)" }}>
                  <span>Last 7 Days</span>
                  <ChevronDown size={12} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <h3 style={{ fontSize: "72px", fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                  82%
                </h3>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, maxWidth: "120px" }}>
                  Early and precise detection leads to better outcomes.
                </span>
              </div>
            </div>

            {/* Wavy Chart Visual */}
            <div style={{ width: "100%", height: "90px", marginTop: "20px" }}>
              <svg viewBox="0 0 200 60" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                {/* Gradient stroke */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
                  </linearGradient>
                </defs>
                {/* Wavy trendline */}
                <path
                  d="M 0 45 C 30 50, 45 15, 70 25 C 95 35, 110 5, 140 18 C 170 30, 185 38, 200 12"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Pulse dots */}
                <circle cx="70" cy="25" r="4.5" fill="#3B82F6" stroke="white" strokeWidth="1.5" />
                <circle cx="140" cy="18" r="4.5" fill="#3B82F6" stroke="white" strokeWidth="1.5" />
                {/* Background shading */}
                <path
                  d="M 0 45 C 30 50, 45 15, 70 25 C 95 35, 110 5, 140 18 C 170 30, 185 38, 200 12 L 200 60 L 0 60 Z"
                  fill="url(#chartGrad)"
                  opacity="0.15"
                />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* ================= HOW IT WORKS TIMELINE ================= */}
      <section
        id="timeline-section"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "80px 24px 100px",
          borderTop: "1px solid var(--border)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
          className="timeline-grid-layout"
        >
          {/* Left Side: Steps List */}
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3B82F6" }}>Simple Process</span>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginTop: "8px",
                marginBottom: "20px",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              Up and running in <br />
              <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>three</span> easy steps
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "48px",
                maxWidth: "460px",
              }}
            >
              No complicated setup. No paperwork headaches. Just signup, book, and get the care you deserve.
            </p>

            {/* Steps timeline block */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px", position: "relative" }}>
              {/* Vertical line connector */}
              <div style={{ position: "absolute", left: "12px", top: "24px", bottom: "24px", width: "1px", borderLeft: "2px dashed var(--border)" }} />
              
              {/* Step 1 */}
              <div style={{ display: "flex", gap: "24px", position: "relative", cursor: "pointer" }} onClick={() => setActiveStep(1)}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: activeStep === 1 ? "#3B82F6" : "var(--bg-card)", border: activeStep === 1 ? "none" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: activeStep === 1 ? "white" : "var(--text-secondary)", zIndex: 2 }} className="smooth-transition">
                  1
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: activeStep === 1 ? "#3B82F6" : "var(--text-primary)" }} className="smooth-transition">
                    Create your health profile
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "400px" }}>
                    Enter your medical history and insurance details once. We keep everything safe and accessible.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", gap: "24px", position: "relative", cursor: "pointer" }} onClick={() => setActiveStep(2)}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: activeStep === 2 ? "#3B82F6" : "var(--bg-card)", border: activeStep === 2 ? "none" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: activeStep === 2 ? "white" : "var(--text-secondary)", zIndex: 2 }} className="smooth-transition">
                  2
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: activeStep === 2 ? "#3B82F6" : "var(--text-primary)" }} className="smooth-transition">
                    Book a visit or consultation
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "400px" }}>
                    Choose an in-person visit, video call, or on-demand chat with a verified specialist — at your convenience.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: "flex", gap: "24px", position: "relative", cursor: "pointer" }} onClick={() => setActiveStep(3)}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: activeStep === 3 ? "#3B82F6" : "var(--bg-card)", border: activeStep === 3 ? "none" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: activeStep === 3 ? "white" : "var(--text-secondary)", zIndex: 2 }} className="smooth-transition">
                  3
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 700, color: activeStep === 3 ? "#3B82F6" : "var(--text-primary)" }} className="smooth-transition">
                    Receive insights & follow-up care
                  </h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "400px" }}>
                    After every visit, get a personalized health summary, prescriptions, and 24/7 chat support access.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Visual Patient Mockup Dashboard */}
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: "28px",
              border: "1px solid var(--border)",
              padding: "36px",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
            className="smooth-transition hover-scale"
          >
            {/* Interactive title bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "18px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Activity Feed</span>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} className="glow-point"></span>
            </div>

            {/* Mock Item 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: activeStep === 1 ? "rgba(59, 130, 246, 0.04)" : "rgba(0,0,0,0.01)",
                border: activeStep === 1 ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--border)",
                padding: "16px 20px",
                borderRadius: "16px",
              }}
              className="smooth-transition"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <img src="/sarah_johnson.png" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Sarah Mitchell</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>Medical Profile Setup</p>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.08)", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase" }}>Ready</span>
            </div>

            {/* Mock Item 2 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: activeStep === 2 ? "rgba(59, 130, 246, 0.04)" : "rgba(0,0,0,0.01)",
                border: activeStep === 2 ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--border)",
                padding: "16px 20px",
                borderRadius: "16px",
              }}
              className="smooth-transition"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3B82F6" }}>
                  <Stethoscope size={18} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Cardiology consult</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>Tomorrow at 10:30 AM</p>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#3B82F6", background: "rgba(59,130,246,0.08)", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase" }}>Confirmed</span>
            </div>

            {/* Mock Item 3 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: activeStep === 3 ? "rgba(59, 130, 246, 0.04)" : "rgba(0,0,0,0.01)",
                border: activeStep === 3 ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--border)",
                padding: "16px 20px",
                borderRadius: "16px",
              }}
              className="smooth-transition"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(236,72,153,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EC4899" }}>
                  <FileText size={18} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 700 }}>Health summary ready</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>10 Aug 2026</p>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#EC4899", background: "rgba(236,72,153,0.08)", padding: "4px 10px", borderRadius: "100px", textTransform: "uppercase" }}>New</span>
            </div>

          </div>

        </div>
      </section>

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 24px 120px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
            borderRadius: "32px",
            padding: "80px 64px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            alignItems: "center",
            gap: "48px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            overflow: "hidden",
            position: "relative",
          }}
          className="cta-grid-layout"
        >
          {/* Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              left: "-50px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Left CTA Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", zIndex: 2 }}>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
                fontWeight: 800,
                color: "white",
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Ready to take <br />
              control of your <span className="serif-italic" style={{ color: "#3B82F6", fontWeight: 400 }}>health</span>?
            </h2>
            
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/health-bot"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#3B82F6",
                  color: "white",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "15px",
                  padding: "14px 32px",
                  borderRadius: "100px",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)",
                  transition: "all 0.3s ease",
                }}
                className="hover-scale"
              >
                Book an appointment
              </Link>
            </div>
          </div>

          {/* Right CTA Image Overlay */}
          <div style={{ position: "relative", display: "flex", justifyContent: "flex-end", zIndex: 2 }} className="cta-right-image">
            <div style={{ width: "280px", height: "280px", borderRadius: "50%", overflow: "hidden", border: "6px solid rgba(255,255,255,0.06)", boxShadow: "0 16px 32px rgba(0,0,0,0.3)" }}>
              <img src="/dr_aisha_brown.png" alt="Smiling Doctor" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>

        </div>
      </section>

      {/* ================= EMERGENCY WARNING ================= */}
      <section
        style={{
          maxWidth: "1280px",
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

      {/* ================= FOOTER ================= */}
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

      {/* Embedded CSS overrides for custom responsive behaviors */}
      <style jsx global>{`
        .hover-scale {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hover-scale:hover {
          transform: translateY(-4px) scale(1.02) !important;
          box-shadow: 0 16px 32px rgba(59, 130, 246, 0.25) !important;
        }
        .hover-card-border:hover {
          border-color: #3B82F6 !important;
          background: rgba(59, 130, 246, 0.02) !important;
        }

        @media (max-width: 992px) {
          .hero-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 56px !important;
            padding-top: 60px !important;
            padding-bottom: 80px !important;
          }
          .heart-label-container {
            display: none !important; /* Hide label arrows on small viewports for neatness */
          }
          .bento-row-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .team-row-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .team-cards-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .metrics-row-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .timeline-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
          .cta-grid-layout {
            grid-template-columns: 1fr !important;
            padding: 48px 32px !important;
            text-align: center !important;
            justify-items: center !important;
          }
          .cta-right-image {
            justify-content: center !important;
            margin-top: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
