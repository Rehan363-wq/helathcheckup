"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BadgeCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle,
  FileText,
  ShieldAlert,
  User
} from "lucide-react";
import { Doctor } from "@/types/doctor";
import { MOCK_DOCTORS } from "@/lib/doctors";
import { createClient } from "@/lib/supabase/client";

const getDoctorReviews = (doctorName: string, specialization: string) => {
  const lastName = doctorName ? doctorName.split(" ").slice(1).join(" ") : "Doctor";
  return [
    { 
      id: "rev-1", 
      author: "Rohan Malhotra", 
      rating: 5, 
      date: "2 days ago", 
      text: `Dr. ${lastName} was extremely patient and detailed. They explained the diagnosis clearly and laid out a very easy-to-follow treatment plan.` 
    },
    { 
      id: "rev-2", 
      author: "Ananya Sen", 
      rating: 4, 
      date: "1 week ago", 
      text: `Very smooth scheduling experience with Dr. ${lastName}. The clinic was tidy and sterile. Highly professional consultation for ${specialization.toLowerCase()} concerns!` 
    },
    { 
      id: "rev-3", 
      author: "Kabir Mehta", 
      rating: 5, 
      date: "3 weeks ago", 
      text: `Great consultation fees and direct answers. My symptoms have completely improved following the visit.` 
    }
  ];
};

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Widget State
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const supabase = useMemo(() => createClient(), []);

  // Generate next 4 calendar days (excluding Sundays) for scheduling
  const availableDates = useMemo(() => {
    const dates = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let current = new Date();
    while (dates.length < 4) {
      if (current.getDay() !== 0) { // Skip Sunday
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        const dateId = `${year}-${month}-${day}`;
        dates.push({
          id: dateId,
          dayName: weekdays[current.getDay()],
          dayNumber: current.getDate(),
          monthName: months[current.getMonth()],
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, []);

  const timeSlots = ["09:30 AM", "11:00 AM", "12:30 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

  useEffect(() => {
    async function loadDoctor() {
      setLoading(true);
      
      // Load local list first (for fallback/sandbox)
      let localDocs: Doctor[] = [];
      try {
        const stored = localStorage.getItem("clinihome-doctors-list");
        if (stored) {
          localDocs = JSON.parse(stored);
        } else {
          localDocs = MOCK_DOCTORS.map(d => ({ ...d, is_approved: true }));
        }
      } catch (e) {
        console.warn("Local storage read failed:", e);
      }

      // Check if matches mock list
      const matchedLocal = localDocs.find((d) => d.id === docId);
      if (matchedLocal) {
        setDoctor({
          ...matchedLocal,
          name: matchedLocal.name || (matchedLocal as any).full_name || "Doctor",
        });
        setLoading(false);
        return;
      }

      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", docId)
          .single();

        if (error) throw error;

        if (data) {
          const mappedDoc: Doctor = {
            id: data.id,
            name: data.full_name || "Doctor",
            specialization: data.specialization || "General Physician",
            degree: data.degree || "MBBS",
            area: data.area || "Unknown Area",
            city: data.city || "Unknown City",
            fees: Number(data.fees) || 200,
            rating: Number(data.rating) || 4.6,
            distance: Number(data.distance) || 2.1,
            phone: data.phone || "+91 99999 99999",
            verified: true,
            imageUrl: data.avatar_url || undefined,
            lat: Number(data.lat) || 28.56,
            lng: Number(data.lng) || 77.22,
          };
          setDoctor(mappedDoc);
        }
      } catch (err) {
        console.warn("Database fetch failed for doctor profile, matching mocks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [docId, supabase]);

  // Autofill patient details from session if logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("clinihome-session");
      if (session) {
        try {
          const user = JSON.parse(session);
          setPatientName(user.name || "");
          setPatientPhone(user.phone || "");
        } catch (e) {
          console.warn("Error parsing session:", e);
        }
      }
    }
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (!selectedDate) {
      setBookingError("Please select a date for your visit.");
      return;
    }
    if (!selectedTime) {
      setBookingError("Please choose a preferred time slot.");
      return;
    }
    if (!patientName.trim()) {
      setBookingError("Please enter the patient's full name.");
      return;
    }
    if (!patientPhone.trim()) {
      setBookingError("Please provide a contact phone number.");
      return;
    }

    try {
      // Fetch existing appointments
      const stored = localStorage.getItem("clinihome-appointments");
      const appointments = stored ? JSON.parse(stored) : [];

      const isConflict = appointments.some(
        (apt: any) =>
          apt.doctorId === doctor?.id &&
          apt.date === selectedDate &&
          apt.time === selectedTime
      );

      if (isConflict) {
        setBookingError("This time slot is already booked for this specialist. Please choose another slot.");
        return;
      }

      const newAppointment = {
        id: "apt-" + Date.now(),
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        specialization: doctor?.specialization,
        date: selectedDate,
        time: selectedTime,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        reason: reason.trim() || "Consultation",
        status: "confirmed",
        fees: doctor?.fees || 200,
        createdAt: new Date().toISOString(),
      };

      appointments.push(newAppointment);
      localStorage.setItem("clinihome-appointments", JSON.stringify(appointments));
      setBookingConfirmed(true);
    } catch (e) {
      console.error("Booking write failed:", e);
      setBookingError("An error occurred during booking. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "80px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
        Loading specialist profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "80px 24px", textAlign: "center" }}>
        <ShieldAlert size={48} style={{ color: "var(--severity-high)", margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Specialist Profile Not Found</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>The selected doctor listing does not exist or has been suspended.</p>
        <Link href="/doctors" style={{ color: "var(--purple-primary)", fontWeight: 600, fontSize: "14px", display: "inline-block", marginTop: "16px", textDecoration: "none" }}>
          Return to specialist directory
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-surface)", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Back Link */}
        <Link 
          href="/doctors" 
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500, marginBottom: "28px" }}
          className="hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Specialist Directory
        </Link>

        {/* Success Booking Modal / Screen */}
        {bookingConfirmed ? (
          <div 
            style={{ 
              background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: "20px", padding: "48px 24px", textAlign: "center", boxShadow: "var(--shadow-card)" 
            }}
            className="animate-pop-in"
          >
            <CheckCircle size={56} style={{ color: "var(--severity-low)", margin: "0 auto 20px" }} />
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800 }}>Appointment Confirmed!</h2>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "500px", margin: "8px auto 24px", lineHeight: 1.5 }}>
              Your consultation request with <strong style={{ color: "var(--text-primary)" }}>{doctor.name}</strong> is successfully scheduled.
            </p>

            {/* Booking Details Card */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px", maxWidth: "440px", margin: "0 auto 32px", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}><span style={{ color: "var(--text-secondary)" }}>Specialist:</span><span style={{ fontWeight: 600 }}>{doctor.name}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}><span style={{ color: "var(--text-secondary)" }}>Scheduled Visit:</span><span style={{ fontWeight: 600 }}>{availableDates.find(d => d.id === selectedDate)?.monthName} {availableDates.find(d => d.id === selectedDate)?.dayNumber} • {selectedTime}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}><span style={{ color: "var(--text-secondary)" }}>Patient Name:</span><span style={{ fontWeight: 600 }}>{patientName}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}><span style={{ color: "var(--text-secondary)" }}>Clinic Fee:</span><span style={{ fontWeight: 700 }}>₹{doctor.fees}</span></div>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/dashboard" style={{ background: "var(--purple-primary)", color: "white", padding: "12px 28px", borderRadius: "100px", textDecoration: "none", fontSize: "14px", fontWeight: 600, boxShadow: "0 4px 12px rgba(0, 113, 227, 0.15)" }}>
                View In Dashboard
              </Link>
              <button 
                onClick={() => {
                  setBookingConfirmed(false);
                  setSelectedDate("");
                  setSelectedTime("");
                  setReason("");
                }}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "12px 28px", borderRadius: "100px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Book Another
              </button>
            </div>
          </div>
        ) : (
          /* Profile Details + Booking Widget grid */
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }} className="profile-grid">
            
            {/* Left Column: Doctor Bio & Reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              
              {/* Profile Card */}
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow-card)" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "14px", background: "rgba(0, 113, 227, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", color: "var(--purple-primary)", fontWeight: 700 }}>
                    {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", display: "inline-flex", alignItems: "center", gap: "6px", margin: 0 }}>
                      {doctor.name} {doctor.verified && <BadgeCheck size={20} style={{ color: "var(--purple-primary)" }} />}
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: "4px 0 2px" }}>{doctor.specialization} • {doctor.degree}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, color: "var(--text-primary)" }}>
                        <Star size={14} style={{ color: "var(--accent-yellow)", fill: "var(--accent-yellow)", border: "none" }} /> {doctor.rating}
                      </span>
                      <span>•</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <MapPin size={13} /> {doctor.area || "Noida"}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        ₹{doctor.fees} Fees
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border)", marginTop: "24px", paddingTop: "20px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>Professional Statement</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    Dr. {doctor.name.split(" ").slice(1).join(" ")} is a recognized clinical specialist committed to providing empathetic, evidence-based care. With extensive credentials in {doctor.specialization.toLowerCase()} and related medical boards, they prioritize thorough patient diagnostics, holistic follow-up plans, and transparent clinical counseling to reduce wellness anxiety.
                  </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.01em" }}>Patient Feedback</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {getDoctorReviews(doctor.name, doctor.specialization).map((rev) => (
                    <div key={rev.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>{rev.author}</span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{rev.date}</span>
                      </div>
                      <div style={{ display: "flex", gap: "2px", color: "var(--accent-yellow)", marginBottom: "8px" }}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={12} style={{ fill: "var(--accent-yellow)" }} />
                        ))}
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                        "{rev.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Live Booking Widget */}
            <div>
              <div 
                style={{ 
                  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-card)", position: "sticky", top: "84px" 
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} style={{ color: "var(--purple-primary)" }} /> Schedule Visit
                </h3>

                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Select Date */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                      1. Select Consult Date
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                      {availableDates.map((date) => {
                        const isSelected = selectedDate === date.id;
                        return (
                          <button
                            key={date.id}
                            type="button"
                            onClick={() => setSelectedDate(date.id)}
                            style={{
                              border: isSelected ? "1.5px solid var(--purple-primary)" : "1px solid var(--border)",
                              background: isSelected ? "var(--purple-glow)" : "var(--bg-surface)",
                              padding: "10px 4px",
                              borderRadius: "10px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 500 }}>{date.dayName}</span>
                            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", margin: "2px 0" }}>{date.dayNumber}</span>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>{date.monthName}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                      2. Choose Time Slot
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                      {timeSlots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            style={{
                              border: isSelected ? "1.5px solid var(--purple-primary)" : "1.5px solid var(--border)",
                              background: isSelected ? "var(--purple-primary)" : "var(--bg-surface)",
                              color: isSelected ? "white" : "var(--text-primary)",
                              padding: "8px 0",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Patient Name and Phone Details */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", margin: 0 }}>
                      3. Patient Information
                    </label>

                    {/* Patient Name Input */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input 
                        type="text" 
                        placeholder="Full Patient Name" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                          background: "var(--bg-surface)", fontSize: "13px", outline: "none", color: "var(--text-primary)"
                        }}
                      />
                    </div>

                    {/* Patient Phone Input */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input 
                        type="text" 
                        placeholder="Contact Number" 
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                          background: "var(--bg-surface)", fontSize: "13px", outline: "none", color: "var(--text-primary)"
                        }}
                      />
                    </div>

                    {/* Reason input */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input 
                        type="text" 
                        placeholder="Reason for Visit (optional)" 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        style={{
                          width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                          background: "var(--bg-surface)", fontSize: "13px", outline: "none", color: "var(--text-primary)"
                        }}
                      />
                    </div>
                  </div>

                  {bookingError && (
                    <p style={{ color: "var(--severity-high)", fontSize: "12px", fontWeight: 600, margin: 0 }}>
                      ⚠️ {bookingError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "var(--purple-primary)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      borderRadius: "100px",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(0, 113, 227, 0.2)",
                      transition: "transform 0.15s ease",
                    }}
                    className="hover:scale-101"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}


