export interface WorkEntry {
  id: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  workType: 'onsite' | 'business_trip';
  location?: string | null;
  isDriver?: boolean;
  hasTravel?: boolean;
  travelTimeMinutes?: number;
  comment?: string;
  rateUsed: number;
  createdAt: string;
  userId?: number; // for future multi-user
}

export interface User {
  id: number;
  name: string;
  email: string;
  rate: number;
  role: 'user' | 'admin';
}

export type DayType = 'weekday' | 'saturday' | 'sunday';

export interface CalendarDay {
  day: number;
  dateStr: string | null;
  isOtherMonth: boolean;
  entry?: WorkEntry;
}