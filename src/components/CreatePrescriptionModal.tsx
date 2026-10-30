import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Stethoscope,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Prescription, MedicineItem, Doctor, Patient, Appointment } from '../types/index.ts';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prescriptionData: Partial<Prescription>) => Promise<void>;
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  existingPrescriptions?: Prescription[];
  initialData?: Prescription | null; // For editing
  prefilledAppointment?: Appointment | null; // When created directly from appointment row
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  doctors,
  patients,
  appointments,
  existingPrescriptions = [],
  initialData,
  prefilledAppointment,
}) => {
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [doctorId, setDoctorId] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const [doctorSpecialization, setDoctorSpecialization] = useState<string>('');
  const [doctorRegistrationNumber, setDoctorRegistrationNumber] = useState<string>('MCI-48291/2014');
  const [doctorDepartment, setDoctorDepartment] = useState<string>('General Medicine');

  const [appointmentId, setAppointmentId] = useState<string>('');
  const [consultationDate, setConsultationDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [prescriptionDate, setPrescriptionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [diagnosis, setDiagnosis] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [allergiesText, setAllergiesText] = useState<string>('No known drug allergies');

  const [bp, setBp] = useState<string>('120/80 mmHg');
  const [pulse, setPulse] = useState<string>('72 bpm');
  const [temp, setTemp] = useState<string>('98.4 F');
  const [weight, setWeight] = useState<string>('68 kg');

  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      id: 'med-new-1',
      name: '',
      dosage: '500 mg',
      frequency: '1-0-1 (Twice daily)',
      duration: '5 Days',
      route: 'Oral',
      instructions: 'After food with water',
      quantity: '10 Tablets',
    },
  ]);

  const [generalInstructions, setGeneralInstructions] = useState<string>(
    'Take all medications on schedule. Drink plenty of water and rest well.'
  );
  const [dietAdvice, setDietAdvice] = useState<string>('Light, warm meals. Avoid spicy and greasy food.');
  const [followUpDate, setFollowUpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  const [status, setStatus] = useState<'draft' | 'approved'>('approved');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or prefill fields
  useEffect(() => {
    if (initialData) {
      setPatientId(initialData.patientId || '');
      setPatientName(initialData.patientName || '');
      setPatientPhone(initialData.patientPhone || '');
      setPatientEmail(initialData.patientEmail || '');
      setPatientAge(initialData.patientAge || 30);
      setPatientGender(initialData.patientGender || 'Male');

      setDoctorId(initialData.doctorId || '');
      setDoctorName(initialData.doctorName || '');
      setDoctorSpecialization(initialData.doctorSpecialization || '');
      setDoctorRegistrationNumber(initialData.doctorRegistrationNumber || 'MCI-48291/2014');
      setDoctorDepartment(initialData.doctorDepartment || '');

      setAppointmentId(initialData.appointmentId || '');
      setConsultationDate(initialData.consultationDate || new Date().toISOString().split('T')[0]);
      setPrescriptionDate(initialData.prescriptionDate || new Date().toISOString().split('T')[0]);

      setDiagnosis(initialData.diagnosis || '');
      setClinicalNotes(initialData.clinicalNotes || '');
      setAllergiesText((initialData.allergies || ['No known drug allergies']).join(', '));

      setBp(initialData.vitalSigns?.bloodPressure || '120/80 mmHg');
      setPulse(initialData.vitalSigns?.pulse || '72 bpm');
      setTemp(initialData.vitalSigns?.temperature || '98.4 F');
      setWeight(initialData.vitalSigns?.weight || '68 kg');

      setMedicines(
        initialData.medicines && initialData.medicines.length > 0
          ? initialData.medicines
          : [
              {
                id: 'med-new-1',
                name: '',
                dosage: '500 mg',
                frequency: '1-0-1 (Twice daily)',
                duration: '5 Days',
                route: 'Oral',
                instructions: 'After food with water',
                quantity: '10 Tablets',
              },
            ]
      );
      setGeneralInstructions(initialData.generalInstructions || '');
      setDietAdvice(initialData.dietAdvice || '');
      setFollowUpDate(initialData.followUpDate || '');
      setStatus(initialData.status === 'approved' ? 'approved' : 'draft');
    } else if (prefilledAppointment) {
      // Prefill from appointment
      setAppointmentId(prefilledAppointment.id);
      setPatientName(prefilledAppointment.patientName);
      setPatientPhone(prefilledAppointment.patientPhone);
      setPatientEmail(prefilledAppointment.patientEmail || '');
      setConsultationDate(prefilledAppointment.date);

      // Match patient record if exists
      const matchPat = patients.find(
        (p) => p.phone === prefilledAppointment.patientPhone || p.name === prefilledAppointment.patientName
      );
      if (matchPat) {
        setPatientId(matchPat.id);
        setPatientAge(matchPat.age);
        setPatientGender(matchPat.gender);
        if (matchPat.medicalHistory.length > 0) {
          setAllergiesText(matchPat.medicalHistory.join(', '));
        }
      } else {
        setPatientId(`pat-${Math.floor(100 + Math.random() * 900)}`);
      }

      // Match doctor record
      const matchDoc = doctors.find((d) => d.id === prefilledAppointment.doctorId);
      if (matchDoc) {
        setDoctorId(matchDoc.id);
        setDoctorName(matchDoc.name);
        setDoctorSpecialization(matchDoc.specialization);
        setDoctorDepartment(matchDoc.departmentName);
        setDoctorRegistrationNumber(`MCI-${Math.floor(20000 + Math.random() * 70000)}/2014`);
      } else {
        setDoctorName(prefilledAppointment.doctorName);
        setDoctorDepartment(prefilledAppointment.department);
      }
    } else if (doctors.length > 0 && !doctorId) {
      // Default to first doctor
      const d = doctors[0];
      setDoctorId(d.id);
      setDoctorName(d.name);
      setDoctorSpecialization(d.specialization);
      setDoctorDepartment(d.departmentName);
      setDoctorRegistrationNumber('MCI-52914/2013');
    }
  }, [initialData, prefilledAppointment, isOpen, doctors, patients]);

  if (!isOpen) return null;

  // Duplicate warning check
  const duplicateRx =
    appointmentId && !initialData
      ? existingPrescriptions.find((p) => p.appointmentId === appointmentId)
      : null;

  const handlePatientSelect = (patId: string) => {
    setPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setPatientName(pat.name);
      setPatientPhone(pat.phone);
      setPatientEmail(pat.email || '');
      setPatientAge(pat.age);
      setPatientGender(pat.gender);
      if (pat.medicalHistory && pat.medicalHistory.length > 0) {
        setAllergiesText(pat.medicalHistory.join(', '));
      }
    }
  };

  const handleDoctorSelect = (docId: string) => {
    setDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) {
      setDoctorName(doc.name);
      setDoctorSpecialization(doc.specialization);
      setDoctorDepartment(doc.departmentName);
      setDoctorRegistrationNumber(`MCI-${Math.floor(20000 + Math.random() * 70000)}/2014`);
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: `med-new-${Date.now()}-${prev.length + 1}`,
        name: '',
        dosage: '1 Tablet',
        frequency: '1-0-1 (Twice daily)',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'After food',
        quantity: '10 Tablets',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index: number, field: keyof MedicineItem, value: string) => {
    setMedicines((prev) =>
      prev.map((med, idx) => (idx === index ? { ...med, [field]: value } : med))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!patientName.trim()) {
      setErrorMsg('Patient name is required.');
      return;
    }
    if (!diagnosis.trim()) {
      setErrorMsg('Clinical diagnosis is required.');
      return;
    }

    const validMedicines = medicines.filter((m) => m.name.trim().length > 0);
    if (validMedicines.length === 0) {
      setErrorMsg('Please specify at least one medicine name.');
      return;
    }

    setSubmitting(true);
    try {
      const allergiesList = allergiesText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSubmit({
        patientId: patientId || `pat-${Math.floor(100 + Math.random() * 900)}`,
        patientName,
        patientPhone,
        patientEmail,
        patientAge: Number(patientAge) || 30,
        patientGender,
        doctorId,
        doctorName,
        doctorSpecialization,
        doctorRegistrationNumber,
        doctorDepartment,
        appointmentId: appointmentId || undefined,
        consultationDate,
        prescriptionDate,
        diagnosis,
        clinicalNotes,
        allergies: allergiesList,
        vitalSigns: {
          bloodPressure: bp,
          pulse,
          temperature: temp,
          weight,
        },
        medicines: validMedicines,
        generalInstructions,
        dietAdvice,
        followUpDate: followUpDate || undefined,
        status,
        authorizedDoctorName: status === 'approved' ? doctorName : undefined,
        authorizedSignature:
          status === 'approved'
            ? `Digitally Verified: ${doctorName} [Reg: ${doctorRegistrationNumber}]`
            : undefined,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#102A56] px-6 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                {initialData ? `Edit Prescription (${initialData.id})` : 'Create Medical Prescription'}
              </h2>
              <p className="text-xs text-slate-300">
                CareCall Qualified Physician Electronic Prescribing Console
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {duplicateRx && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-start space-x-2 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Duplicate Notice: </span>
                An active prescription (<b>{duplicateRx.id}</b>) has already been created for appointment <b>{appointmentId}</b>. Submitting will create another record or you may update the existing one.
              </div>
            </div>
          )}

          {/* Section 1: Doctor Information */}
          <div className="bg-[#F7F9FC] rounded-2xl p-4 sm:p-5 border border-[#E5EAF2] space-y-3">
            <div className="flex items-center space-x-2 font-bold text-[#102A56] text-xs uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-[#0D9488]" />
              <span>1. Prescribing Doctor & Clinical Authorization</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Doctor</label>
                <select
                  value={doctorId}
                  onChange={(e) => handleDoctorSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={doctorSpecialization}
                  onChange={(e) => setDoctorSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="e.g. Senior Cardiologist"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Registration No.</label>
                <input
                  type="text"
                  value={doctorRegistrationNumber}
                  onChange={(e) => setDoctorRegistrationNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="MCI-XXXXX/YYYY"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Patient Information */}
          <div className="bg-[#F7F9FC] rounded-2xl p-4 sm:p-5 border border-[#E5EAF2] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-bold text-[#102A56] text-xs uppercase tracking-wider">
                <User className="w-4 h-4 text-[#2563EB]" />
                <span>2. Patient Information</span>
              </div>

              {patients.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500">Auto-fill from records:</span>
                  <select
                    value={patientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="e.g. Rohan Mehra"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="+91 98490 12345"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="pat-101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Appointment</label>
                <select
                  value={appointmentId}
                  onChange={(e) => setAppointmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">-- None / Walk-in --</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} • {a.patientName} ({a.date})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Date</label>
                <input
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Consultation & Clinical Notes */}
          <div className="bg-[#F7F9FC] rounded-2xl p-4 sm:p-5 border border-[#E5EAF2] space-y-3">
            <div className="flex items-center space-x-2 font-bold text-[#102A56] text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>3. Diagnosis, Vitals & Allergies</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Diagnosis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="e.g. Acute Bronchitis, Type 2 Diabetes Review, Contact Dermatitis..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor's Clinical Notes</label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Observations, auscultation, symptoms duration..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recorded Allergies & Warnings
                </label>
                <textarea
                  rows={2}
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Penicillin, Sulfa drugs, Dust allergy (comma separated)"
                />
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
              <div>
                <label className="block text-[11px] text-slate-500">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  placeholder="120/80 mmHg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Pulse Rate</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  placeholder="72 bpm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Temperature</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  placeholder="98.4 F"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">Weight</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  placeholder="65 kg"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic Medicine Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-[#102A56] text-xs uppercase tracking-wider">
                <span className="text-base text-teal-600 font-black">℞</span>
                <span>4. Prescribed Medications ({medicines.length})</span>
              </div>

              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-teal-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, idx) => (
                <div
                  key={med.id || idx}
                  className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Medicine #{idx + 1}
                    </span>

                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove medicine row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Medicine Name & Strength <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        placeholder="e.g. Tab. Azithromycin 500mg, Syrup Benadryl..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        placeholder="e.g. 500 mg, 1 puff, 10 ml"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="1-0-1 (Twice daily)">1-0-1 (Twice daily)</option>
                        <option value="1-0-0 (Morning only)">1-0-0 (Morning only)</option>
                        <option value="0-0-1 (Night only)">0-0-1 (Night only)</option>
                        <option value="1-1-1 (Thrice daily)">1-1-1 (Thrice daily)</option>
                        <option value="1-1-1-1 (Four times daily)">1-1-1-1 (Four times daily)</option>
                        <option value="SOS (As needed)">SOS (As needed)</option>
                        <option value="Once a week">Once a week</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        placeholder="e.g. 5 Days, 1 Month"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Route</label>
                      <select
                        value={med.route}
                        onChange={(e) => handleMedicineChange(idx, 'route', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Ophthalmic">Ophthalmic (Eye)</option>
                        <option value="Nasal">Nasal</option>
                        <option value="Sublingual">Sublingual</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Quantity</label>
                      <input
                        type="text"
                        value={med.quantity}
                        onChange={(e) => handleMedicineChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        placeholder="e.g. 10 Tablets"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Specific Instructions
                    </label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      placeholder="e.g. After meals with warm water, Before sleep..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: General Instructions & Follow-up */}
          <div className="bg-[#F7F9FC] rounded-2xl p-4 sm:p-5 border border-[#E5EAF2] space-y-3">
            <div className="font-bold text-[#102A56] text-xs uppercase tracking-wider">
              5. Instructions, Diet & Follow-up
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">General Instructions</label>
                <textarea
                  rows={2}
                  value={generalInstructions}
                  onChange={(e) => setGeneralInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Rest, hydration, physical precautions..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Advice</label>
                <textarea
                  rows={2}
                  value={dietAdvice}
                  onChange={(e) => setDietAdvice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Foods to include or avoid..."
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2 pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Follow-up Review Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Section 6: Status & Doctor Digital Signature */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-bold text-xs text-[#102A56] block">Authorization & Publishing Status</span>
              <p className="text-xs text-slate-500">
                Approved prescriptions are digitally signed and immediately available for patient download and AI Priya verification.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === 'draft' ? 'bg-amber-100 text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  status === 'approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approve & Sign as Doctor
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Saving Prescription...' : status === 'approved' ? 'Sign & Issue Prescription' : 'Save Prescription Draft'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
