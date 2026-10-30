import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Department, Doctor, Appointment } from '../types/index.ts';
import { fetchDepartments, fetchDoctors, fetchAppointments, createAppointment } from '../services/api.ts';

interface BookingPortalProps {
  onAppointmentCreated?: (apt: Appointment) => void;
  onViewDashboard?: () => void;
}

const DoctorAvatar: React.FC<{ src?: string; name: string; sizeClass?: string }> = ({
  src,
  name,
  sizeClass = 'w-14 h-14 rounded-xl',
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  if (imgError || !src) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br from-blue-100 to-teal-100 text-[#102A56] font-bold flex items-center justify-center border border-slate-200 flex-shrink-0 shadow-xs text-xs select-none`}
      >
        <span>{initials || 'DR'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setImgError(true)}
      className={`${sizeClass} object-cover border border-slate-200 flex-shrink-0 shadow-xs`}
    />
  );
};

export const BookingPortal: React.FC<BookingPortalProps> = ({
  onAppointmentCreated,
  onViewDashboard,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [consultType, setConsultType] = useState<'in_person' | 'video_consult'>('in_person');
  const [reason, setReason] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsData, docsData, aptsData] = await Promise.all([
        fetchDepartments(),
        fetchDoctors(),
        fetchAppointments(),
      ]);
      setDepartments(deptsData);
      setDoctors(docsData);
      setExistingAppointments(aptsData);

      if (docsData.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docsData[0].id);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load clinic information.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDeptId === 'all') return true;
    return doc.departmentId === selectedDeptId;
  });

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || filteredDoctors[0];

  // Calculate booked slots for selected doctor and date
  const isSlotBooked = (slot: string) => {
    if (!selectedDoctor) return false;
    return existingAppointments.some(
      (apt) =>
        apt.doctorId === selectedDoctor.id &&
        apt.date === selectedDate &&
        apt.timeSlot.trim().toLowerCase() === slot.trim().toLowerCase() &&
        apt.status !== 'cancelled'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!patientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 8) {
      setErrorMessage('Please enter a valid phone number for SMS confirmation.');
      return;
    }
    if (!selectedDoctor) {
      setErrorMessage('Please select a doctor.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAppointment({
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        department: selectedDoctor.departmentName,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultType,
        notes: reason.trim() || 'Booked via patient web portal',
        bookedVia: 'web_portal',
        status: 'confirmed',
      });

      setConfirmedBooking(created);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (onAppointmentCreated) {
        onAppointmentCreated(created);
      }

      // Refresh appointments to update slot availability
      const updatedApts = await fetchAppointments();
      setExistingAppointments(updatedApts);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not complete appointment booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>Loading clinic booking portal...</p>
      </div>
    );
  }

  // Today string for min date attribute
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
          <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient Appointment Portal</span>
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Book an Appointment
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Select your specialty, choose your doctor and slot, and receive instant confirmation with conflict-free scheduling.
        </p>
      </div>

      {confirmedBooking ? (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Appointment #{confirmedBooking.id}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              A confirmation notification and calendar invite have been registered.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 border border-slate-200 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Patient Name:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.patientName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.doctorName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-teal-700">{confirmedBooking.department}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date & Time:</span>
              <span className="font-semibold text-slate-900">
                {confirmedBooking.date} at {confirmedBooking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Consultation Mode:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {confirmedBooking.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Contact Number:</span>
              <span className="font-semibold text-slate-900">{confirmedBooking.patientPhone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setSelectedSlot('');
                setReason('');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Book Another Appointment
            </button>

            {onViewDashboard && (
              <button
                onClick={onViewDashboard}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>View In Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1 & 2: Doctor Selection and Slot Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Department Filter Tabs */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                1. Select Department
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDeptId('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedDeptId === 'all'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Specialties ({doctors.length})
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      const firstDocInDept = doctors.find((d) => d.departmentId === dept.id);
                      if (firstDocInDept) setSelectedDoctorId(firstDocInDept.id);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedDeptId === dept.id
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Card Grid */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                2. Select Doctor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorId(doc.id);
                        setSelectedSlot('');
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-2 ring-teal-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <DoctorAvatar src={doc.avatar} name={doc.name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{doc.name}</h4>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            ₹{doc.consultationFee}
                          </span>
                        </div>
                        <p className="text-xs text-teal-700 font-medium truncate">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.experienceYears} yrs exp • {doc.roomNumber}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                          <span>Days: {doc.availableDays.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date and Time Slot Picker */}
            {selectedDoctor && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Select Date & Slot
                  </label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot('');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Available slots for {selectedDoctor.name} on {selectedDate}:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedDoctor.availableSlots.map((slot) => {
                      const booked = isSlotBooked(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={booked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all border ${
                            booked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <div className="font-mono">{slot}</div>
                          {booked && <div className="text-[9px] uppercase font-bold text-rose-500 mt-0.5">Booked</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Patient Information & Confirmation */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                4. Patient Details
              </label>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (for SMS & Voice Reminder) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91 98490 XXXXX"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultType('in_person')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      consultType === 'in_person'
                        ? 'bg-teal-50 text-teal-800 border-teal-500'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    In-Person OPD
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType('video_consult')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      consultType === 'video_consult'
                        ? 'bg-teal-50 text-teal-800 border-teal-500'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Video Consult
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Symptoms or Reason for Visit
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your health symptoms or reason for consulting the doctor..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Booking Summary Box */}
              {selectedDoctor && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Doctor:</span>
                    <span className="font-semibold text-slate-800">{selectedDoctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-semibold text-teal-700">
                      {selectedDate} • {selectedSlot || 'Not chosen'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee Payable at Clinic:</span>
                    <span className="font-bold text-slate-900">₹{selectedDoctor.consultationFee}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/25 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming with Clinic...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Appointment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
