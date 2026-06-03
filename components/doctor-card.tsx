import { Doctor } from "@/types/doctor";
import { MapPin, Star, Phone, BadgeCheck, Navigation } from "lucide-react";

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
  const feesColor =
    doctor.fees <= 200
      ? "var(--severity-low)"
      : doctor.fees <= 400
        ? "var(--severity-med)"
        : "var(--text-secondary)";

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
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        borderLeft: isActive
          ? "4px solid var(--purple-primary)"
          : "4px solid transparent",
        transform: isActive ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Avatar */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #EDE9FE, #F3E8FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: "20px",
            color: "var(--purple-primary)",
          }}
        >
          {doctor.name.split(" ").slice(1).map((n) => n[0]).join("")}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
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
              marginBottom: "2px",
            }}
          >
            {doctor.specialization}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {doctor.degree}
          </p>

          {/* Stats Row */}
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
              <Star size={14} style={{ color: "var(--accent-yellow)", fill: "var(--accent-yellow)" }} />
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
              <span>{doctor.distance} km</span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                fontWeight: 600,
                color: feesColor,
              }}
            >
              ₹{doctor.fees}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "14px",
              flexWrap: "wrap",
            }}
          >
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              id={`directions-${doctor.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "linear-gradient(135deg, #7C3AED, #EC4899)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                borderRadius: "8px",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Navigation size={12} />
              Directions
            </a>

            <a
              href={`tel:${doctor.phone}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "rgba(124,58,237,0.08)",
                color: "var(--purple-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                borderRadius: "8px",
                textDecoration: "none",
                border: "1px solid rgba(124,58,237,0.15)",
                transition: "all 0.2s ease",
              }}
            >
              <Phone size={12} />
              Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
