import { WorkEntry, DayType } from '@/types';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('uk-UA', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

export function getDayType(dateStr: string): DayType {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0) return 'sunday';
  if (day === 6) return 'saturday';
  return 'weekday';
}

export function calculateHours(start: string, end: string, travelMinutes: number = 0): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let minutes = (eh * 60 + em) - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60; // overnight support
  return (minutes + (travelMinutes || 0)) / 60;
}

export function calculateEarnings(hours: number, dayType: DayType, rate: number): number {
  let earnings = 0;

  if (dayType === 'sunday') {
    earnings = hours * rate * 2;
  } else if (dayType === 'saturday') {
    earnings = hours * rate * 1.5;
  } else {
    // Weekday
    if (hours <= 8) {
      earnings = hours * rate;
    } else if (hours <= 12) {
      earnings = 8 * rate + (hours - 8) * rate * 1.5;
    } else {
      earnings = 8 * rate + 4 * rate * 1.5 + (hours - 12) * rate;
    }
  }
  return Math.round(earnings);
}

export function getEntriesForMonth(entries: WorkEntry[], year: number, month: number): WorkEntry[] {
  return entries.filter(entry => {
    const d = new Date(entry.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function generateDemoEntries(): WorkEntry[] {
  const now = new Date().toISOString();
  return [
    { 
      id: Date.now() + 1, 
      date: "2026-01-05", 
      startTime: "09:00", 
      endTime: "17:30", 
      workType: "onsite", 
      comment: "Звичайний робочий день", 
      rateUsed: 180,
      createdAt: now 
    },
    { 
      id: Date.now() + 2, 
      date: "2026-01-08", 
      startTime: "08:30", 
      endTime: "19:00", 
      workType: "business_trip", 
      location: "м. Львів, конференція", 
      isDriver: true, 
      hasTravel: true, 
      travelTimeMinutes: 120, 
      comment: "Конференція з партнерами", 
      rateUsed: 180,
      createdAt: now 
    },
    { 
      id: Date.now() + 3, 
      date: "2026-01-12", 
      startTime: "09:00", 
      endTime: "21:00", 
      workType: "onsite", 
      comment: "Закриття кварталу", 
      rateUsed: 180,
      createdAt: now 
    },
    { 
      id: Date.now() + 4, 
      date: "2026-01-17", 
      startTime: "10:00", 
      endTime: "16:00", 
      workType: "business_trip", 
      location: "м. Одеса, зустріч з клієнтом", 
      hasTravel: true, 
      travelTimeMinutes: 90, 
      rateUsed: 180,
      createdAt: now 
    },
    { 
      id: Date.now() + 5, 
      date: "2026-01-25", 
      startTime: "08:00", 
      endTime: "20:30", 
      workType: "onsite", 
      comment: "Понаднормовий день", 
      rateUsed: 180,
      createdAt: now 
    },
  ];
}