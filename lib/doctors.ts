import { Doctor } from "@/types/doctor";

// Mock doctor data for demo - in production this would come from Google Maps Places API
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    degree: "MBBS, MD (Dermatology)",
    area: "Sector 18, Noida",
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
    name: "Dr. Rajesh Gupta",
    specialization: "General Physician",
    degree: "MBBS, MD (Medicine)",
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
    name: "Dr. Anita Verma",
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
  {
    id: "4",
    name: "Dr. Amit Patel",
    specialization: "General Physician",
    degree: "MBBS",
    area: "Saket",
    city: "Delhi",
    fees: 150,
    rating: 4.2,
    distance: 4.5,
    phone: "+91 65432 10987",
    verified: false,
    lat: 28.5244,
    lng: 77.2066,
  },
  {
    id: "5",
    name: "Dr. Sunita Rao",
    specialization: "Pathologist",
    degree: "MBBS, MD (Pathology)",
    area: "Hauz Khas",
    city: "Delhi",
    fees: 400,
    rating: 4.7,
    distance: 3.8,
    phone: "+91 54321 09876",
    verified: true,
    lat: 28.5494,
    lng: 77.2001,
  },
  {
    id: "6",
    name: "Dr. Vikram Singh",
    specialization: "Dermatologist",
    degree: "MBBS, MD, DNB (Dermatology)",
    area: "Greater Kailash",
    city: "Delhi",
    fees: 600,
    rating: 4.6,
    distance: 6.1,
    phone: "+91 43210 98765",
    verified: true,
    lat: 28.5484,
    lng: 77.2340,
  },
];

export function filterDoctors(
  doctors: Doctor[],
  specialization?: string,
  maxFees?: number,
  maxDistance?: number
): Doctor[] {
  return doctors.filter((doctor) => {
    if (specialization && specialization !== "All" && doctor.specialization !== specialization) {
      return false;
    }
    if (maxFees && doctor.fees > maxFees) {
      return false;
    }
    if (maxDistance && doctor.distance > maxDistance) {
      return false;
    }
    return true;
  });
}

export function getUniqueSpecializations(doctors: Doctor[]): string[] {
  const specializations = new Set(doctors.map((d) => d.specialization));
  return ["All", ...Array.from(specializations)];
}
