import React from 'react';
import {
  X,
  User,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  Plus,
  Download,
  Printer,
  Eye,
  ShieldCheck,
  Heart,
  Droplet,
} from 'lucide-react';
import type { Patient, Prescription, Appointment } from '../types/index.ts';

interface PatientHistoryModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  prescriptions: Prescription[];
  appointments?: Appointment[];
  onViewPrescription: (rx: Prescription) => void;
  onCreatePrescriptionForPatient: (patient: Patient) => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  patient,
  isOpen,
  onClose,
  prescriptions,
  appointments = [],
  onViewPrescription,
  onCreatePrescriptionForPatient,
}) => {
  if (!isOpen || !patient) return null;

  // Filter prescriptions for this patient
  const patientPrescriptions = prescriptions.filter(
    (p) =>
      p.patientId === patient.id ||
      p.patientPhone.replace(/\D/g, '') === patient.phone.replace(/\D/g, '')
  );

  // Filter appointments for this patient
  const patientAppointments = appointments.filter(
    (a) => a.patientPhone.replace(/\D/g, '') === patient.phone.replace(/\D/g, '')
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#102A56] px-6 py-4 text-white flex items-center justify-between border-b border-blue-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base text-white">{patient.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient Medical File • {patient.gender}, {patient.age} Yrs • Blood Group: {patient.bloodGroup}
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {/* Patient Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E5EAF2]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
              <span className="font-mono font-bold text-[#172B4D] mt-0.5 block">{patient.phone}</span>
            </div>

            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E5EAF2]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Visits</span>
              <span className="font-bold text-[#2563EB] mt-0.5 block">{patient.totalVisits} Consultations</span>
            </div>

            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E5EAF2]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Visit</span>
              <span className="font-medium text-slate-700 mt-0.5 block">{patient.lastVisit || 'Today'}</span>
            </div>

            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E5EAF2]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Prescriptions</span>
              <span className="font-bold text-[#0D9488] mt-0.5 block">{patientPrescriptions.length} Records</span>
            </div>
          </div>

          {/* Medical History & Allergies */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
              Recorded Medical History & Known Allergies
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {patient.medicalHistory.length > 0 ? (
                patient.medicalHistory.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2.5 py-1 rounded-xl bg-white text-amber-900 font-semibold text-xs border border-amber-300 shadow-xs"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-amber-800">No chronic conditions or allergies on file.</span>
              )}
            </div>
          </div>

          {/* Prescriptions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#0D9488]" />
                <h3 className="font-extrabold text-sm text-[#172B4D]">
                  Prescription History ({patientPrescriptions.length})
                </h3>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCreatePrescriptionForPatient(patient);
                }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-teal-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue New Prescription</span>
              </button>
            </div>

            {patientPrescriptions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No prescriptions recorded yet for this patient.</p>
                <button
                  onClick={() => {
                    onClose();
                    onCreatePrescriptionForPatient(patient);
                  }}
                  className="mt-2 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Create First Prescription
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {patientPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-[#102A56]">{rx.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            rx.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rx.status}
                        </span>
                        <span className="text-xs text-slate-400">• {rx.prescriptionDate}</span>
                      </div>

                      <h4 className="font-bold text-xs text-[#172B4D]">{rx.diagnosis}</h4>
                      <p className="text-xs text-slate-500">
                        Prescribed by <span className="font-semibold text-slate-700">{rx.doctorName}</span> ({rx.doctorDepartment})
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rx.medicines.map((m, i) => (
                          <span
                            key={i}
                            className="inline-block text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg"
                          >
                            {m.name} ({m.dosage})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => onViewPrescription(rx)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {patientAppointments.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">
                Appointment History ({patientAppointments.length})
              </h4>
              <div className="space-y-1.5 text-xs">
                {patientAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{apt.id}</span>
                      <span className="text-slate-500 ml-2">
                        {apt.doctorName} ({apt.department})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <span className="text-slate-500">{apt.date} at {apt.timeSlot}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-slate-200 text-slate-700">
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
