"use client";

import { useState, useMemo } from "react";
import DoctorCard from "@/components/doctor-card";
import { MOCK_DOCTORS, filterDoctors, getUniqueSpecializations } from "@/lib/doctors";
import { Search, Filter, MapPin } from "lucide-react";

export default function DoctorsPage() {
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [maxFees, setMaxFees] = useState(1000);
  const [activeDoctor, setActiveDoctor] = useState<string | null>(null);

  const specializations = getUniqueSpecializations(MOCK_DOCTORS);

  const filteredDoctors = useMemo(
    () => filterDoctors(MOCK_DOCTORS, selectedSpecialization, maxFees),
    [selectedSpecialization, maxFees]
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            📍 Apne Area Ke Doctors
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            Nearby verified doctors — directions lo, call karo
          </p>
        </div>

        {/* Filter Bar */}
        <div
          id="doctor-filters"
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "16px 20px",
            background: "var(--bg-card)",
            borderRadius: "14px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Filter size={18} style={{ color: "var(--text-muted)" }} />

          {/* Specialization Filter */}
          <select
            id="specialization-filter"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-primary)",
              background: "white",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Fees Filter */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <span>Fees: ₹0</span>
            <input
              type="range"
              id="fees-filter"
              min={100}
              max={1000}
              step={50}
              value={maxFees}
              onChange={(e) => setMaxFees(Number(e.target.value))}
              style={{
                width: "120px",
                accentColor: "var(--purple-primary)",
                cursor: "pointer",
              }}
            />
            <span>₹{maxFees}</span>
          </div>

          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginLeft: "auto",
            }}
          >
            {filteredDoctors.length} doctors found
          </span>
        </div>

        {/* Content: Doctor List + Map */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
          className="doctors-grid"
        >
          {/* Doctor List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            {filteredDoctors.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--bg-card)",
                  borderRadius: "16px",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <Search
                  size={48}
                  style={{ color: "var(--text-muted)", margin: "0 auto 16px" }}
                />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "15px",
                    color: "var(--text-secondary)",
                  }}
                >
                  Koi doctor nahi mila is filter mein.
                  <br />
                  Filter change karke try karo.
                </p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  isActive={activeDoctor === doctor.id}
                  onClick={() => setActiveDoctor(doctor.id)}
                />
              ))
            )}
          </div>

          {/* Map Placeholder */}
          <div
            className="map-container"
            style={{
              background: "var(--bg-card)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              minHeight: "500px",
              position: "relative",
            }}
          >
            {/* Map Background */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                position: "relative",
              }}
            >
              {/* Grid lines to simulate map */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Doctor Pins */}
              {filteredDoctors.map((doctor, i) => (
                <div
                  key={doctor.id}
                  onClick={() => setActiveDoctor(doctor.id)}
                  style={{
                    position: "absolute",
                    left: `${20 + (i * 15) % 60}%`,
                    top: `${15 + (i * 20) % 65}%`,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: activeDoctor === doctor.id ? "scale(1.3)" : "scale(1)",
                    zIndex: activeDoctor === doctor.id ? 10 : 1,
                  }}
                >
                  <div
                    style={{
                      width: activeDoctor === doctor.id ? "40px" : "32px",
                      height: activeDoctor === doctor.id ? "40px" : "32px",
                      borderRadius: "50% 50% 50% 0%",
                      transform: "rotate(-45deg)",
                      background: activeDoctor === doctor.id
                        ? "linear-gradient(135deg, #7C3AED, #EC4899)"
                        : "var(--purple-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: activeDoctor === doctor.id
                        ? "0 0 20px rgba(124,58,237,0.5)"
                        : "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                  >
                    <MapPin
                      size={activeDoctor === doctor.id ? 18 : 14}
                      style={{ color: "white", transform: "rotate(45deg)" }}
                    />
                  </div>
                  {activeDoctor === doctor.id && (
                    <div
                      className="animate-pop-in"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--bg-card-dark)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        whiteSpace: "nowrap",
                        boxShadow: "var(--shadow-dark)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--text-white)",
                        }}
                      >
                        {doctor.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "11px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {doctor.specialization} • ₹{doctor.fees}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Map Label */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  background: "rgba(0,0,0,0.6)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                }}
              >
                📍 Interactive Map • Click pins for details
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .doctors-grid {
            grid-template-columns: 1fr !important;
          }
          .map-container {
            min-height: 300px !important;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}
