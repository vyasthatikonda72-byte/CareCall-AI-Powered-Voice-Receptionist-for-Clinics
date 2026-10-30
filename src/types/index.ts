export type Language = 'en' | 'hi' | 'te';

export interface Department {
  id: string;
  name: string;
  icon: string;
  description: string;
  floor: string;
  activeDoctorsCount?: number;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  experienceYears: number;
  avatar: string;
  qualification: string;
  consultationFee: number;
  availableDays: string[];
  availableSlots: string[];
  status: 'available' | 'in_consultation' | 'on_leave';
  roomNumber: string;
  languages: string[];
  bio: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  type: 'in_person' | 'video_consult';
  notes: string;
  bookedVia: 'ai_voice' | 'web_portal' | 'staff';
  createdAt: string;
  callId?: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  medicalHistory: string[];
  lastVisit: string;
  totalVisits: number;
}

export interface TranscriptItem {
  id: string;
  speaker: 'ai' | 'patient';
  text: string;
  timestamp: string;
  language?: Language;
}

export interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  timestamp: string;
  durationSeconds: number;
  status: 'completed' | 'escalated' | 'missed';
  language: Language;
  intent: 'book_appointment' | 'reschedule' | 'cancel' | 'inquiry' | 'emergency' | 'doctor_availability';
  sentiment: 'positive' | 'neutral' | 'urgent';
  summary: string;
  appointmentId?: string;
  escalatedToStaff: boolean;
  escalationReason?: string;
  transcripts: TranscriptItem[];
  channel: 'browser_voice' | 'bolna_phone';
}

export interface Reminder {
  id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'calling' | 'confirmed' | 'reschedule_requested' | 'unreachable';
  channel: 'bolna_voice_call' | 'whatsapp' | 'sms';
  lastContactedAt?: string;
  patientResponse?: string;
}

export interface Escalation {
  id: string;
  callId?: string;
  patientName: string;
  patientPhone: string;
  urgency: 'critical' | 'high' | 'medium';
  reason: string;
  status: 'pending' | 'in_progress' | 'resolved';
  assignedStaff?: string;
  createdAt: string;
  notes?: string;
}

export interface ClinicSettings {
  clinicName: string;
  tagline: string;
  address: string;
  phone: string;
  emergencyContact: string;
  operatingHours: string;
  bolnaApiKey: string;
  bolnaAgentId: string;
  bolnaPhoneNumber: string;
  isDemoMode: boolean;
  aiVoiceGreetingEn: string;
  aiVoiceGreetingHi: string;
  aiVoiceGreetingTe: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "10 ml", "1 puff"
  frequency: string; // e.g. "1-0-1 (Twice daily)", "1-1-1 (Thrice daily)", "0-0-1 (Night)", "SOS (As needed)"
  duration: string; // e.g. "5 days", "10 days", "1 month"
  route: string; // e.g. "Oral", "Topical", "Inhalation", "Ophthalmic", "Sublingual"
  instructions: string; // e.g. "After food", "Before food", "With warm water"
  quantity: string; // e.g. "10 Tablets", "1 Bottle", "1 Tube"
}

export interface PrescriptionAuditEntry {
  timestamp: string;
  action: 'created' | 'updated' | 'approved' | 'dispensed';
  actorName: string;
  actorRole: 'doctor' | 'admin' | 'staff';
  notes?: string;
}

export interface Prescription {
  id: string; // e.g. "RX-2026-001"
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';

  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorRegistrationNumber: string; // e.g. "MCI-48291/2014"
  doctorDepartment: string;

  appointmentId?: string; // Connected to appointment
  consultationDate: string; // YYYY-MM-DD
  prescriptionDate: string; // YYYY-MM-DD

  diagnosis: string;
  clinicalNotes?: string;
  allergies?: string[]; // e.g. ["Penicillin", "Sulfa drugs"] or ["No known allergies"]
  vitalSigns?: {
    bloodPressure?: string;
    pulse?: string;
    temperature?: string;
    weight?: string;
  };

  medicines: MedicineItem[];

  generalInstructions?: string;
  dietAdvice?: string;
  followUpDate?: string; // YYYY-MM-DD

  status: 'draft' | 'approved' | 'dispensed';
  authorizedDoctorName?: string;
  authorizedSignature?: string;

  auditTrail: PrescriptionAuditEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  totalCalls: number;
  resolvedByAiPercent: number;
  activeEscalations: number;
  upcomingReminders: number;
  totalPrescriptions?: number;
  todayPrescriptions?: number;
  pendingPrescriptions?: number;
}

