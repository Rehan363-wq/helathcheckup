import Link from "next/link";
import { Doctor } from "@/types/doctor";
import { MapPin, Star, Phone, BadgeCheck, CalendarDays } from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
  isActive?: boolean;
  onClick?: () => void;
}

export default function DoctorCard({
  doctor,
  isActive = false,
  onClick,
}: DoctorCardProps) {
  return (
    <div
      id={`doctor-card-${doctor.id}`}
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        borderRadius: "16px",
        boxShadow: isActive
          ? "var(--shadow-purple)"
          : "var(--shadow-card)",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        border: isActive
          ? "1.5px solid var(--purple-primary)"
          : "1.5px solid var(--border)",
        transform: isActive ? "translateY(-2px)" : "none",
      }}
      className="hover:scale-101"
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Avatar Placeholder */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "12px",
            background: "rgba(0, 113, 227, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "18px",
            color: "var(--purple-primary)",
          }}
        >
          {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
        </div>

        {/* Doctor Information */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                margin: 0,
              }}
            >
              {doctor.name}
            </h4>
            {doctor.verified && (
              <BadgeCheck
                size={16}
                style={{ color: "var(--purple-primary)", flexShrink: 0 }}
              />
            )}
          </div>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              margin: "0 0 2px 0",
            }}
          >
            {doctor.specialization}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            {doctor.degree}
          </p>

          {/* Location and Fees Summary Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
              }}
            >
              <Star size={14} style={{ color: "var(--accent-yellow)", fill: "var(--accent-yellow)", border: "none" }} />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {doctor.rating}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "var(--text-secondary)",
              }}
            >
              <MapPin size={14} />
              <span>{doctor.area || "Noida"} ({doctor.distance} km)</span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              ₹{doctor.fees}
            </div>
          </div>

          {/* Apple-style primary Conversion Action + Secondary Actions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
              alignItems: "center"
            }}
          >
            <Link
              href={`/doctors/${doctor.id}`}
              id={`book-doctor-${doctor.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "var(--purple-primary)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "12px",
                borderRadius: "100px",
                textDecoration: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0, 113, 227, 0.12)",
              }}
              className="hover:scale-103"
            >
              <CalendarDays size={12} />
              Book Appointment
            </Link>

            <a
              href={`tel:${doctor.phone}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                borderRadius: "100px",
                textDecoration: "none",
                border: "1px solid var(--border)",
                transition: "all 0.2s ease",
              }}
              className="hover:bg-slate-100"
            >
              <Phone size={12} />
              Call Clinic
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
