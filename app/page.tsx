import Link from "next/link";
import { Camera, FileText, MapPin, ArrowRight, CheckCircle, Shield, Zap, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg-dark)", minHeight: "100vh" }}>
      {/* ===== HERO SECTION ===== */}
      <section
        id="hero-section"
        style={{
          position: "relative",
          padding: "96px 24px 80px",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "48px",
          flexWrap: "wrap",
          overflow: "hidden",
        }}
      >
        {/* Gradient orbs for atmosphere */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero Text */}
        <div style={{ flex: 1, minWidth: "300px", position: "relative", zIndex: 1 }}>
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "var(--text-white)",
              lineHeight: 1.1,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Apna Doctor,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #A78BFA, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Apni Zeb Mein.
            </span>
          </h1>

          <p
            className="animate-fade-in-up animation-delay-100"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "18px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "32px",
              maxWidth: "480px",
              opacity: 0,
            }}
          >
            AI se apni skin condition samjho, medical reports padho, aur apne area ke verified doctors dhundho — sab kuch ek jagah.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in-up animation-delay-200"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "40px",
              opacity: 0,
            }}
          >
            <Link
              href="/scan"
              id="hero-scan-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "16px",
                padding: "16px 32px",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <Camera size={20} />
              Scan Karo
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/report"
              id="hero-report-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.06)",
                color: "var(--text-white)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "16px",
                padding: "16px 32px",
                borderRadius: "12px",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.12)",
                transition: "all 0.2s ease",
              }}
            >
              <FileText size={20} />
              Report Upload
            </Link>
          </div>

          {/* Trust Badges */}
          <div
            className="animate-fade-in-up animation-delay-300"
            style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              opacity: 0,
            }}
          >
            {[
              { icon: Zap, text: "AI Powered" },
              { icon: CheckCircle, text: "10,000+ Scans" },
              { icon: Shield, text: "Privacy First" },
              { icon: Heart, text: "Verified Doctors" },
            ].map((badge) => (
              <div
                key={badge.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                <badge.icon size={14} style={{ color: "var(--severity-low)" }} />
                {badge.text}
              </div>
            ))}
          </div>
        </div>

        {/* Hero Card (Floating Dashboard Preview) */}
        <div
          className="animate-fade-in-up animation-delay-300 animate-float"
          style={{
            width: "380px",
            background: "var(--bg-card)",
            borderRadius: "20px",
            boxShadow: "var(--shadow-purple)",
            padding: "28px",
            position: "relative",
            zIndex: 1,
            opacity: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              AI Scan Result
            </h3>
            <span
              style={{
                padding: "4px 12px",
                background: "#FEF3C7",
                color: "#92400E",
                fontSize: "11px",
                fontWeight: 500,
                borderRadius: "999px",
                fontFamily: "var(--font-body)",
              }}
            >
              ⚠ Medium
            </span>
          </div>

          <div
            style={{
              background: "#F9FAFB",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Detected Condition
            </p>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Fungal Infection
            </p>
            <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      i <= 4
                        ? "var(--purple-primary)"
                        : "transparent",
                    border: "2px solid var(--purple-primary)",
                  }}
                />
              ))}
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--purple-primary)",
                  fontWeight: 600,
                  marginLeft: "8px",
                  fontFamily: "var(--font-body)",
                }}
              >
                82% match
              </span>
            </div>
          </div>

          {/* Mini chart decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "3px",
              height: "40px",
            }}
          >
            {[30, 50, 35, 70, 45, 80, 60, 90, 55, 75, 40, 85].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: `linear-gradient(to top, var(--purple-primary), var(--purple-light))`,
                  borderRadius: "3px",
                  opacity: 0.6 + (h / 300),
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section
        id="features-section"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 96px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {[
          {
            icon: Camera,
            title: "📸 Skin Analyzer",
            description: "Photo upload karo — AI batayega kya condition hai, kitna serious hai, aur kya karna chahiye.",
            href: "/scan",
            gradient: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(236,72,153,0.05))",
            borderColor: "#7C3AED",
          },
          {
            icon: FileText,
            title: "📄 Report Explainer",
            description: "Blood test ya medical report upload karo — AI simple Hindi/English mein explain karega har parameter.",
            href: "/report",
            gradient: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,58,237,0.05))",
            borderColor: "#3B82F6",
          },
          {
            icon: MapPin,
            title: "📍 Doctor Finder",
            description: "Apne area ke verified doctors dhundho — rating, fees, distance sab dekho, directions lo.",
            href: "/doctors",
            gradient: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.05))",
            borderColor: "#10B981",
          },
        ].map((feature, index) => (
          <Link
            key={feature.title}
            href={feature.href}
            id={`feature-card-${index}`}
            className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-card)",
              padding: "32px",
              textDecoration: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              borderTop: `3px solid ${feature.borderColor}`,
              opacity: 0,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: feature.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <feature.icon size={26} style={{ color: feature.borderColor }} />
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "20px",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              {feature.description}
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                fontWeight: 600,
                color: feature.borderColor,
              }}
            >
              Try it now <ArrowRight size={16} />
            </span>
          </Link>
        ))}
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 96px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
            fontWeight: 700,
            color: "var(--text-white)",
            marginBottom: "48px",
          }}
        >
          Kaise Kaam Karta Hai?
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              step: "01",
              title: "Upload Karo",
              desc: "Photo ya report upload karo",
              icon: "📤",
            },
            {
              step: "02",
              title: "AI Analyze Karega",
              desc: "5-10 seconds mein result",
              icon: "🤖",
            },
            {
              step: "03",
              title: "Action Lo",
              desc: "Doctor dhundho ya ghar pe treat karo",
              icon: "✅",
            },
          ].map((step, i) => (
            <div
              key={step.step}
              className={`animate-fade-in-up animation-delay-${(i + 1) * 100}`}
              style={{
                width: "240px",
                textAlign: "center",
                position: "relative",
                opacity: 0,
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "20px",
                  background: "var(--bg-card-dark)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  margin: "0 auto 16px",
                }}
              >
                {step.icon}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--purple-light)",
                  marginBottom: "4px",
                }}
              >
                Step {step.step}
              </p>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "var(--text-white)",
                  marginBottom: "4px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          MediScan AI — Apna Doctor, Apni Zeb Mein •{" "}
          <span style={{ color: "var(--severity-med)" }}>
            ⚠ AI analysis hai, professional medical advice nahi.
          </span>
        </p>
      </footer>
    </div>
  );
}
