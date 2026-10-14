export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'therapist' | 'parent' | 'admin';
}

export type Ling6Phoneme = 'm' | 'ah' | 'oo' | 'ee' | 'sh' | 's';

export interface Ling6PhonemeDetail {
  sound: Ling6Phoneme;
  name: string;
  mascot: string;
  frequencyBand: string;
  approxHz: string;
  description: string;
  animal: string;
  color: string;
}

export interface Ling6Result {
  phoneme: Ling6Phoneme;
  detected: boolean;
  discriminated: boolean;
  distanceMeters: number; // 1, 2, or 3 meters
  reactionTimeMs?: number;
  note?: string;
}

export interface Student {
  id: string;
  userId?: string;
  name: string;
  age: number;
  gender?: string;
  diagnosis: string; // e.g. "Cochlear Implant - Bilateral", "Speech Delay", "Auditory Neuropathy"
  hearingDevice: string; // e.g. "Bilateral CI (Nucleus 8)", "Hearing Aids", "None"
  hearingLossEar?: 'left' | 'right' | 'both';
  operationYear?: string;
  ageAtOperation?: string;
  hearingDeviceType?: 'aid' | 'implant' | 'none';
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  streak: number;
  points?: number;
  lingDaysPracticed?: number;
  lastSessionDate?: string;
  enrolledDate: string;
  assignedTherapist: string;
  targetSounds: Ling6Phoneme[];
  level: number;
  notes?: string;
  avatarSeed?: string;
}

export type TherapyCategory =
  | 'ling6_calibration'
  | 'listening_forest'
  | 'articulation'
  | 'comprehension'
  | 'sound_island'
  | 'alphabet_town'
  | 'number_mountain';

export interface TherapySession {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // ISO date string
  durationMinutes: number;
  category: TherapyCategory;
  score: number; // 0 - 100
  ling6Results?: Record<string, Ling6Result>;
  notes: string;
  attended: boolean;
  syncedToDrive?: boolean;
}

export interface ClassSchedule {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  recurrence: 'weekly' | 'biweekly' | 'daily';
  therapist: string;
  roomOrLink: string;
  googleCalendarEventId?: string | null;
  lastSyncedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'excused' | 'milestone_met';
  streakCount: number;
  notes?: string;
}

export interface WorkspaceSyncStatus {
  driveConnected: boolean;
  calendarConnected: boolean;
  gmailConnected: boolean;
  sheetsConnected: boolean;
  lastDriveSync?: string;
  lastCalendarSync?: string;
  lastEmailSent?: string;
  lastSheetExport?: string;
}

export interface LimitedTimeReward {
  id: string;
  name: string;
  icon: string;
  costPoints: number;
  durationHours: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  purchasedAt?: number | null;
  expiresAt?: number | null;
}

