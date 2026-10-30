import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Printer,
  Download,
  Edit3,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  Calendar,
  AlertCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  Building,
} from 'lucide-react';
import type { Prescription, Doctor, Patient, Appointment } from '../types/index.ts';

interface PrescriptionDashboardProps {
  prescriptions: Prescription[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  loading?: boolean;
  onOpenCreateModal: () => void;
  onViewPrescription: (rx: Prescription) => void;
  onEditPrescription: (rx: Prescription) => void;
  onApprovePrescription: (rx: Prescription) => Promise<void>;
  onRefresh: () => void;
  globalSearchQuery?: string;
}

export const PrescriptionDashboard: React.FC<PrescriptionDashboardProps> = ({
  prescriptions,
  doctors,
  patients,
  appointments,
  loading = false,
  onOpenCreateModal,
  onViewPrescription,
  onEditPrescription,
  onApprovePrescription,
  onRefresh,
  globalSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const effectiveSearch = (searchQuery || globalSearchQuery).trim().toLowerCase();

  // Metrics
  const today = new Date().toISOString().split('T')[0];
  const totalPrescriptions = prescriptions.length;
  const todayPrescriptions = prescriptions.filter((p) => p.prescriptionDate === today).length;
  const pendingPrescriptions = prescriptions.filter((p) => p.status === 'draft').length;
  const approvedPrescriptions = prescriptions.filter((p) => p.status === 'approved').length;

  const departments = Array.from(new Set(prescriptions.map((p) => p.doctorDepartment))).filter(Boolean);

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const matchesSearch =
      effectiveSearch === '' ||
      rx.id.toLowerCase().includes(effectiveSearch) ||
      rx.patientName.toLowerCase().includes(effectiveSearch) ||
      rx.patientId.toLowerCase().includes(effectiveSearch) ||
      rx.doctorName.toLowerCase().includes(effectiveSearch) ||
      rx.doctorDepartment.toLowerCase().includes(effectiveSearch) ||
      rx.diagnosis.toLowerCase().includes(effectiveSearch);

    const matchesStatus = statusFilter === 'all' || rx.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || rx.doctorDepartment === departmentFilter;
    const matchesDate = !dateFilter || rx.prescriptionDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesDate;
  });

  const handleQuickApprove = async (rx: Prescription) => {
    setApprovingId(rx.id);
    try {
      await onApprovePrescription(rx);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-[#172B4D] tracking-tight">Prescription Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
              E-Prescribing Suite
            </span>
          </div>
          <p className="text-xs text-[#718096] mt-0.5">
            Issue, audit, print, and digitally sign electronic prescriptions with full patient history integration
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Prescriptions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Prescription</span>
          </button>
        </div>
      </div>

      {/* 2. Key Prescription KPI Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Prescriptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{totalPrescriptions}</span>
            <span className="text-xs font-semibold text-slate-500">records in EHR</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Full audit trail maintained</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issued Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{todayPrescriptions}</span>
            <span className="text-xs font-bold text-teal-600">Active consultations</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Generated during OPD sessions</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Drafts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{pendingPrescriptions}</span>
            <span className="text-xs font-bold text-amber-600">Awaiting signature</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires qualified doctor review</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Approved & Signed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{approvedPrescriptions}</span>
            <span className="text-xs font-bold text-emerald-600">100% Verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Accessible by patients & Priya AI</p>
        </div>
      </div>

      {/* 3. Search, Filter & Prescriptions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rx ID, patient, doctor, diagnosis..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Doctor Approved</option>
              <option value="draft">Draft (Unsigned)</option>
            </select>

            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="all">All Specialties</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Clear Date
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredPrescriptions.length}</span> of {prescriptions.length} records
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F8FC] border-b border-slate-200/80 text-[#718096] uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-5">Rx ID</th>
                <th className="py-3 px-5">Patient Details</th>
                <th className="py-3 px-5">Doctor & Specialty</th>
                <th className="py-3 px-5">Diagnosis & Medicines</th>
                <th className="py-3 px-5">Issued Date</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-xs">No prescriptions match your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredPrescriptions.map((rx) => {
                  const isApproving = approvingId === rx.id;
                  return (
                    <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Rx ID */}
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => onViewPrescription(rx)}
                          className="hover:text-[#2563EB] underline decoration-dotted"
                          title="Click to view digital document"
                        >
                          {rx.id}
                        </button>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#172B4D]">{rx.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {rx.patientId} • {rx.patientPhone}
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-slate-800">{rx.doctorName}</div>
                        <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                          {rx.doctorDepartment}
                        </span>
                      </td>

                      {/* Diagnosis & Medicines */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{rx.diagnosis}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {rx.medicines.map((m) => m.name).join(', ') || 'No medicines recorded'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{rx.prescriptionDate}</div>
                        {rx.followUpDate && (
                          <div className="text-[10px] text-teal-700 font-medium">
                            Follow-up: {rx.followUpDate}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rx.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rx.status === 'approved' ? 'Approved' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* One-click approve if draft */}
                          {rx.status === 'draft' && (
                            <button
                              onClick={() => handleQuickApprove(rx)}
                              disabled={isApproving}
                              title="Approve & Sign as Doctor"
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
                            >
                              {isApproving ? 'Signing...' : 'Approve'}
                            </button>
                          )}

                          {/* View */}
                          <button
                            onClick={() => onViewPrescription(rx)}
                            title="View / Print Document"
                            className="p-1.5 rounded-lg text-[#2563EB] hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit (if draft) */}
                          {rx.status === 'draft' && (
                            <button
                              onClick={() => onEditPrescription(rx)}
                              title="Edit Draft"
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
