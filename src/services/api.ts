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
  Language,
  Prescription,
} from '../types/index.ts';

const API_BASE = '/api';

export async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch(`${API_BASE}/departments`);
  if (!res.ok) throw new Error('Failed to load departments');
  return res.json();
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API_BASE}/doctors`);
  if (!res.ok) throw new Error('Failed to load doctors');
  return res.json();
}

export async function createDoctor(doctorData: Partial<Doctor>): Promise<Doctor> {
  const res = await fetch(`${API_BASE}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData),
  });
  if (!res.ok) throw new Error('Failed to create doctor profile');
  return res.json();
}

export async function updateDoctorStatus(id: string, status: Doctor['status']): Promise<Doctor> {
  const res = await fetch(`${API_BASE}/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update doctor status');
  return res.json();
}

export async function updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
  const res = await fetch(`${API_BASE}/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update doctor');
  return res.json();
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const res = await fetch(`${API_BASE}/appointments`);
  if (!res.ok) throw new Error('Failed to load appointments');
  return res.json();
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create appointment');
  }
  return json;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update appointment');
  return json;
}

export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const url = reason ? `${API_BASE}/appointments/${id}?reason=${encodeURIComponent(reason)}` : `${API_BASE}/appointments/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to cancel appointment');
  return json;
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/patients`);
  if (!res.ok) throw new Error('Failed to load patients');
  return res.json();
}

export async function createPatient(patientData: Partial<Patient>): Promise<Patient> {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create patient record');
  return json;
}

export async function fetchCalls(): Promise<CallRecord[]> {
  const res = await fetch(`${API_BASE}/calls`);
  if (!res.ok) throw new Error('Failed to load calls');
  return res.json();
}

export async function saveCallRecord(callData: Partial<CallRecord>): Promise<CallRecord> {
  const res = await fetch(`${API_BASE}/calls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callData),
  });
  if (!res.ok) throw new Error('Failed to save call record');
  return res.json();
}

export async function fetchReminders(): Promise<Reminder[]> {
  const res = await fetch(`${API_BASE}/reminders`);
  if (!res.ok) throw new Error('Failed to load reminders');
  return res.json();
}

export async function triggerReminderCall(payload: {
  reminderId: string;
  patientPhone: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentId: string;
}) {
  const res = await fetch(`${API_BASE}/reminders/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to trigger reminder call');
  return json;
}

export async function updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
  const res = await fetch(`${API_BASE}/reminders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update reminder');
  return res.json();
}

export async function fetchEscalations(): Promise<Escalation[]> {
  const res = await fetch(`${API_BASE}/escalations`);
  if (!res.ok) throw new Error('Failed to load escalations');
  return res.json();
}

export async function updateEscalation(id: string, updates: Partial<Escalation>): Promise<Escalation> {
  const res = await fetch(`${API_BASE}/escalations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update escalation');
  return res.json();
}

export async function fetchSettings(): Promise<ClinicSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function updateSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load dashboard statistics');
  return res.json();
}

export async function resetDatabase(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/database/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export interface VoiceInteractionPayload {
  message: string;
  history: Array<{ speaker: 'ai' | 'patient'; text: string }>;
  language: Language;
  callerPhone?: string;
}

export interface VoiceInteractionResult {
  reply: string;
  language: Language;
  detectedIntent: 'book_appointment' | 'reschedule' | 'cancel' | 'inquiry' | 'emergency' | 'doctor_availability';
  action: 'none' | 'book_appointment' | 'cancel_appointment' | 'escalate';
  actionData?: any;
  escalation?: any;
  bookedAppointment?: Appointment | null;
  bookingError?: string | null;
  createdEscalation?: Escalation | null;
}

export async function sendVoiceInteraction(payload: VoiceInteractionPayload): Promise<VoiceInteractionResult> {
  const res = await fetch(`${API_BASE}/ai/voice-interaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Voice interaction failed');
  }
  return json;
}

export async function triggerBolnaPhoneCall(payload: {
  recipientPhoneNumber: string;
  patientName: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  callType: 'reminder' | 'reschedule' | 'general';
}) {
  const res = await fetch(`${API_BASE}/bolna/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// --- Prescriptions ---
export async function fetchPrescriptions(params?: {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  status?: string;
  search?: string;
  phone?: string;
}): Promise<Prescription[]> {
  const query = new URLSearchParams();
  if (params?.patientId) query.append('patientId', params.patientId);
  if (params?.doctorId) query.append('doctorId', params.doctorId);
  if (params?.appointmentId) query.append('appointmentId', params.appointmentId);
  if (params?.status) query.append('status', params.status);
  if (params?.search) query.append('search', params.search);
  if (params?.phone) query.append('phone', params.phone);

  const url = `${API_BASE}/prescriptions${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load prescriptions');
  return res.json();
}

export async function fetchPrescriptionById(id: string): Promise<Prescription> {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`);
  if (!res.ok) throw new Error('Failed to load prescription');
  return res.json();
}

export async function createPrescription(data: Partial<Prescription>): Promise<Prescription> {
  const res = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to create prescription');
  }
  return json;
}

export async function updatePrescription(
  id: string,
  updates: Partial<Prescription> & { actorName?: string; actorRole?: 'doctor' | 'admin' | 'staff'; auditNotes?: string }
): Promise<Prescription> {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to update prescription');
  }
  return json;
}

export async function approvePrescription(
  id: string,
  doctorName?: string,
  signatureText?: string
): Promise<Prescription> {
  const res = await fetch(`${API_BASE}/prescriptions/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorName, signatureText }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to approve prescription');
  }
  return json;
}

export async function deletePrescription(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/prescriptions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete prescription');
}
