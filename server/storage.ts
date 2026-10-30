import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Department,
  Doctor,
  Appointment,
  Patient,
  CallRecord,
  Reminder,
  Escalation,
  ClinicSettings,
  DashboardStats,
  Prescription,
  MedicineItem,
  PrescriptionAuditEntry,
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '..', 'data', 'db.json');

interface DatabaseSchema {
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  patients: Patient[];
  calls: CallRecord[];
  reminders: Reminder[];
  escalations: Escalation[];
  settings: ClinicSettings;
  prescriptions: Prescription[];
}

const initialDepartments: Department[] = [
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    icon: 'Heart',
    description: 'Comprehensive heart care, ECG, echocardiography, and hypertension management.',
    floor: 'Floor 2, Wing A',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-derma',
    name: 'Dermatology',
    icon: 'Sparkles',
    description: 'Advanced skin, hair, allergy treatment, and clinical cosmetology.',
    floor: 'Floor 1, Wing B',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-pedia',
    name: 'Pediatrics',
    icon: 'Baby',
    description: 'Child wellness, vaccinations, pediatric infectious diseases, and growth tracking.',
    floor: 'Floor 1, Wing A',
    activeDoctorsCount: 1,
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics',
    icon: 'Bone',
    description: 'Joint pain, sports injury rehabilitation, fracture care, and arthritis therapy.',
    floor: 'Floor 3, Wing B',
    activeDoctorsCount: 1,
  },
  {
    id: 'dept-genmed',
    name: 'General Medicine',
    icon: 'Stethoscope',
    description: 'Primary care, fever clinic, diabetes control, preventive health checkups.',
    floor: 'Floor 1, Wing C',
    activeDoctorsCount: 2,
  },
  {
    id: 'dept-ent',
    name: 'ENT (Ear, Nose & Throat)',
    icon: 'Ear',
    description: 'Sinusitis, hearing assessments, tonsillitis, and endoscopic ENT diagnostics.',
    floor: 'Floor 2, Wing C',
    activeDoctorsCount: 1,
  },
];

const initialDoctors: Doctor[] = [
  {
    id: 'doc-priya-sharma',
    name: 'Dr. Priya Sharma',
    departmentId: 'dept-derma',
    departmentName: 'Dermatology',
    specialization: 'Consultant Dermatologist & Trichologist',
    experienceYears: 11,
    avatar: 'https://images.unsplash.com/photo-1594824813634-938743ef6d1a?auto=format&fit=crop&w=400&q=80',
    qualification: 'MD, DNB (Dermatology) - AIIMS',
    consultationFee: 700,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '04:00 PM', '05:30 PM', '06:30 PM'],
    status: 'available',
    roomNumber: 'OPD 104',
    languages: ['English', 'Hindi', 'Telugu'],
    bio: 'Specialist in adult and pediatric skin conditions, acne scarring, and hair restoration.',
  },
  {
    id: 'doc-rajesh-varma',
    name: 'Dr. Rajesh Varma',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    specialization: 'Senior Interventional Cardiologist',
    experienceYears: 18,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    qualification: 'DM (Cardiology), FACC',
    consultationFee: 1000,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM', '06:00 PM'],
    status: 'available',
    roomNumber: 'OPD 201',
    languages: ['English', 'Telugu', 'Hindi'],
    bio: 'Renowned heart specialist focusing on preventive cardiology and rhythm management.',
  },
  {
    id: 'doc-ananya-reddy',
    name: 'Dr. Ananya Reddy',
    departmentId: 'dept-pedia',
    departmentName: 'Pediatrics',
    specialization: 'Child Specialist & Neonatologist',
    experienceYears: 9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    qualification: 'MD (Pediatrics), DCH',
    consultationFee: 600,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '04:00 PM', '05:30 PM'],
    status: 'available',
    roomNumber: 'OPD 108',
    languages: ['English', 'Telugu', 'Hindi'],
    bio: 'Gentle and experienced pediatrician dedicated to infant care and developmental screening.',
  },
  {
    id: 'doc-vikram-singh',
    name: 'Dr. Vikram Singh',
    departmentId: 'dept-ortho',
    departmentName: 'Orthopedics',
    specialization: 'Orthopedic & Joint Replacement Surgeon',
    experienceYears: 15,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    qualification: 'MS (Ortho), MCh (Joint Surgery)',
    consultationFee: 850,
    availableDays: ['Tue', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['10:30 AM', '12:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
    status: 'available',
    roomNumber: 'OPD 302',
    languages: ['English', 'Hindi'],
    bio: 'Expert in sports injuries, knee arthroscopy, minimally invasive fracture stabilization.',
  },
  {
    id: 'doc-sunita-rao',
    name: 'Dr. Sunita Rao',
    departmentId: 'dept-genmed',
    departmentName: 'General Medicine',
    specialization: 'Senior Physician & Diabetologist',
    experienceYears: 20,
    avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
    qualification: 'MD (General Medicine)',
    consultationFee: 500,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableSlots: ['08:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
    status: 'available',
    roomNumber: 'OPD 102',
    languages: ['English', 'Telugu', 'Hindi'],
    bio: 'Comprehensive diagnostic medicine with focus on chronic metabolic conditions and geriatrics.',
  },
  {
    id: 'doc-arjun-nair',
    name: 'Dr. Arjun Nair',
    departmentId: 'dept-ent',
    departmentName: 'ENT',
    specialization: 'Otolaryngologist & Head-Neck Specialist',
    experienceYears: 12,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    qualification: 'MS (ENT), DLO',
    consultationFee: 650,
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM', '06:00 PM'],
    status: 'in_consultation',
    roomNumber: 'OPD 204',
    languages: ['English', 'Hindi'],
    bio: 'Expertise in chronic sinusitis, allergic rhinitis, micro-ear surgery, and vocal cord care.',
  },
];

const todayDateStr = new Date().toISOString().split('T')[0];
const tomorrowDate = new Date();
tomorrowDate.setDate(tomorrowDate.getDate() + 1);
const tomorrowDateStr = tomorrowDate.toISOString().split('T')[0];
const nextDayDate = new Date();
nextDayDate.setDate(nextDayDate.getDate() + 2);
const nextDayDateStr = nextDayDate.toISOString().split('T')[0];

const initialAppointments: Appointment[] = [
  {
    id: 'CC-2026-101',
    patientName: 'Rohan Mehra',
    patientPhone: '+91 98490 12345',
    patientEmail: 'rohan.mehra@gmail.com',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    department: 'Dermatology',
    date: todayDateStr,
    timeSlot: '09:30 AM',
    status: 'confirmed',
    type: 'in_person',
    notes: 'Skin rash on forehead for 2 weeks. Booked via CareCall Voice Assistant.',
    bookedVia: 'ai_voice',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    callId: 'CALL-8841',
  },
  {
    id: 'CC-2026-102',
    patientName: 'Sujatha Krishna',
    patientPhone: '+91 94401 56789',
    patientEmail: 'sujatha.k@outlook.com',
    doctorId: 'doc-rajesh-varma',
    doctorName: 'Dr. Rajesh Varma',
    department: 'Cardiology',
    date: todayDateStr,
    timeSlot: '11:30 AM',
    status: 'confirmed',
    type: 'in_person',
    notes: 'Regular hypertension checkup & 6-month blood pressure review.',
    bookedVia: 'web_portal',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'CC-2026-103',
    patientName: 'Aarav Patel (Parent: Neha Patel)',
    patientPhone: '+91 97112 34567',
    patientEmail: 'neha.patel@yahoo.com',
    doctorId: 'doc-ananya-reddy',
    doctorName: 'Dr. Ananya Reddy',
    department: 'Pediatrics',
    date: todayDateStr,
    timeSlot: '04:00 PM',
    status: 'confirmed',
    type: 'in_person',
    notes: '2-year routine vaccination and milestone evaluation.',
    bookedVia: 'ai_voice',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    callId: 'CALL-8839',
  },
  {
    id: 'CC-2026-104',
    patientName: 'Kalyan Chakravarthy',
    patientPhone: '+91 98850 99881',
    patientEmail: 'kalyan.c@gmail.com',
    doctorId: 'doc-vikram-singh',
    doctorName: 'Dr. Vikram Singh',
    department: 'Orthopedics',
    date: tomorrowDateStr,
    timeSlot: '10:30 AM',
    status: 'confirmed',
    type: 'in_person',
    notes: 'Right knee joint ache following morning jogging.',
    bookedVia: 'ai_voice',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    callId: 'CALL-8835',
  },
  {
    id: 'CC-2026-105',
    patientName: 'Meenakshi Iyer',
    patientPhone: '+91 98200 44321',
    patientEmail: 'm.iyer@gmail.com',
    doctorId: 'doc-sunita-rao',
    doctorName: 'Dr. Sunita Rao',
    department: 'General Medicine',
    date: tomorrowDateStr,
    timeSlot: '10:00 AM',
    status: 'confirmed',
    type: 'in_person',
    notes: 'HbA1c diabetes follow-up and prescription refill.',
    bookedVia: 'web_portal',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'CC-2026-106',
    patientName: 'Gaurav Kulkarni',
    patientPhone: '+91 99300 77112',
    patientEmail: 'gkulkarni@gmail.com',
    doctorId: 'doc-arjun-nair',
    doctorName: 'Dr. Arjun Nair',
    department: 'ENT',
    date: nextDayDateStr,
    timeSlot: '03:00 PM',
    status: 'pending',
    type: 'in_person',
    notes: 'Mild tinnitus and left ear blockage.',
    bookedVia: 'staff',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'CC-2026-107',
    patientName: 'Venkatesh Babu',
    patientPhone: '+91 98480 33441',
    patientEmail: 'vbabu@gmail.com',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    department: 'Dermatology',
    date: todayDateStr,
    timeSlot: '02:30 PM',
    status: 'completed',
    type: 'in_person',
    notes: 'Eczema review. Prescribed moisturizing regimen.',
    bookedVia: 'ai_voice',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

const initialPatients: Patient[] = [
  {
    id: 'pat-101',
    name: 'Rohan Mehra',
    phone: '+91 98490 12345',
    email: 'rohan.mehra@gmail.com',
    age: 32,
    gender: 'Male',
    bloodGroup: 'B+',
    medicalHistory: ['Mild dust allergy'],
    lastVisit: todayDateStr,
    totalVisits: 2,
  },
  {
    id: 'pat-102',
    name: 'Sujatha Krishna',
    phone: '+91 94401 56789',
    email: 'sujatha.k@outlook.com',
    age: 56,
    gender: 'Female',
    bloodGroup: 'O+',
    medicalHistory: ['Hypertension (Stage 1)', 'Osteoarthritis'],
    lastVisit: todayDateStr,
    totalVisits: 5,
  },
  {
    id: 'pat-103',
    name: 'Aarav Patel',
    phone: '+91 97112 34567',
    email: 'neha.patel@yahoo.com',
    age: 2,
    gender: 'Male',
    bloodGroup: 'A+',
    medicalHistory: ['None'],
    lastVisit: todayDateStr,
    totalVisits: 4,
  },
  {
    id: 'pat-104',
    name: 'Kalyan Chakravarthy',
    phone: '+91 98850 99881',
    email: 'kalyan.c@gmail.com',
    age: 44,
    gender: 'Male',
    bloodGroup: 'AB+',
    medicalHistory: ['Meniscus strain (2023)'],
    lastVisit: '2026-08-14',
    totalVisits: 3,
  },
  {
    id: 'pat-105',
    name: 'Meenakshi Iyer',
    phone: '+91 98200 44321',
    email: 'm.iyer@gmail.com',
    age: 61,
    gender: 'Female',
    bloodGroup: 'O-',
    medicalHistory: ['Type 2 Diabetes', 'Dyslipidemia'],
    lastVisit: '2026-07-20',
    totalVisits: 8,
  },
];

const initialCalls: CallRecord[] = [
  {
    id: 'CALL-8841',
    callerName: 'Rohan Mehra',
    callerPhone: '+91 98490 12345',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    durationSeconds: 94,
    status: 'completed',
    language: 'en',
    intent: 'book_appointment',
    sentiment: 'positive',
    summary: 'Caller requested an evening dermatology consultation for a skin rash. Dr. Priya Sharma slot at 09:30 AM confirmed.',
    appointmentId: 'CC-2026-101',
    escalatedToStaff: false,
    channel: 'browser_voice',
    transcripts: [
      {
        id: 't-1',
        speaker: 'ai',
        text: 'Welcome to CityCare Clinic! How may I help you today?',
        timestamp: '00:02',
        language: 'en',
      },
      {
        id: 't-2',
        speaker: 'patient',
        text: 'Hello, I want to book an appointment with a dermatologist for a skin allergy.',
        timestamp: '00:08',
        language: 'en',
      },
      {
        id: 't-3',
        speaker: 'ai',
        text: 'Certainly! Dr. Priya Sharma is our chief dermatologist. She has slots available today at 09:30 AM and 05:30 PM. Which works best for you?',
        timestamp: '00:15',
        language: 'en',
      },
      {
        id: 't-4',
        speaker: 'patient',
        text: '09:30 AM is perfect.',
        timestamp: '00:20',
        language: 'en',
      },
      {
        id: 't-5',
        speaker: 'ai',
        text: 'Got it. May I have your full name and contact number to confirm the booking?',
        timestamp: '00:26',
        language: 'en',
      },
      {
        id: 't-6',
        speaker: 'patient',
        text: 'Rohan Mehra, phone number 98490 12345.',
        timestamp: '00:32',
        language: 'en',
      },
      {
        id: 't-7',
        speaker: 'ai',
        text: 'Thank you Mr. Rohan! Your appointment with Dr. Priya Sharma is booked for today at 09:30 AM. Your booking ID is CC-2026-101. A confirmation SMS has been dispatched. Take care!',
        timestamp: '00:41',
        language: 'en',
      },
    ],
  },
  {
    id: 'CALL-8839',
    callerName: 'Neha Patel',
    callerPhone: '+91 97112 34567',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    durationSeconds: 112,
    status: 'completed',
    language: 'hi',
    intent: 'book_appointment',
    sentiment: 'positive',
    summary: 'Caller spoke in Hindi requesting pediatrician for child vaccination. Confirmed with Dr. Ananya Reddy.',
    appointmentId: 'CC-2026-103',
    escalatedToStaff: false,
    channel: 'bolna_phone',
    transcripts: [
      {
        id: 't-11',
        speaker: 'ai',
        text: 'सिटीकेयर क्लिनिक में आपका स्वागत है! मैं आपकी क्या सहायता कर सकती हूँ?',
        timestamp: '00:02',
        language: 'hi',
      },
      {
        id: 't-12',
        speaker: 'patient',
        text: 'नमस्ते, मुझे अपने 2 साल के बच्चे के टीके के लिए बाल रोग विशेषज्ञ से मिलना है।',
        timestamp: '00:10',
        language: 'hi',
      },
      {
        id: 't-13',
        speaker: 'ai',
        text: 'जी बिल्कुल! हमारे यहाँ डॉ. अनन्या रेड्डी उपलब्ध हैं। क्या आप आज शाम 4:00 बजे आ सकते हैं?',
        timestamp: '00:18',
        language: 'hi',
      },
      {
        id: 't-14',
        speaker: 'patient',
        text: 'हाँ, 4:00 बजे का समय ठीक है।',
        timestamp: '00:24',
        language: 'hi',
      },
      {
        id: 't-15',
        speaker: 'ai',
        text: 'बहुत खूब। आपका अपॉइंटमेंट डॉ. अनन्या रेड्डी के साथ आज शाम 4:00 बजे बुक कर दिया गया है। आपका बुकिंग आईडी CC-2026-103 है।',
        timestamp: '00:35',
        language: 'hi',
      },
    ],
  },
  {
    id: 'CALL-8837',
    callerName: 'Venkata Satyanarayana',
    callerPhone: '+91 94900 88221',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
    durationSeconds: 78,
    status: 'escalated',
    language: 'te',
    intent: 'emergency',
    sentiment: 'urgent',
    summary: 'Caller reported acute chest tightness and breathlessness. AI recognized red-flag symptoms, triggered emergency handoff to staff and advised immediate ER/108 call.',
    escalatedToStaff: true,
    escalationReason: 'Emergency Red-Flag: Acute chest discomfort and dyspnea.',
    channel: 'browser_voice',
    transcripts: [
      {
        id: 't-21',
        speaker: 'ai',
        text: 'సిటీకేర్ క్లినిక్‌కి స్వాగతం! మీకు ఎలా సహాయపడగలను?',
        timestamp: '00:02',
        language: 'te',
      },
      {
        id: 't-22',
        speaker: 'patient',
        text: 'నాకు ఛాతీలో చాలా నొప్పిగా ఉంది, ఊపిరి తీసుకోవడం కష్టంగా ఉంది. వెంటనే డాక్టర్ కావాలి.',
        timestamp: '00:12',
        language: 'te',
      },
      {
        id: 't-23',
        speaker: 'ai',
        text: 'దయచేసి వినండి, ఇది అత్యవసర వైద్య పరిస్థితి కావచ్చు. నేను వెంటనే మా క్లినిక్ డ్యూటీ స్టాఫ్‌కి కాల్ బదిలీ చేస్తున్నాను. దయచేసి సమీపంలోని అత్యవసర సేవలు (108) కి కూడా వెంటనే కాల్ చేయండి!',
        timestamp: '00:22',
        language: 'te',
      },
    ],
  },
];

const initialReminders: Reminder[] = [
  {
    id: 'rem-101',
    appointmentId: 'CC-2026-101',
    patientName: 'Rohan Mehra',
    patientPhone: '+91 98490 12345',
    doctorName: 'Dr. Priya Sharma',
    appointmentDate: todayDateStr,
    appointmentTime: '09:30 AM',
    status: 'confirmed',
    channel: 'bolna_voice_call',
    lastContactedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    patientResponse: 'Confirmed attendance via voice prompt.',
  },
  {
    id: 'rem-102',
    appointmentId: 'CC-2026-104',
    patientName: 'Kalyan Chakravarthy',
    patientPhone: '+91 98850 99881',
    doctorName: 'Dr. Vikram Singh',
    appointmentDate: tomorrowDateStr,
    appointmentTime: '10:30 AM',
    status: 'scheduled',
    channel: 'bolna_voice_call',
  },
  {
    id: 'rem-103',
    appointmentId: 'CC-2026-105',
    patientName: 'Meenakshi Iyer',
    patientPhone: '+91 98200 44321',
    doctorName: 'Dr. Sunita Rao',
    appointmentDate: tomorrowDateStr,
    appointmentTime: '10:00 AM',
    status: 'scheduled',
    channel: 'bolna_voice_call',
  },
  {
    id: 'rem-104',
    appointmentId: 'CC-2026-106',
    patientName: 'Gaurav Kulkarni',
    patientPhone: '+91 99300 77112',
    doctorName: 'Dr. Arjun Nair',
    appointmentDate: nextDayDateStr,
    appointmentTime: '03:00 PM',
    status: 'scheduled',
    channel: 'sms',
  },
];

const initialEscalations: Escalation[] = [
  {
    id: 'esc-1',
    callId: 'CALL-8837',
    patientName: 'Venkata Satyanarayana',
    patientPhone: '+91 94900 88221',
    urgency: 'critical',
    reason: 'Emergency Red-Flag: Acute chest discomfort and dyspnea reported in Telugu call.',
    status: 'in_progress',
    assignedStaff: 'Nurse Supervisor Anitha',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    notes: 'Contacted patient family; patient reached Emergency Room, currently under ECG monitoring.',
  },
  {
    id: 'esc-2',
    patientName: 'Kavita Deshmukh',
    patientPhone: '+91 98234 11223',
    urgency: 'high',
    reason: 'Requested custom prescription adjustment for hypertension medication while doctor was unavailable.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Patient advised to await callback from Dr. Rajesh Varma OPD assistant.',
  },
];

const initialSettings: ClinicSettings = {
  clinicName: 'CityCare Multispecialty Clinic',
  tagline: 'Your Clinic Never Misses a Call',
  address: '104 Healthcare Blvd, Jubilee Hills, Hyderabad 500033',
  phone: '+91 98765 43210',
  emergencyContact: '108 / +91 98765 99999',
  operatingHours: 'Monday - Saturday: 8:00 AM - 8:30 PM | Sunday: 9:00 AM - 1:00 PM',
  bolnaApiKey: '',
  bolnaAgentId: '',
  bolnaPhoneNumber: '+1 415 800 2273',
  isDemoMode: true,
  aiVoiceGreetingEn: 'Welcome to CityCare Clinic! How may I help you today?',
  aiVoiceGreetingHi: 'सिटीकेयर क्लिनिक में आपका स्वागत है! मैं आपकी क्या सहायता कर सकती हूँ?',
  aiVoiceGreetingTe: 'సిటీకేర్ క్లినిక్‌కి స్వాగతం! మీకు ఎలా సహాయపడగలను?',
};

const initialPrescriptions: Prescription[] = [
  {
    id: 'RX-2026-001',
    patientId: 'pat-101',
    patientName: 'Rohan Mehra',
    patientPhone: '+91 98490 12345',
    patientEmail: 'rohan.mehra@gmail.com',
    patientAge: 32,
    patientGender: 'Male',
    doctorId: 'doc-priya-sharma',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialization: 'Consultant Dermatologist & Trichologist',
    doctorRegistrationNumber: 'MCI-52914/2013',
    doctorDepartment: 'Dermatology',
    appointmentId: 'CC-2026-101',
    consultationDate: todayDateStr,
    prescriptionDate: todayDateStr,
    diagnosis: 'Acute Contact Dermatitis & Facial Erythema',
    clinicalNotes: 'Mild pruritus and localized erythematous patches on forehead. Advised barrier repair and avoidance of scented cosmetics.',
    allergies: ['Mild dust allergy'],
    vitalSigns: {
      bloodPressure: '118/76 mmHg',
      pulse: '72 bpm',
      temperature: '98.4 F',
      weight: '72 kg',
    },
    medicines: [
      {
        id: 'med-1',
        name: 'Tab. Levocetirizine',
        dosage: '5 mg',
        frequency: '0-0-1 (Night only)',
        duration: '7 Days',
        route: 'Oral',
        instructions: 'After dinner at bedtime with water',
        quantity: '7 Tablets',
      },
      {
        id: 'med-2',
        name: 'Hydrocortisone 1% Cream',
        dosage: 'Thin layer',
        frequency: '1-0-1 (Twice daily)',
        duration: '5 Days',
        route: 'Topical',
        instructions: 'Apply gently on affected rash area',
        quantity: '1 Tube (15g)',
      },
      {
        id: 'med-3',
        name: 'Ceramide Barrier Lotion',
        dosage: 'Liberal application',
        frequency: '1-1-1 (Thrice daily)',
        duration: '30 Days',
        route: 'Topical',
        instructions: 'Apply 15 mins after medicated cream',
        quantity: '1 Bottle (100ml)',
      },
    ],
    generalInstructions: 'Wash face only with lukewarm water and a soap-free cleanser. Strictly avoid direct sun exposure without sunscreen.',
    dietAdvice: 'Stay well hydrated (3+ liters of water daily). Avoid high histamine or excessively spicy foods for 1 week.',
    followUpDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    status: 'approved',
    authorizedDoctorName: 'Dr. Priya Sharma, MD (AIIMS)',
    authorizedSignature: 'Digitally Verified: Dr. Priya Sharma [Reg: MCI-52914/2013]',
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        action: 'created',
        actorName: 'Dr. Priya Sharma',
        actorRole: 'doctor',
        notes: 'Initial clinical prescription recorded after OPD consultation',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        action: 'approved',
        actorName: 'Dr. Priya Sharma',
        actorRole: 'doctor',
        notes: 'Signed and approved digitally for patient release',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    id: 'RX-2026-002',
    patientId: 'pat-102',
    patientName: 'Sujatha Krishna',
    patientPhone: '+91 94401 56789',
    patientEmail: 'sujatha.k@outlook.com',
    patientAge: 56,
    patientGender: 'Female',
    doctorId: 'doc-rajesh-varma',
    doctorName: 'Dr. Rajesh Varma',
    doctorSpecialization: 'Senior Cardiologist & Interventional Heart Specialist',
    doctorRegistrationNumber: 'MCI-31802/2006',
    doctorDepartment: 'Cardiology',
    appointmentId: 'CC-2026-102',
    consultationDate: todayDateStr,
    prescriptionDate: todayDateStr,
    diagnosis: 'Essential Hypertension (Stage 1) - Review & Maintenance',
    clinicalNotes: 'Resting BP 138/88 mmHg. ECG normal sinus rhythm. Advised continued salt restriction and daily brisk walk.',
    allergies: ['No known drug allergies'],
    vitalSigns: {
      bloodPressure: '138/88 mmHg',
      pulse: '76 bpm',
      temperature: '98.2 F',
      weight: '64 kg',
    },
    medicines: [
      {
        id: 'med-4',
        name: 'Tab. Telmisartan',
        dosage: '40 mg',
        frequency: '1-0-0 (Morning)',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'After breakfast with water',
        quantity: '30 Tablets',
      },
      {
        id: 'med-5',
        name: 'Tab. Amlodipine',
        dosage: '5 mg',
        frequency: '0-0-1 (Night)',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'After dinner at bedtime',
        quantity: '30 Tablets',
      },
    ],
    generalInstructions: 'Maintain a home BP monitoring diary twice a week. Inform clinic if systolic reading exceeds 150 mmHg.',
    dietAdvice: 'Strict low-sodium (DASH diet). Restrict table salt to < 3g/day. Include potassium-rich fruits.',
    followUpDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    status: 'approved',
    authorizedDoctorName: 'Dr. Rajesh Varma, MD, DM (Cardiology)',
    authorizedSignature: 'Digitally Verified: Dr. Rajesh Varma [Reg: MCI-31802/2006]',
    auditTrail: [
      {
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        action: 'created',
        actorName: 'Dr. Rajesh Varma',
        actorRole: 'doctor',
        notes: '30-day hypertensive maintenance prescription issued',
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
        action: 'approved',
        actorName: 'Dr. Rajesh Varma',
        actorRole: 'doctor',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2.8).toISOString(),
  },
  {
    id: 'RX-2026-003',
    patientId: 'pat-104',
    patientName: 'Kalyan Chakravarthy',
    patientPhone: '+91 98850 99881',
    patientEmail: 'kalyan.c@gmail.com',
    patientAge: 44,
    patientGender: 'Male',
    doctorId: 'doc-vikram-singh',
    doctorName: 'Dr. Vikram Singh',
    doctorSpecialization: 'Consultant Orthopedic & Joint Surgeon',
    doctorRegistrationNumber: 'MCI-44199/2010',
    doctorDepartment: 'Orthopedics',
    appointmentId: 'CC-2026-104',
    consultationDate: tomorrowDateStr,
    prescriptionDate: todayDateStr,
    diagnosis: 'Medial Meniscus Strain & Mild Patellofemoral Arthralgia',
    clinicalNotes: 'Tenderness over right medial joint line. No ligamentous instability. Advised rest from running for 2 weeks.',
    allergies: ['No known allergies'],
    vitalSigns: {
      bloodPressure: '122/80 mmHg',
      pulse: '70 bpm',
      temperature: '98.6 F',
      weight: '78 kg',
    },
    medicines: [
      {
        id: 'med-6',
        name: 'Tab. Aceclofenac + Paracetamol',
        dosage: '100 mg / 325 mg',
        frequency: '1-0-1 (Twice daily)',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'Strictly after food with a glass of water',
        quantity: '10 Tablets',
      },
      {
        id: 'med-7',
        name: 'Cap. Pantoprazole',
        dosage: '40 mg',
        frequency: '1-0-0 (Morning)',
        duration: '5 Days',
        route: 'Oral',
        instructions: '30 mins before breakfast on empty stomach',
        quantity: '5 Capsules',
      },
      {
        id: 'med-8',
        name: 'Topical Diclofenac Gel',
        dosage: 'Apply small quantity',
        frequency: '1-1-1 (Thrice daily)',
        duration: '10 Days',
        route: 'Topical',
        instructions: 'Massage gently around right knee joint',
        quantity: '1 Tube (30g)',
      },
    ],
    generalInstructions: 'Wear hinged knee support sleeve during walking. Apply cold compress 15 minutes twice daily.',
    dietAdvice: 'Adequate protein and calcium intake. Avoid deep squats or stair climbing.',
    followUpDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    status: 'draft',
    authorizedDoctorName: 'Dr. Vikram Singh, MS (Ortho)',
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: 'created',
        actorName: 'Dr. Vikram Singh',
        actorRole: 'doctor',
        notes: 'Draft prescription created pending knee X-ray review',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class Storage {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private ensureDirExists(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      this.ensureDirExists(DB_FILE);
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          departments: parsed.departments || initialDepartments,
          doctors: parsed.doctors || initialDoctors,
          appointments: parsed.appointments || initialAppointments,
          patients: parsed.patients || initialPatients,
          calls: parsed.calls || initialCalls,
          reminders: parsed.reminders || initialReminders,
          escalations: parsed.escalations || initialEscalations,
          settings: parsed.settings || initialSettings,
          prescriptions: parsed.prescriptions || initialPrescriptions,
        };
      }
    } catch (err) {
      console.warn('Failed to read db.json, initializing fresh store:', err);
    }

    const defaultData: DatabaseSchema = {
      departments: initialDepartments,
      doctors: initialDoctors,
      appointments: initialAppointments,
      patients: initialPatients,
      calls: initialCalls,
      reminders: initialReminders,
      escalations: initialEscalations,
      settings: initialSettings,
      prescriptions: initialPrescriptions,
    };
    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDirExists(DB_FILE);
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to db.json:', err);
    }
  }

  // --- Departments ---
  getDepartments(): Department[] {
    return this.data.departments;
  }

  // --- Doctors ---
  getDoctors(): Doctor[] {
    return this.data.doctors;
  }

  getDoctorById(id: string): Doctor | undefined {
    return this.data.doctors.find((d) => d.id === id);
  }

  addDoctor(doctor: Doctor): Doctor {
    this.data.doctors.push(doctor);
    this.saveDatabase();
    return doctor;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const idx = this.data.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.doctors[idx] = { ...this.data.doctors[idx], ...updates };
    this.saveDatabase();
    return this.data.doctors[idx];
  }

  // --- Appointments ---
  getAppointments(): Appointment[] {
    return [...this.data.appointments].sort(
      (a, b) => new Date(`${b.date} ${b.timeSlot}`).getTime() - new Date(`${a.date} ${a.timeSlot}`).getTime()
    );
  }

  createAppointment(aptInput: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    // DOUBLE BOOKING CHECK: ensure doctor is not already booked at the same date & time slot
    const existingConflict = this.data.appointments.find(
      (a) =>
        a.doctorId === aptInput.doctorId &&
        a.date === aptInput.date &&
        a.timeSlot.trim().toLowerCase() === aptInput.timeSlot.trim().toLowerCase() &&
        a.status !== 'cancelled'
    );

    if (existingConflict) {
      throw new Error(
        `Doctor ${aptInput.doctorName || 'selected'} already has an appointment booked for ${aptInput.date} at ${aptInput.timeSlot}. Please select another time slot.`
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      ...aptInput,
      id: `CC-${new Date().getFullYear()}-${randomSuffix}`,
      createdAt: new Date().toISOString(),
    };

    this.data.appointments.unshift(newAppointment);

    // Also register or update patient record
    this.upsertPatientFromAppointment(newAppointment);

    // Automatically create an automated reminder for upcoming appointments
    const newReminder: Reminder = {
      id: `rem-${Date.now()}`,
      appointmentId: newAppointment.id,
      patientName: newAppointment.patientName,
      patientPhone: newAppointment.patientPhone,
      doctorName: newAppointment.doctorName,
      appointmentDate: newAppointment.date,
      appointmentTime: newAppointment.timeSlot,
      status: 'scheduled',
      channel: 'bolna_voice_call',
    };
    this.data.reminders.unshift(newReminder);

    this.saveDatabase();
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    // If changing date or timeslot, verify double booking
    if (updates.date || updates.timeSlot || updates.doctorId) {
      const targetDoctorId = updates.doctorId || this.data.appointments[idx].doctorId;
      const targetDate = updates.date || this.data.appointments[idx].date;
      const targetSlot = updates.timeSlot || this.data.appointments[idx].timeSlot;

      const conflict = this.data.appointments.find(
        (a) =>
          a.id !== id &&
          a.doctorId === targetDoctorId &&
          a.date === targetDate &&
          a.timeSlot.trim().toLowerCase() === targetSlot.trim().toLowerCase() &&
          a.status !== 'cancelled'
      );

      if (conflict) {
        throw new Error(`Double-booking conflict: That time slot is already taken.`);
      }
    }

    this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates };
    this.saveDatabase();
    return this.data.appointments[idx];
  }

  cancelAppointment(id: string, reason?: string): Appointment | null {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.appointments[idx].status = 'cancelled';
    if (reason) {
      this.data.appointments[idx].notes = `${this.data.appointments[idx].notes} [Cancelled: ${reason}]`;
    }
    this.saveDatabase();
    return this.data.appointments[idx];
  }

  // --- Patients ---
  getPatients(): Patient[] {
    return this.data.patients;
  }

  private upsertPatientFromAppointment(apt: Appointment) {
    const existing = this.data.patients.find(
      (p) => p.phone === apt.patientPhone || (p.email && p.email === apt.patientEmail)
    );
    if (existing) {
      existing.lastVisit = apt.date;
      existing.totalVisits += 1;
      if (!existing.medicalHistory.includes(apt.department)) {
        existing.medicalHistory.push(apt.department);
      }
    } else {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: apt.patientName,
        phone: apt.patientPhone,
        email: apt.patientEmail || `${apt.patientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        age: 30,
        gender: 'Other',
        bloodGroup: 'B+',
        medicalHistory: [apt.department],
        lastVisit: apt.date,
        totalVisits: 1,
      };
      this.data.patients.unshift(newPatient);
    }
  }

  addPatient(patientInput: Omit<Patient, 'id'> & { id?: string }): Patient {
    const newPatient: Patient = {
      ...patientInput,
      id: patientInput.id || `pat-${Date.now()}`,
      lastVisit: patientInput.lastVisit || new Date().toISOString().split('T')[0],
      totalVisits: patientInput.totalVisits || 1,
      medicalHistory: patientInput.medicalHistory || [],
    };
    this.data.patients.unshift(newPatient);
    this.saveDatabase();
    return newPatient;
  }

  // --- Calls & Transcripts ---
  getCalls(): CallRecord[] {
    return this.data.calls;
  }

  getCallById(id: string): CallRecord | undefined {
    return this.data.calls.find((c) => c.id === id);
  }

  addCall(callRecord: CallRecord): CallRecord {
    this.data.calls.unshift(callRecord);
    this.saveDatabase();
    return callRecord;
  }

  // --- Reminders ---
  getReminders(): Reminder[] {
    return this.data.reminders;
  }

  updateReminder(id: string, updates: Partial<Reminder>): Reminder | null {
    const idx = this.data.reminders.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.reminders[idx] = { ...this.data.reminders[idx], ...updates };
    this.saveDatabase();
    return this.data.reminders[idx];
  }

  // --- Escalations ---
  getEscalations(): Escalation[] {
    return this.data.escalations;
  }

  createEscalation(esc: Omit<Escalation, 'id' | 'createdAt'>): Escalation {
    const newEsc: Escalation = {
      ...esc,
      id: `esc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.escalations.unshift(newEsc);
    this.saveDatabase();
    return newEsc;
  }

  updateEscalation(id: string, updates: Partial<Escalation>): Escalation | null {
    const idx = this.data.escalations.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.escalations[idx] = { ...this.data.escalations[idx], ...updates };
    this.saveDatabase();
    return this.data.escalations[idx];
  }

  // --- Settings ---
  getSettings(): ClinicSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<ClinicSettings>): ClinicSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveDatabase();
    return this.data.settings;
  }

  // --- Prescriptions ---
  getPrescriptions(): Prescription[] {
    return this.data.prescriptions || [];
  }

  getPrescriptionById(id: string): Prescription | undefined {
    return (this.data.prescriptions || []).find((p) => p.id === id);
  }

  getPrescriptionsByPatientId(patientId: string): Prescription[] {
    return (this.data.prescriptions || []).filter((p) => p.patientId === patientId);
  }

  getPrescriptionsByPhone(phone: string): Prescription[] {
    const clean = phone.replace(/\D/g, '');
    if (!clean) return [];
    return (this.data.prescriptions || []).filter((p) => {
      const pClean = p.patientPhone.replace(/\D/g, '');
      return pClean.includes(clean) || clean.includes(pClean);
    });
  }

  getPrescriptionByAppointmentId(appointmentId: string): Prescription | undefined {
    return (this.data.prescriptions || []).find((p) => p.appointmentId === appointmentId);
  }

  createPrescription(data: Partial<Prescription>): Prescription {
    const today = new Date().toISOString().split('T')[0];
    const nextSeq = (this.data.prescriptions?.length || 0) + 1;
    const padded = nextSeq.toString().padStart(3, '0');
    const newId = data.id || `RX-2026-${padded}`;

    const newPrescription: Prescription = {
      id: newId,
      patientId: data.patientId || `pat-${Math.floor(100 + Math.random() * 900)}`,
      patientName: data.patientName || 'Patient',
      patientPhone: data.patientPhone || '',
      patientEmail: data.patientEmail || '',
      patientAge: data.patientAge || 30,
      patientGender: data.patientGender || 'Male',
      doctorId: data.doctorId || 'doc-priya-sharma',
      doctorName: data.doctorName || 'Dr. Priya Sharma',
      doctorSpecialization: data.doctorSpecialization || 'Consultant Dermatologist',
      doctorRegistrationNumber: data.doctorRegistrationNumber || 'MCI-52914/2013',
      doctorDepartment: data.doctorDepartment || 'Dermatology',
      appointmentId: data.appointmentId || undefined,
      consultationDate: data.consultationDate || today,
      prescriptionDate: data.prescriptionDate || today,
      diagnosis: data.diagnosis || 'Clinical consultation recorded',
      clinicalNotes: data.clinicalNotes || '',
      allergies: data.allergies && data.allergies.length > 0 ? data.allergies : ['No known drug allergies'],
      vitalSigns: data.vitalSigns || {
        bloodPressure: '120/80 mmHg',
        pulse: '72 bpm',
        temperature: '98.4 F',
        weight: '65 kg',
      },
      medicines: data.medicines && data.medicines.length > 0 ? data.medicines : [
        {
          id: `med-${Date.now()}-1`,
          name: 'Tab. Paracetamol',
          dosage: '650 mg',
          frequency: '1-0-1 (Twice daily)',
          duration: '3 Days',
          route: 'Oral',
          instructions: 'After meals with water',
          quantity: '6 Tablets',
        },
      ],
      generalInstructions: data.generalInstructions || 'Take medicines as prescribed. Ensure adequate hydration and rest.',
      dietAdvice: data.dietAdvice || 'Nutritious balanced diet with light, easily digestible food.',
      followUpDate: data.followUpDate || undefined,
      status: data.status || 'draft',
      authorizedDoctorName: data.status === 'approved' ? (data.authorizedDoctorName || data.doctorName) : undefined,
      authorizedSignature: data.status === 'approved'
        ? (data.authorizedSignature || `Digitally Verified: ${data.doctorName} [Reg: ${data.doctorRegistrationNumber || 'MCI-REG'}]`)
        : undefined,
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: data.status === 'approved' ? 'approved' : 'created',
          actorName: data.doctorName || 'Attending Physician',
          actorRole: 'doctor',
          notes: data.status === 'approved'
            ? 'Prescription verified and digitally signed by attending doctor'
            : 'Initial prescription draft recorded',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!this.data.prescriptions) {
      this.data.prescriptions = [];
    }

    this.data.prescriptions.unshift(newPrescription);
    this.saveDatabase();
    return newPrescription;
  }

  updatePrescription(
    id: string,
    updates: Partial<Prescription>,
    actorName: string = 'Doctor',
    actorRole: 'doctor' | 'admin' | 'staff' = 'doctor',
    auditNotes?: string
  ): Prescription | null {
    const idx = (this.data.prescriptions || []).findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = this.data.prescriptions[idx];
    const wasDraft = existing.status === 'draft';
    const isNowApproved = updates.status === 'approved';

    const auditEntry: PrescriptionAuditEntry = {
      timestamp: new Date().toISOString(),
      action: wasDraft && isNowApproved ? 'approved' : 'updated',
      actorName,
      actorRole,
      notes: auditNotes || (wasDraft && isNowApproved ? 'Prescription reviewed and digitally signed by doctor' : 'Prescription details updated'),
    };

    const updatedPrescription: Prescription = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      auditTrail: [...(existing.auditTrail || []), auditEntry],
    };

    if (isNowApproved && !updatedPrescription.authorizedSignature) {
      updatedPrescription.authorizedDoctorName = updatedPrescription.doctorName;
      updatedPrescription.authorizedSignature = `Digitally Verified: ${updatedPrescription.doctorName} [Reg: ${updatedPrescription.doctorRegistrationNumber || 'MCI-REG'}]`;
    }

    this.data.prescriptions[idx] = updatedPrescription;
    this.saveDatabase();
    return updatedPrescription;
  }

  deletePrescription(id: string): boolean {
    const initialLen = (this.data.prescriptions || []).length;
    this.data.prescriptions = (this.data.prescriptions || []).filter((p) => p.id !== id);
    if (this.data.prescriptions.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // --- Statistics ---
  getStats(): DashboardStats {
    const totalAppointments = this.data.appointments.length;
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.data.appointments.filter((a) => a.date === today).length;
    const completedAppointments = this.data.appointments.filter((a) => a.status === 'completed').length;
    const cancelledAppointments = this.data.appointments.filter((a) => a.status === 'cancelled').length;
    const pendingAppointments = this.data.appointments.filter(
      (a) => a.status === 'confirmed' || a.status === 'pending'
    ).length;
    const totalPatients = this.data.patients.length;
    const totalCalls = this.data.calls.length;

    const aiResolvedCalls = this.data.calls.filter((c) => !c.escalatedToStaff).length;
    const resolvedByAiPercent = totalCalls > 0 ? Math.round((aiResolvedCalls / totalCalls) * 100) : 92;
    const activeEscalations = this.data.escalations.filter((e) => e.status !== 'resolved').length;
    const upcomingReminders = this.data.reminders.filter((r) => r.status === 'scheduled').length;

    const totalPrescriptions = (this.data.prescriptions || []).length;
    const todayPrescriptions = (this.data.prescriptions || []).filter((p) => p.prescriptionDate === today).length;
    const pendingPrescriptions = (this.data.prescriptions || []).filter((p) => p.status === 'draft').length;

    return {
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      pendingAppointments,
      totalPatients,
      totalCalls,
      resolvedByAiPercent,
      activeEscalations,
      upcomingReminders,
      totalPrescriptions,
      todayPrescriptions,
      pendingPrescriptions,
    };
  }

  resetDatabase(): void {
    this.data = {
      departments: initialDepartments,
      doctors: initialDoctors,
      appointments: initialAppointments,
      patients: initialPatients,
      calls: initialCalls,
      reminders: initialReminders,
      escalations: initialEscalations,
      settings: initialSettings,
      prescriptions: initialPrescriptions,
    };
    this.saveDatabase();
  }
}

export const storage = new Storage();
