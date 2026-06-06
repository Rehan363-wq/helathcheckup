"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  UserCheck, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  Activity, 
  Camera, 
  FileText, 
  Heart, 
  Calendar, 
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/doctors");
    }
  };

  return (
    <div style={{ background: "var(--bg-surface)", minHeight: "100vh", color: "var(--text-primary)", paddingBottom: "80px" }}>
      
      {/* Serene Background Radial Accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "600px",
          background: "radial-gradient(circle at 50% -100px, rgba(0, 113, 227, 0.04) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ================= HERO SECTION ================= */}
      <section
        style={{
          position: "relative",
          padding: "110px 24px 80px",
          maxWidth: "960px",
          margin: "0 auto",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        {/* Brand Greeting Badge */}
        <div
          className="animate-fade-in-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0, 113, 227, 0.05)",
            border: "1px solid rgba(0, 113, 227, 0.1)",
            padding: "6px 16px",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--purple-primary)",
            marginBottom: "28px",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--purple-primary)" }} className="glow-point"></span>
          <span>CliniHome — AI Health & Doctor Connect.</span>
        </div>

        {/* Apple-style Serene Headline */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.5rem, 5vw, 3.8rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            margin: "0 0 20px",
          }}
        >
          Healthcare, <span className="serif-italic" style={{ color: "var(--purple-primary)" }}>simplified.</span>
        </h1>

        <p
          className="animate-fade-in-up animation-delay-100"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
            margin: "0 auto 36px",
            maxWidth: "580px",
          }}
        >
          Book trusted specialists, analyze diagnostics, and coordinate prescriptions in a quiet, anxiety-free digital care system.
        </p>

        {/* Search-Driven Actions (Core Discovery) */}
        <form
          onSubmit={handleSearchSubmit}
          className="animate-fade-in-up animation-delay-200"
          style={{
            maxWidth: "600px",
            margin: "0 auto 48px",
            display: "flex",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            padding: "6px 8px",
            borderRadius: "100px",
            boxShadow: "var(--shadow-card)",
            alignItems: "center",
          }}
        >
          <div style={{ paddingLeft: "16px", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search specialists by name, specialty, or condition..."
            aria-label="Search specialists by name, specialty, or condition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              padding: "12px 14px",
              outline: "none",
              fontSize: "14px",
              color: "var(--text-primary)",
            }}
          />
          <button
            type="submit"
            style={{
              background: "var(--purple-primary)",
              color: "white",
              fontWeight: 600,
              fontSize: "13px",
              padding: "10px 24px",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 113, 227, 0.15)",
              transition: "transform 0.15s ease",
            }}
            className="hover:scale-102"
          >
            Find Care
          </button>
        </form>

      </section>

      {/* ================= SERVICE GRID SECTION ================= */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 80px",
          zIndex: 2,
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Our Clinical Services
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Select an option below to access immediate care and management tools.
          </p>
        </div>

        {/* 3x2 Apple Card Bento Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Card 1: Find Specialists */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(0,113,227,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-primary)", marginBottom: "20px" }}>
                <Calendar size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Specialist Directory</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Filter verified medical providers by location, availability, or specialty and schedule appointments.
              </p>
            </div>
            <Link href="/doctors" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Book Appointment <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Patient Dashboard */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(52,199,89,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--severity-low)", marginBottom: "20px" }}>
                <Activity size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Patient Dashboard</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Monitor active appointments, log daily medication routines, and analyze personalized clinical lab scores.
              </p>
            </div>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Open Dashboard <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Skin Analyzer */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,45,85,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-pink)", marginBottom: "20px" }}>
                <Camera size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Skin AI Analyzer</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Take or upload images of your skin condition to receive instantaneous, AI-guided dryness and health insights.
              </p>
            </div>
            <Link href="/scan" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Scan Now <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: Report Explainer */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,149,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--severity-med)", marginBottom: "20px" }}>
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Report Explainer</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Upload diagnostic lab sheets to break down complex medical reports into digestible, understandable terms.
              </p>
            </div>
            <Link href="/report" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Upload Report <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 5: AI Assist Chat */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(0,113,227,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--purple-primary)", marginBottom: "20px" }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>CliniHome AI Assistant</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Consult our clinical AI bot round-the-clock regarding general health inquiries and symptoms.
              </p>
            </div>
            <Link href="/health-bot" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Consult Bot <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 6: Mood Track & Relax */}
          <div className="apple-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "260px" }}>
            <div>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(124,58,237,0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED", marginBottom: "20px" }}>
                <Heart size={20} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Mood Logger & Music</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Log daily emotional vibes and play serene, mood-customized sounds inside our responsive music widget.
              </p>
            </div>
            <Link href="/tracker" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--purple-primary)", textDecoration: "none", marginTop: "20px" }}>
              Relax Mind <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= TRUST & VALUE PROPS SECTION ================= */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 24px",
          borderTop: "1px solid var(--border)",
          zIndex: 2,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "36px",
          }}
        >
          {/* Prop 1 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ color: "var(--purple-primary)", flexShrink: 0, marginTop: "2px" }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Professional Credentials</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Every doctor in our directory undergoes verification of license and credentials before they can receive appointment bookings.
              </p>
            </div>
          </div>

          {/* Prop 2 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ color: "var(--purple-primary)", flexShrink: 0, marginTop: "2px" }}>
              <DollarSign size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Clear Transparent Pricing</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                No hidden administrative billing. Doctor fees are displayed upfront so patients can choose care that fits their budget.
              </p>
            </div>
          </div>

          {/* Prop 3 */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ color: "var(--purple-primary)", flexShrink: 0, marginTop: "2px" }}>
              <UserCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px" }}>Apple-Inspired Serenity</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                A highly clean, calming digital aesthetic. Reducing visual clutter lowers patient stress and improves operational clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PERSISTENT EMERGENCY BANNER ================= */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "32px auto 0",
          padding: "0 24px",
          zIndex: 2,
          position: "relative",
        }}
      >
        <div
          style={{
            background: "rgba(255, 59, 48, 0.03)",
            border: "1px dashed rgba(255, 59, 48, 0.2)",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--severity-high)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              🚨 Emergency Warning
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", margin: 0, lineHeight: 1.45 }}>
              If you or a loved one is experiencing severe chest pain, difficulties breathing, or trauma, do not wait for an appointment. Dial 112 or visit the nearest ER immediately.
            </p>
          </div>
          <a
            href="tel:112"
            onClick={(e) => {
              e.preventDefault();
              setShowEmergencyModal(true);
            }}
            style={{
              background: "var(--severity-high)",
              color: "white",
              fontWeight: 700,
              fontSize: "13px",
              padding: "10px 22px",
              borderRadius: "100px",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(255, 59, 48, 0.2)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Call Dispatch (112)
          </a>
        </div>
      </section>

      {/* Emergency Simulation Modal */}
      {showEmergencyModal && (
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
              border: "1px solid var(--border-color, rgba(0, 0, 0, 0.1))",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚨</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 12px 0", color: "var(--severity-high)" }}>
              Emergency Simulation
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "0 0 24px 0", lineHeight: 1.5 }}>
              Connecting with emergency services...
              <br />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Dialing 112 (Dispatcher)</span>
              <br /><br />
              <span style={{ fontSize: "12px", fontStyle: "italic" }}>Note: This is a demo simulation. In a real emergency, please call your local emergency services number directly from a phone line.</span>
            </p>
            <button
              onClick={() => setShowEmergencyModal(false)}
              style={{
                background: "var(--purple-primary)",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 24px",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close Simulation
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
