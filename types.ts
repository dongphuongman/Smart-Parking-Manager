export enum VehicleType {
  CAR = 'Ô tô',
  MOTORBIKE = 'Xe máy',
  TRUCK = 'Xe tải',
  BICYCLE = 'Xe đạp'
}

export interface ParkingEntry {
  id: string;
  plateNumber: string;
  vehicleType: VehicleType;
  checkInTime: Date;
  checkOutTime?: Date;
  imageUrl?: string; // Base64 of the entry image
  status: 'PARKED' | 'COMPLETED';
  fee?: number;
  color?: string;
}

export interface LicensePlateAnalysis {
  plateNumber: string;
  vehicleType: VehicleType;
  color: string;
  confidence: number;
}

export interface DashboardStats {
  totalParked: number;
  todayRevenue: number;
  todayTraffic: number;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Shift {
  id: string;
  name: string; // e.g., "Ca Sáng"
  startTime: string; // "06:00"
  endTime: string; // "14:00"
}

export type ParkingRates = Record<VehicleType, number>;