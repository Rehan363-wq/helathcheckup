export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  degree: string;
  area: string;
  city: string;
  fees: number;
  rating: number;
  distance: number;
  phone: string;
  verified: boolean;
  lat: number;
  lng: number;
  imageUrl?: string;
  is_approved?: boolean;
}

export interface DoctorFilter {
  specialization: string;
  maxFees: number;
  maxDistance: number;
}
