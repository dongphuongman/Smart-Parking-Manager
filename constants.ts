import { VehicleType } from './types';
import { LayoutDashboard, Car, History, Settings } from 'lucide-react';

export const PARKING_RATES: Record<VehicleType, number> = {
  [VehicleType.CAR]: 20000,      // 20k per hour
  [VehicleType.MOTORBIKE]: 5000, // 5k per block
  [VehicleType.TRUCK]: 30000,    // 30k per hour
  [VehicleType.BICYCLE]: 2000,   // 2k per block
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'entry', label: 'Nhận diện & Vào', icon: Car },
  { id: 'history', label: 'Lịch sử & Ra', icon: History },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export const MOCK_HISTORY = []; // Start empty or add seed data if needed