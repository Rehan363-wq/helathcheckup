import { describe, it, expect } from "vitest";
import { filterDoctors } from "../lib/doctors";
import { Doctor } from "../types/doctor";

const TEST_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    degree: "MBBS, MD",
    area: "Sector 18",
    city: "Noida",
    fees: 300,
    rating: 4.8,
    distance: 2.3,
    phone: "+91 98765 43210",
    verified: true,
    lat: 28.5707,
    lng: 77.3219,
  },
  {
    id: "2",
    name: "Rajesh Gupta",
    specialization: "General Physician",
    degree: "MBBS, MD",
    area: "Lajpat Nagar",
    city: "Delhi",
    fees: 200,
    rating: 4.5,
    distance: 3.1,
    phone: "+91 87654 32109",
    verified: true,
    lat: 28.5691,
    lng: 77.2432,
  },
  {
    id: "3",
    name: "Dr Anita Verma",
    specialization: "Dermatologist",
    degree: "MBBS, DVD",
    area: "Connaught Place",
    city: "Delhi",
    fees: 500,
    rating: 4.9,
    distance: 5.2,
    phone: "+91 76543 21098",
    verified: true,
    lat: 28.6315,
    lng: 77.2167,
  },
];

describe("Doctors Directory Filters", () => {
  it("should filter by specialization", () => {
    const dermatologist = filterDoctors(TEST_DOCTORS, "Dermatologist");
    expect(dermatologist.length).toBe(2);
    expect(dermatologist.map(d => d.id)).toEqual(["1", "3"]);
  });

  it("should filter by max fees", () => {
    const cheap = filterDoctors(TEST_DOCTORS, "All", 250);
    expect(cheap.length).toBe(1);
    expect(cheap[0].id).toBe("2");
  });

  it("should filter by max distance", () => {
    const close = filterDoctors(TEST_DOCTORS, "All", 1000, 3.0);
    expect(close.length).toBe(1);
    expect(close[0].id).toBe("1");
  });
});

describe("Doctor Name and Initials formatting logic", () => {
  const getInitials = (name: string) => {
    const clean = name.replace(/^(dr\.?\s+)/i, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "DR";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  it("should extract correct initials for names with Dr. prefix", () => {
    expect(getInitials("Dr. Priya Sharma")).toBe("PS");
    expect(getInitials("Dr Priya Sharma")).toBe("PS");
  });

  it("should extract correct initials for names without Dr. prefix", () => {
    expect(getInitials("Rajesh Gupta")).toBe("RG");
    expect(getInitials("Anita")).toBe("AN");
  });

  it("should fallback to DR if empty", () => {
    expect(getInitials("Dr. ")).toBe("DR");
    expect(getInitials("")).toBe("DR");
  });
});
