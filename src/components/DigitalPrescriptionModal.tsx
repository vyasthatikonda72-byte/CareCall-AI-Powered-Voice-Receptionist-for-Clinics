import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
  Phone,
  ShieldCheck,
  FileText,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';
import type { Prescription } from '../types/index.ts';

interface DigitalPrescriptionModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (prescription: Prescription) => void;
  clinicInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    emergencyContact?: string;
  };
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  prescription,
  isOpen,
  onClose,
  onEdit,
  clinicInfo,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !prescription) return null;

  const clinicName = clinicInfo?.name || 'CityCare Multispecialty Clinic';
  const clinicAddress = clinicInfo?.address || '104 Healthcare Blvd, Jubilee Hills, Hyderabad 500033';
  const clinicPhone = clinicInfo?.phone || '+91 98765 43210';
  const emergencyPhone = clinicInfo?.emergencyContact || '108 / +91 98765 99999';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate clean self-contained HTML document for offline viewing and PDF printing
    const printContent = printAreaRef.current?.innerHTML || '';
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prescription_${prescription.id}_${prescription.patientName.replace(/\s+/g, '_')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      margin: 20px;
      color: #172B4D;
      background: #FFFFFF;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-sheet {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #E5EAF2;
      border-radius: 12px;
      padding: 32px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #F5F8FC; text-align: left; padding: 8px 12px; border-bottom: 2px solid #E5EAF2; font-size: 11px; text-transform: uppercase; color: #64748B; }
    td { padding: 10px 12px; border-bottom: 1px solid #E5EAF2; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
    @media print {
      body { margin: 0; }
      .print-sheet { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    ${printContent}
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prescription_${prescription.id}_${prescription.patientName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="bg-[#102A56] px-6 py-3.5 text-white flex items-center justify-between border-b border-blue-900/40 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">{prescription.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    prescription.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {prescription.status === 'approved' ? 'Doctor Approved & Signed' : 'Draft Copy (Unsigned)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                CareCall Digital Healthcare Documentation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && prescription.status === 'draft' && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(prescription);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Edit Draft
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs"
              title="Print Prescription"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-xs"
              title="Download Printable Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Prescription Document */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          <div ref={printAreaRef} className="space-y-6">
            {/* 1. Clinic Header */}
            <div className="border-b-2 border-slate-200 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#102A56] text-white flex items-center justify-center shadow-sm">
                    <span className="text-xl font-black tracking-tight text-teal-400">CC</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-[#102A56] tracking-tight">{clinicName}</h1>
                    <p className="text-xs text-[#0D9488] font-semibold">CareCall Health Network • NABH Accredited</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{clinicAddress}</p>
                    <p className="text-[11px] text-slate-500">
                      OPD Line: <span className="font-mono font-medium text-slate-700">{clinicPhone}</span> • 24/7 Emergency: <span className="font-mono font-bold text-rose-600">{emergencyPhone}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#102A56]/5 text-[#102A56] border border-slate-200">
                    <span className="text-teal-600 text-sm">℞</span>
                    <span>OUTPATIENT PRESCRIPTION</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400">Rx ID: </span>
                    <span className="font-mono font-bold text-[#102A56]">{prescription.id}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-400">Date: </span>
                    <span className="font-medium">{prescription.prescriptionDate}</span>
                  </div>
                  {prescription.appointmentId && (
                    <div className="text-[11px] text-slate-500">
                      <span>Ref Apt: </span>
                      <span className="font-mono">{prescription.appointmentId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Doctor & Patient Info Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Details */}
              <div className="bg-[#F7F9FC] rounded-2xl p-4 border border-[#E5EAF2]">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#102A56] uppercase tracking-wider mb-2">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>Prescribing Physician</span>
                </div>
                <h3 className="font-bold text-sm text-[#172B4D]">{prescription.doctorName}</h3>
                <p className="text-xs text-[#0D9488] font-medium">{prescription.doctorSpecialization}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Dept: <span className="text-slate-700 font-medium">{prescription.doctorDepartment}</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Reg No: <span className="font-bold text-slate-800">{prescription.doctorRegistrationNumber || 'MCI-REG-VALID'}</span>
                </p>
              </div>

              {/* Patient Details */}
              <div className="bg-[#F7F9FC] rounded-2xl p-4 border border-[#E5EAF2]">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#102A56] uppercase tracking-wider mb-2">
                  <User className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Patient Information</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-sm text-[#172B4D]">{prescription.patientName}</h3>
                  <span className="text-xs text-slate-500 font-mono">ID: {prescription.patientId}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {prescription.patientAge ? `${prescription.patientAge} Yrs` : ''}{' '}
                  {prescription.patientGender ? `• ${prescription.patientGender}` : ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Phone: <span className="text-slate-800 font-semibold">{prescription.patientPhone}</span>
                </p>
                {prescription.vitalSigns && (
                  <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                    {prescription.vitalSigns.bloodPressure && (
                      <span>BP: <b>{prescription.vitalSigns.bloodPressure}</b></span>
                    )}
                    {prescription.vitalSigns.pulse && (
                      <span>Pulse: <b>{prescription.vitalSigns.pulse}</b></span>
                    )}
                    {prescription.vitalSigns.temperature && (
                      <span>Temp: <b>{prescription.vitalSigns.temperature}</b></span>
                    )}
                    {prescription.vitalSigns.weight && (
                      <span>Weight: <b>{prescription.vitalSigns.weight}</b></span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Diagnosis & Allergy Alert */}
            <div className="space-y-2">
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                  Clinical Diagnosis
                </span>
                <p className="text-sm font-bold text-[#102A56]">{prescription.diagnosis}</p>
                {prescription.clinicalNotes && (
                  <p className="text-xs text-slate-600 mt-1.5 italic">
                    Clinical Notes: "{prescription.clinicalNotes}"
                  </p>
                )}
              </div>

              {/* Verified Allergy Alert */}
              {prescription.allergies && prescription.allergies.length > 0 && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-start space-x-2.5">
                  <BadgeAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-900">Recorded Allergies / Contraindications: </span>
                    <span className="text-amber-800">{prescription.allergies.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Medicines Table (The Core Rx) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-[#102A56] leading-none">℞</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Prescribed Medications ({prescription.medicines.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Take strictly as indicated</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#E5EAF2]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2] text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Medicine & Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Route</th>
                      <th className="py-2.5 px-3">Specific Instructions</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescription.medicines.map((med, idx) => (
                      <tr key={med.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#172B4D] block">{med.name}</span>
                          <span className="text-[11px] text-[#2563EB] font-medium">{med.dosage}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 font-semibold text-[11px] border border-teal-200/60">
                            {med.frequency}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{med.duration}</td>
                        <td className="py-3 px-3 text-slate-600">{med.route}</td>
                        <td className="py-3 px-3 text-slate-700 italic max-w-xs">{med.instructions}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">{med.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. General Instructions & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5EAF2] space-y-1.5">
                <span className="font-bold text-[#102A56] block uppercase tracking-wider text-[10px]">
                  General Advice & Precautions
                </span>
                <p className="text-slate-700">{prescription.generalInstructions || 'Complete the entire course of medication. Do not discontinue without consulting your physician.'}</p>
                {prescription.dietAdvice && (
                  <p className="text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-700">Diet Advice: </span>
                    {prescription.dietAdvice}
                  </p>
                )}
              </div>

              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E5EAF2] space-y-2">
                <span className="font-bold text-[#102A56] block uppercase tracking-wider text-[10px]">
                  Next Scheduled Review / Follow-up
                </span>
                {prescription.followUpDate ? (
                  <div className="flex items-center space-x-2 text-teal-800 font-bold bg-teal-50 p-2.5 rounded-xl border border-teal-200">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Follow-up on: {prescription.followUpDate}</span>
                  </div>
                ) : (
                  <p className="text-slate-500">SOS (Follow up if symptoms persist or in case of worsening distress).</p>
                )}
                <p className="text-[11px] text-slate-400">
                  Book appointment via Priya AI Voice or online portal.
                </p>
              </div>
            </div>

            {/* 6. Authorized Doctor Digital Signature & Verification Seal */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2.5 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-700">CareCall Digital Signature Standard</p>
                  <p className="text-[11px] text-slate-400">
                    Digitally generated document under Telemedicine Practice Guidelines & EHR Act
                  </p>
                </div>
              </div>

              <div className="text-right sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 min-w-[200px]">
                {prescription.status === 'approved' ? (
                  <div className="space-y-1">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>APPROVED & SIGNED</span>
                    </div>
                    <p className="font-serif italic font-bold text-sm text-[#102A56] tracking-wide mt-1">
                      {prescription.authorizedDoctorName || prescription.doctorName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      {prescription.authorizedSignature || `Reg: ${prescription.doctorRegistrationNumber}`}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      Signed: {new Date(prescription.updatedAt || prescription.createdAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold text-center">
                    <span>DRAFT COPY — Awaiting Qualified Doctor's Final Signature</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Screen only) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Official CareCall E-Prescription</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="font-bold text-[#2563EB] hover:underline"
            >
              Save as Offline HTML / PDF
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="font-semibold text-slate-700 hover:text-slate-900"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
