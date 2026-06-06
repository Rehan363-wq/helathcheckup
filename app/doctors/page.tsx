"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DoctorCard from "@/components/doctor-card";
import { MOCK_DOCTORS, filterDoctors, getUniqueSpecializations } from "@/lib/doctors";
import { Search, Filter, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Doctor } from "@/types/doctor";

function DoctorsListContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [maxFees, setMaxFees] = useState(1000);
  const [activeDoctor, setActiveDoctor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Update searchQuery state if initialSearch changes
  useEffect(() => {
    document.title = "Find Specialists — CliniHome AI";
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    async function fetchDoctors() {
      // Initialize local storage doctors list if not exists
      let localDocs: Doctor[] = [];
      try {
        const stored = localStorage.getItem("clinihome-doctors-list");
        if (stored) {
          const parsed = JSON.parse(stored);
          localDocs = parsed.map((ld: any) => ({
            ...ld,
            name: ld.name || ld.full_name || "Doctor",
          }));
        } else {
          localDocs = MOCK_DOCTORS.map(d => ({ ...d, is_approved: true }));
          localStorage.setItem("clinihome-doctors-list", JSON.stringify(localDocs));
        }
      } catch (e) {
        console.warn("Failed to read/write local doctors list:", e);
      }

      if (!supabase) {
        const approvedLocal = localDocs.filter((d: any) => d.is_approved === true);
        setDoctors(approvedLocal);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "doctor")
          .eq("is_approved", true);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const mappedDoctors: Doctor[] = data.map((d: any, index: number) => ({
            id: d.id,
            name: d.full_name || "Doctor",
            specialization: d.specialization || "General Physician",
            degree: d.degree || "MBBS",
            area: d.area || "Unknown Area",
            city: d.city || "Unknown City",
            fees: Number(d.fees) || 200,
            rating: Number(d.rating) || 4.5,
            phone: d.phone || "+91 99999 99999",
            verified: true,
            lat: d.id === '11111111-1111-1111-1111-111111111111' ? 28.5707 :
                 d.id === '22222222-2222-2222-2222-222222222222' ? 28.5691 :
                 d.id === '33333333-3333-3333-3333-333333333333' ? 28.6315 :
                 d.id === '44444444-4444-4444-4444-444444444444' ? 28.5244 :
                 28.55 + (index * 0.01) % 0.1,
            lng: d.id === '11111111-1111-1111-1111-111111111111' ? 77.3219 :
                 d.id === '22222222-2222-2222-2222-222222222222' ? 77.2432 :
                 d.id === '33333333-3333-3333-3333-333333333333' ? 77.2167 :
                 d.id === '44444444-4444-4444-4444-444444444444' ? 77.2066 :
                 77.22 + (index * 0.015) % 0.1,
            distance: d.id === '11111111-1111-1111-1111-111111111111' ? 2.3 :
                      d.id === '22222222-2222-2222-2222-222222222222' ? 3.1 :
                      d.id === '33333333-3333-3333-3333-333333333333' ? 5.2 :
                      d.id === '44444444-4444-4444-4444-444444444444' ? 4.5 :
                      1.5 + (index * 0.7) % 5.0,
            imageUrl: d.avatar_url || undefined,
          }));

          const combined = [...mappedDoctors];
          localDocs.forEach((ld) => {
            if (ld.is_approved && !combined.some((cd) => cd.name === ld.name || cd.id === ld.id)) {
              combined.push(ld);
            }
          });
          setDoctors(combined);
        } else {
          const approvedLocal = localDocs.filter((d: any) => d.is_approved === true);
          setDoctors(approvedLocal);
        }
      } catch (err) {
        console.warn("Failed to fetch doctors from database, using local storage list fallback:", err);
        const approvedLocal = localDocs.filter((d: any) => d.is_approved === true);
        setDoctors(approvedLocal);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [supabase]);

  const specializations = useMemo(() => getUniqueSpecializations(doctors), [doctors]);

  const filteredDoctors = useMemo(() => {
    let list = filterDoctors(doctors, selectedSpecialization, maxFees);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (doc) => {
          const nameStr = (doc.name || (doc as any).full_name || "Doctor").toLowerCase();
          const specStr = (doc.specialization || "").toLowerCase();
          const areaStr = (doc.area || "").toLowerCase();
          const cityStr = (doc.city || "").toLowerCase();
          return (
            nameStr.includes(q) ||
            specStr.includes(q) ||
            areaStr.includes(q) ||
            cityStr.includes(q)
          );
        }
      );
    }
    return list;
  }, [doctors, selectedSpecialization, maxFees, searchQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "6px",
              letterSpacing: "-0.02em"
            }}
          >
            Directory of Specialists
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            Locate and book certified CliniHome practitioners. Filter by location, cost, or expertise.
          </p>
        </div>

        {/* Filter Bar (Apple-style minimalist control bar) */}
        <div
          id="doctor-filters"
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "24px",
            flexWrap: "wrap",
            alignItems: "center",
            padding: "12px 18px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Filter size={18} style={{ color: "var(--text-secondary)" }} />

          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search specialists, clinic areas, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "100px",
                border: "1px solid var(--border)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          {/* Specialization selector */}
          <select
            id="specialization-filter"
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: "100px",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-primary)",
              background: "var(--bg-card)",
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

          {/* Fees filter slider */}
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
            <span>Fees:</span>
            <input
              type="range"
              id="fees-filter"
              min={100}
              max={1000}
              step={50}
              value={maxFees}
              onChange={(e) => setMaxFees(Number(e.target.value))}
              style={{
                width: "100px",
                accentColor: "var(--purple-primary)",
                cursor: "pointer",
              }}
            />
            <span style={{ fontWeight: 600 }}>₹{maxFees}</span>
          </div>

          {/* Result Count */}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginLeft: "auto",
              fontWeight: 500,
            }}
          >
            {filteredDoctors.length} found
          </span>
        </div>

        {/* Content Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
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
              paddingRight: "6px",
            }}
          >
            {loading ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
                Loading verified doctors...
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--bg-card)",
                  border: "1px dashed var(--border)",
                  borderRadius: "16px",
                }}
              >
                <Search size={40} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  No active doctors match the selected filters.
                  <br />
                  Try expanding your search query or adjusting limits.
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

          {/* Interactive Map Placeholder (Redesigned in Apple light map styles) */}
          <div
            className="map-container"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              minHeight: "500px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #EBF3FC 0%, #F5F9FD 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                position: "relative",
              }}
            >
              {/* Map grid lines simulation */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(rgba(0,113,227,0.03) 1.5px, transparent 1.5px),
                    linear-gradient(90deg, rgba(0,113,227,0.03) 1.5px, transparent 1.5px)
                  `,
                  backgroundSize: "32px 32px",
                }}
              />

              {/* Simulated streets lines for visual richness */}
              <div style={{ position: "absolute", top: "30%", left: 0, right: 0, height: "16px", background: "white", transform: "rotate(-5deg)", opacity: 0.8 }} />
              <div style={{ position: "absolute", left: "40%", top: 0, bottom: 0, width: "20px", background: "white", transform: "rotate(20deg)", opacity: 0.8 }} />

              {/* Pins of Specialists */}
              {filteredDoctors.map((doctor, i) => (
                <div
                  key={doctor.id}
                  onClick={() => setActiveDoctor(doctor.id)}
                  style={{
                    position: "absolute",
                    left: `${20 + (i * 15) % 60}%`,
                    top: `${20 + (i * 18) % 60}%`,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    transform: activeDoctor === doctor.id ? "scale(1.2)" : "scale(1)",
                    zIndex: activeDoctor === doctor.id ? 10 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50% 50% 50% 0%",
                      transform: "rotate(-45deg)",
                      background: activeDoctor === doctor.id
                        ? "linear-gradient(135deg, #0071E3, #3897FD)"
                        : "var(--purple-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: activeDoctor === doctor.id
                        ? "0 4px 12px rgba(0,113,227,0.3)"
                        : "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <MapPin
                      size={14}
                      style={{ color: "white", transform: "rotate(45deg)" }}
                    />
                  </div>
                  {activeDoctor === doctor.id && (
                    <div
                      className="animate-pop-in animate-card"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        whiteSpace: "nowrap",
                        boxShadow: "var(--shadow-dark)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          margin: 0,
                        }}
                      >
                        {doctor.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "11px",
                          color: "var(--text-secondary)",
                          margin: 0,
                        }}
                      >
                        {doctor.specialization} • ₹{doctor.fees}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Map Footer Tag */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "16px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontFamily: "var(--font-body)",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                📍 Interactive Map Preview (Coming Soon) • Click pins for details
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
            min-height: 280px !important;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-secondary)" }}>Loading specialists directory...</div>}>
      <DoctorsListContent />
    </Suspense>
  );
}
