import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PhoneCall,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  Stethoscope,
  BellRing,
  Settings,
  RefreshCw,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Plus,
  Mail,
  Phone,
  Shield,
  HeartHandshake,
} from 'lucide-react';
import type {
  Appointment,
  Doctor,
  Patient,
  CallRecord,
  Reminder,
  Escalation,
  ClinicSettings,
  DashboardStats,
  Prescription,
} from '../types/index.ts';
import type { NavSection } from './Sidebar.tsx';
import { DashboardView } from './DashboardView.tsx';
import { PrescriptionDashboard } from './PrescriptionDashboard.tsx';
import { DigitalPrescriptionModal } from './DigitalPrescriptionModal.tsx';
import { CreatePrescriptionModal } from './CreatePrescriptionModal.tsx';
import { PatientHistoryModal } from './PatientHistoryModal.tsx';
import {
  fetchAppointments,
  updateAppointment,
  cancelAppointment,
  fetchDoctors,
  updateDoctorStatus,
  fetchPatients,
  fetchCalls,
  fetchReminders,
  triggerReminderCall,
  fetchEscalations,
  updateEscalation,
  fetchSettings,
  updateSettings,
  fetchDashboardStats,
  resetDatabase,
  fetchPrescriptions,
  createPrescription,
  updatePrescription,
  approvePrescription,
  deletePrescription,
} from '../services/api.ts';

interface AdminDashboardProps {
  currentSection?: NavSection;
  onSelectSection?: (section: NavSection) => void;
  onOpenVoiceModal: () => void;
  onOpenBolnaModal: () => void;
  onOpenBookAppointment?: () => void;
  onOpenAddPatient?: () => void;
  onOpenAddDoctor?: () => void;
  globalSearchQuery?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentSection = 'dashboard',
  onSelectSection,
  onOpenVoiceModal,
  onOpenBolnaModal,
  onOpenBookAppointment,
  onOpenAddPatient,
  onOpenAddDoctor,
  globalSearchQuery = '',
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [settings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Prescription Modals & Active Selections
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState<Prescription | null>(null);
  const [isViewRxModalOpen, setIsViewRxModalOpen] = useState<boolean>(false);
  const [isCreateRxModalOpen, setIsCreateRxModalOpen] = useState<boolean>(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [prefilledAppointmentForRx, setPrefilledAppointmentForRx] = useState<Appointment | null>(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [isPatientHistoryModalOpen, setIsPatientHistoryModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [triggeringReminderId, setTriggeringReminderId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync global search query if provided
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setLocalSearchQuery(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  useEffect(() => {
    loadAllDashboardData();
  }, []);

  const loadAllDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        aptsData,
        docsData,
        patsData,
        callsData,
        remsData,
        escsData,
        settingsData,
        rxsData,
      ] = await Promise.all([
        fetchDashboardStats(),
        fetchAppointments(),
        fetchDoctors(),
        fetchPatients(),
        fetchCalls(),
        fetchReminders(),
        fetchEscalations(),
        fetchSettings(),
        fetchPrescriptions(),
      ]);

      setStats(statsData);
      setAppointments(aptsData);
      setDoctors(docsData);
      setPatients(patsData);
      setCalls(callsData);
      setReminders(remsData);
      setEscalations(escsData);
      setClinicSettings(settingsData);
      setPrescriptions(rxsData);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async (data: Partial<Prescription>) => {
    if (editingPrescription) {
      const updated = await updatePrescription(editingPrescription.id, data);
      setPrescriptions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showActionToast(`Prescription #${updated.id} updated successfully.`);
    } else {
      const created = await createPrescription(data);
      setPrescriptions((prev) => [created, ...prev]);
      showActionToast(`Prescription #${created.id} issued successfully.`);
    }
    fetchDashboardStats().then(setStats);
  };

  const handleApprovePrescription = async (rx: Prescription) => {
    try {
      const approved = await approvePrescription(rx.id, rx.doctorName);
      setPrescriptions((prev) => prev.map((p) => (p.id === rx.id ? approved : p)));
      showActionToast(`Prescription #${rx.id} approved and digitally signed.`);
      fetchDashboardStats().then(setStats);
    } catch (e: any) {
      alert(e.message || 'Failed to approve prescription');
    }
  };

  const handleOpenCreatePrescription = (apt?: Appointment) => {
    setEditingPrescription(null);
    setPrefilledAppointmentForRx(apt || null);
    setIsCreateRxModalOpen(true);
  };

  const showActionToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleUpdateAptStatus = async (id: string, status: Appointment['status']) => {
    try {
      const updated = await updateAppointment(id, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showActionToast(`Appointment #${id} status changed to ${status}.`);
      fetchDashboardStats().then(setStats);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCancelApt = async (id: string) => {
    const reason = prompt('Please enter cancellation reason:', 'Patient requested cancellation');
    if (!reason) return;
    try {
      const cancelled = await cancelAppointment(id, reason);
      setAppointments((prev) => prev.map((a) => (a.id === id ? cancelled : a)));
      showActionToast(`Appointment #${id} cancelled.`);
      fetchDashboardStats().then(setStats);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTriggerReminder = async (rem: Reminder) => {
    setTriggeringReminderId(rem.id);
    try {
      const res = await triggerReminderCall({
        reminderId: rem.id,
        patientPhone: rem.patientPhone,
        patientName: rem.patientName,
        doctorName: rem.doctorName,
        appointmentDate: rem.appointmentDate,
        appointmentTime: rem.appointmentTime,
        appointmentId: rem.appointmentId,
      });

      setReminders((prev) =>
        prev.map((r) =>
          r.id === rem.id
            ? {
                ...r,
                status: 'calling',
                patientResponse: res.message,
                lastContactedAt: new Date().toISOString(),
              }
            : r
        )
      );
      showActionToast(res.message);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setTriggeringReminderId(null);
    }
  };

  const handleResolveEscalation = async (escId: string) => {
    const notes = prompt(
      'Enter staff resolution notes:',
      'Contacted patient; medical instructions provided.'
    );
    if (!notes) return;
    try {
      const updated = await updateEscalation(escId, { status: 'resolved', notes });
      setEscalations((prev) => prev.map((e) => (e.id === escId ? updated : e)));
      showActionToast('Escalation marked as resolved.');
      fetchDashboardStats().then(setStats);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleResetDb = async () => {
    if (!confirm('Are you sure you want to restore initial demo data?')) return;
    try {
      await resetDatabase();
      await loadAllDashboardData();
      showActionToast('Database restored to fresh clinic seed data.');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const effectiveSearch = localSearchQuery.toLowerCase().trim();

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      !effectiveSearch ||
      apt.patientName.toLowerCase().includes(effectiveSearch) ||
      apt.patientPhone.includes(effectiveSearch) ||
      apt.doctorName.toLowerCase().includes(effectiveSearch) ||
      apt.department.toLowerCase().includes(effectiveSearch) ||
      apt.id.toLowerCase().includes(effectiveSearch);

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDate = !dateFilter || apt.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filtered Doctors
  const filteredDoctors = doctors.filter((doc) => {
    return (
      !effectiveSearch ||
      doc.name.toLowerCase().includes(effectiveSearch) ||
      doc.departmentName.toLowerCase().includes(effectiveSearch) ||
      doc.specialization.toLowerCase().includes(effectiveSearch)
    );
  });

  // Filtered Patients
  const filteredPatients = patients.filter((pat) => {
    return (
      !effectiveSearch ||
      pat.name.toLowerCase().includes(effectiveSearch) ||
      pat.phone.includes(effectiveSearch) ||
      pat.email.toLowerCase().includes(effectiveSearch)
    );
  });

  // Filtered Calls
  const filteredCalls = calls.filter((c) => {
    return (
      !effectiveSearch ||
      c.callerName.toLowerCase().includes(effectiveSearch) ||
      c.callerPhone.includes(effectiveSearch) ||
      c.summary.toLowerCase().includes(effectiveSearch)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-teal-700 hover:text-teal-900 font-bold ml-4 text-base"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. MAIN EXECUTIVE DASHBOARD OVERVIEW */}
      {currentSection === 'dashboard' && stats && (
        <DashboardView
          stats={stats}
          appointments={appointments}
          doctors={doctors}
          patients={patients}
          calls={calls}
          reminders={reminders}
          escalations={escalations}
          settings={settings}
          onOpenVoiceModal={onOpenVoiceModal}
          onOpenBolnaModal={onOpenBolnaModal}
          onOpenBookAppointment={onOpenBookAppointment || (() => onSelectSection?.('appointments'))}
          onOpenAddPatient={onOpenAddPatient || (() => onSelectSection?.('patients'))}
          onOpenAddDoctor={onOpenAddDoctor || (() => onSelectSection?.('doctors'))}
          onNavigateToSection={(s) => onSelectSection?.(s)}
          onTriggerReminder={handleTriggerReminder}
          onUpdateAppointmentStatus={handleUpdateAptStatus}
          onCancelAppointment={handleCancelApt}
          onTriggerEmergencyHandoff={() => onSelectSection?.('analytics')}
        />
      )}

      {/* 2. FULL APPOINTMENTS VIEW */}
      {currentSection === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header & Filters */}
            <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D] flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#2563EB]" />
                  <span>All Clinic Appointments ({filteredAppointments.length})</span>
                </h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Synchronized schedule with double-booking prevention across all channels
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Search patient, ID, doctor..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

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

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {onOpenBookAppointment && (
                  <button
                    onClick={onOpenBookAppointment}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Booking</span>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F8FC] border-b border-slate-200/80 text-[#718096] uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-5">Patient Name</th>
                    <th className="py-3 px-5">Doctor & Specialty</th>
                    <th className="py-3 px-5">Date & Slot</th>
                    <th className="py-3 px-5">Channel</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Prescription</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No appointments match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((apt) => {
                      const linkedRx = prescriptions.find((p) => p.appointmentId === apt.id);
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                            {apt.id}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-[#172B4D]">{apt.patientName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{apt.patientPhone}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-medium text-slate-800">{apt.doctorName}</div>
                            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                              {apt.department}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-900">{apt.date}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{apt.timeSlot}</div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                apt.bookedVia === 'ai_voice'
                                  ? 'bg-purple-100 text-purple-800'
                                  : apt.bookedVia === 'web_portal'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {apt.bookedVia === 'ai_voice' && <PhoneCall className="w-3 h-3 mr-0.5" />}
                              <span>{apt.bookedVia === 'ai_voice' ? 'AI Voice Call' : apt.bookedVia}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                apt.status === 'confirmed'
                                  ? 'bg-teal-100 text-teal-800'
                                  : apt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            {linkedRx ? (
                              <button
                                onClick={() => {
                                  setSelectedPrescriptionForView(linkedRx);
                                  setIsViewRxModalOpen(true);
                                }}
                                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                  linkedRx.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                }`}
                                title="Click to view digital prescription"
                              >
                                <FileText className="w-3 h-3 text-emerald-600" />
                                <span>{linkedRx.id} ({linkedRx.status})</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenCreatePrescription(apt)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                                title="Issue Prescription for this consultation"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Issue Rx</span>
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateAptStatus(apt.id, 'completed')}
                                  title="Mark Consult Completed"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                <button
                                  onClick={() => handleCancelApt(apt.id)}
                                  title="Cancel Appointment"
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
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
      )}

      {/* 2.5 PRESCRIPTIONS MODULE */}
      {currentSection === 'prescriptions' && (
        <PrescriptionDashboard
          prescriptions={prescriptions}
          doctors={doctors}
          patients={patients}
          appointments={appointments}
          loading={loading}
          onOpenCreateModal={() => {
            setEditingPrescription(null);
            setPrefilledAppointmentForRx(null);
            setIsCreateRxModalOpen(true);
          }}
          onViewPrescription={(rx) => {
            setSelectedPrescriptionForView(rx);
            setIsViewRxModalOpen(true);
          }}
          onEditPrescription={(rx) => {
            setEditingPrescription(rx);
            setIsCreateRxModalOpen(true);
          }}
          onApprovePrescription={handleApprovePrescription}
          onRefresh={loadAllDashboardData}
          globalSearchQuery={localSearchQuery}
        />
      )}

      {/* 3. PATIENTS DIRECTORY */}
      {currentSection === 'patients' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D] flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#2563EB]" />
                  <span>Patient Medical Records ({filteredPatients.length})</span>
                </h2>
                <p className="text-xs text-[#718096]">
                  Registered patients, historical clinic visits, and clinical contacts
                </p>
              </div>

              {onOpenAddPatient && (
                <button
                  onClick={onOpenAddPatient}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Patient</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F8FC] border-b border-slate-200/80 text-[#718096] uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-5">Patient Name</th>
                    <th className="py-3 px-5">Contact Details</th>
                    <th className="py-3 px-5">Age / Gender</th>
                    <th className="py-3 px-5">Blood Group</th>
                    <th className="py-3 px-5">Visits</th>
                    <th className="py-3 px-5">Last Visit</th>
                    <th className="py-3 px-5">Medical History</th>
                    <th className="py-3 px-5 text-right">Medical File & Rx</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((pat) => {
                    const patRxs = prescriptions.filter(
                      (p) =>
                        p.patientId === pat.id ||
                        p.patientPhone.replace(/\D/g, '') === pat.phone.replace(/\D/g, '')
                    );
                    return (
                      <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5 font-bold text-[#172B4D]">{pat.name}</td>
                        <td className="py-3.5 px-5">
                          <div className="font-mono text-slate-800">{pat.phone}</div>
                          <div className="text-[11px] text-slate-400">{pat.email}</div>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-700">
                          {pat.age} yrs • {pat.gender}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">{pat.bloodGroup}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-[#2563EB]">
                          {pat.totalVisits}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{pat.lastVisit}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-wrap gap-1">
                            {pat.medicalHistory.map((item, idx) => (
                              <span
                                key={idx}
                                className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-medium"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPatientForHistory(pat);
                                setIsPatientHistoryModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-xs"
                              title="View Patient Prescription History and File"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{patRxs.length > 0 ? `${patRxs.length} Rx History` : 'History'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. DOCTORS DIRECTORY */}
      {currentSection === 'doctors' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D] flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-[#2563EB]" />
                  <span>Doctor Management & Availability ({filteredDoctors.length})</span>
                </h2>
                <p className="text-xs text-[#718096]">
                  Clinic practitioners, consultation fees, and schedule toggles
                </p>
              </div>

              {onOpenAddDoctor && (
                <button
                  onClick={onOpenAddDoctor}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Doctor</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-base text-[#172B4D]">{doc.name}</h4>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                          {doc.departmentName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {doc.qualification} • {doc.specialization} ({doc.experienceYears} yrs)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        {doc.roomNumber} • Fee: ₹{doc.consultationFee} • Days: {doc.availableDays.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={async () => {
                        const updated = await updateDoctorStatus(doc.id, 'available');
                        setDoctors((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
                        showActionToast(`${doc.name} marked Available.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        doc.status === 'available'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={async () => {
                        const updated = await updateDoctorStatus(doc.id, 'in_consultation');
                        setDoctors((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
                        showActionToast(`${doc.name} marked In Consultation.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        doc.status === 'in_consultation'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      In Consult
                    </button>
                    <button
                      onClick={async () => {
                        const updated = await updateDoctorStatus(doc.id, 'on_leave');
                        setDoctors((prev) => prev.map((d) => (d.id === doc.id ? updated : d)));
                        showActionToast(`${doc.name} marked On Leave.`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        doc.status === 'on_leave'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      On Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. VOICE CALLS & TRANSCRIPTS */}
      {currentSection === 'calls' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D] flex items-center space-x-2">
                  <PhoneCall className="w-5 h-5 text-[#2563EB]" />
                  <span>Voice Call Recordings & Full Transcripts</span>
                </h2>
                <p className="text-xs text-[#718096]">
                  Patient telephony conversations, intent detection, and multilingual logs
                </p>
              </div>

              <button
                onClick={onOpenVoiceModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#0D9488] shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulate Call</span>
              </button>
            </div>

            {filteredCalls.map((call) => {
              const isExpanded = expandedCallId === call.id;
              return (
                <div key={call.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          call.status === 'escalated'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#172B4D]">{call.callerName}</span>
                          <span className="text-xs text-slate-500 font-mono">({call.callerPhone})</span>
                          <span className="font-mono text-[11px] text-slate-400">#{call.id}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{call.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right text-xs">
                        <span className="font-mono text-slate-500 block">
                          {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                        </span>
                        <span className="font-bold uppercase text-[10px] text-teal-700">
                          Lang: {call.language}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          call.status === 'escalated'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {call.status}
                      </span>

                      <button
                        onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Transcript */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-[#F5F8FC] rounded-2xl p-4">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                        <span className="font-bold text-[#172B4D]">Audio Conversation Transcript</span>
                        <span className="text-slate-400 font-mono">
                          {new Date(call.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {call.transcripts && call.transcripts.length > 0 ? (
                          call.transcripts.map((t, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start space-x-2 text-xs ${
                                t.speaker === 'patient' ? 'pl-8' : 'pr-8'
                              }`}
                            >
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                                  t.speaker === 'ai'
                                    ? 'bg-[#2563EB] text-white'
                                    : 'bg-[#10264A] text-white'
                                }`}
                              >
                                {t.speaker === 'ai' ? 'Priya (AI)' : 'Patient'}
                              </span>
                              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-800 shadow-xs flex-1">
                                <p className="leading-relaxed">{t.text}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                                  {t.timestamp}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No dialogue logged.</p>
                        )}
                      </div>

                      {call.appointmentId && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                          <span>Linked Confirmed Booking: #{call.appointmentId}</span>
                          <span className="font-bold uppercase text-[10px]">Saved In Database</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. REMINDERS MODULE */}
      {currentSection === 'reminders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D] flex items-center space-x-2">
                  <BellRing className="w-5 h-5 text-amber-500" />
                  <span>Automated Patient Reminders ({reminders.length})</span>
                </h2>
                <p className="text-xs text-[#718096]">
                  Proactive Bolna AI outbound phone calling queue to eliminate clinic no-shows
                </p>
              </div>

              <button
                onClick={onOpenBolnaModal}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <span>Configure Bolna Agent</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F5F8FC] border-b border-slate-200/80 text-[#718096] uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Doctor</th>
                    <th className="py-3 px-5">Scheduled Slot</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Outcome / Notes</th>
                    <th className="py-3 px-5 text-right">Trigger Bolna Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reminders.map((rem) => {
                    const isCalling = triggeringReminderId === rem.id;
                    return (
                      <tr key={rem.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-[#172B4D] block">{rem.patientName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{rem.patientPhone}</span>
                        </td>
                        <td className="py-3.5 px-5 font-medium text-slate-800">{rem.doctorName}</td>
                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-slate-900 block">{rem.appointmentDate}</span>
                          <span className="font-mono text-slate-500">{rem.appointmentTime}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              rem.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rem.status === 'calling'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {rem.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate">
                          {rem.patientResponse || 'Scheduled for automated dial'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleTriggerReminder(rem)}
                            disabled={isCalling}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-xs"
                          >
                            {isCalling ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Calling...</span>
                              </>
                            ) : (
                              <>
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>Call Patient</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. ANALYTICS & ESCALATIONS */}
      {(currentSection === 'analytics' || (currentSection as any) === 'reports') && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#172B4D] flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-[#2563EB]" />
                <span>Clinic Analytics & AI Receptionist Performance</span>
              </h2>
              <p className="text-xs text-[#718096] mt-0.5">
                Real-time operational metrics, call conversion rates, and clinical triage alerts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Analytics Engine</span>
              </span>
            </div>
          </div>

          {/* Key Analytics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Call Pickup Rate
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#172B4D]">99.4%</span>
                <span className="text-xs font-bold text-emerald-600">Zero Missed Calls</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">24/7 AI concurrency enabled</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-teal-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg Interaction Time
                </span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#172B4D]">1m 48s</span>
                <span className="text-xs font-bold text-teal-600">-65% vs Front-desk</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Fast slot checking & booking</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-purple-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Booking Conversion
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#172B4D]">74.2%</span>
                <span className="text-xs font-bold text-emerald-600">+18% this month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">From voice inquiry to scheduled slot</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs hover:border-amber-200 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  No-Show Reduction
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black text-[#172B4D]">42%</span>
                <span className="text-xs font-bold text-amber-600">Via Bolna Reminders</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Automated confirmation calls</p>
            </div>
          </div>

          {/* Operational Metrics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Language Breakdown */}
            <div className="bg-white rounded-3xl p-5 border border-[#E5EAF2] shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center justify-between">
                <span>Multilingual Voice Distribution</span>
                <span className="text-[11px] text-slate-400 font-normal">Last 30 Days</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">English (General)</span>
                    <span className="text-[#2563EB]">58% (312 calls)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">Hindi (हिन्दी)</span>
                    <span className="text-[#0D9488]">28% (150 calls)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#0D9488] h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">Telugu (తెలుగు)</span>
                    <span className="text-purple-600">14% (76 calls)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total Voice Calls Processed:</span>
                <span className="font-bold text-[#172B4D]">{calls.length + 538}</span>
              </div>
            </div>

            {/* Peak Calling Hours */}
            <div className="bg-white rounded-3xl p-5 border border-[#E5EAF2] shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center justify-between">
                <span>Peak Call Volumes by Hour</span>
                <span className="text-[11px] text-slate-400 font-normal">OPD Schedule</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-700">08:00 AM – 10:00 AM (Morning rush)</span>
                  <span className="font-bold text-[#2563EB]">High (34%)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-700">11:00 AM – 02:00 PM (Mid-day)</span>
                  <span className="font-bold text-slate-700">Moderate (26%)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-700">05:00 PM – 08:00 PM (Evening consults)</span>
                  <span className="font-bold text-[#0D9488]">Peak (28%)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-medium text-slate-700">08:00 PM – 08:00 AM (After hours)</span>
                  <span className="font-bold text-emerald-600">Automated (12%)</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                Priya handles 100% of after-hours calls without requiring night shifts for front-desk staff.
              </p>
            </div>

            {/* Clinic Efficiency Score */}
            <div className="bg-white rounded-3xl p-5 border border-[#E5EAF2] shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D] mb-3 flex items-center justify-between">
                <span>Receptionist ROI Summary</span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Calculated
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Staff Hours Saved / Week:</span>
                  <span className="font-bold text-slate-900">42 Hours</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Double-Bookings Prevented:</span>
                  <span className="font-bold text-emerald-700">100% Zero Collisions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Patient Satisfaction:</span>
                  <span className="font-bold text-slate-900">4.9 / 5.0 (CSAT)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Active Telephony Engine:</span>
                  <span className="font-bold text-[#0D9488]">Bolna AI + Gemini 3.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Escalations & Emergency Triage Queue */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
            <div className="p-5 border-b border-rose-200 bg-rose-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-rose-900 flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Clinical Escalations & Emergency Triage Queue</span>
                </h2>
                <p className="text-xs text-rose-700">
                  Cases escalated from voice receptionist due to red-flag symptoms (chest pain, trauma) or staff transfer
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs">
                {escalations.filter((e) => e.status !== 'resolved').length} Active
              </span>
            </div>

            {escalations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active escalations. All emergency triage queries have been attended to.
              </div>
            ) : (
              escalations.map((esc) => (
                <div key={esc.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            esc.urgency === 'critical'
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Urgency: {esc.urgency}
                        </span>
                        <span className="font-bold text-sm text-[#172B4D]">{esc.patientName}</span>
                        <span className="text-xs text-slate-500 font-mono">({esc.patientPhone})</span>
                      </div>

                      <p className="text-xs font-semibold text-rose-900 mt-1.5">{esc.reason}</p>
                      {esc.notes && <p className="text-xs text-slate-500 mt-1 italic">"{esc.notes}"</p>}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          esc.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {esc.status}
                      </span>

                      {esc.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveEscalation(esc.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. SETTINGS & INTEGRATIONS */}
      {currentSection === 'settings' && settings && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#172B4D]">Clinic Profile & Telephony Settings</h2>
            <p className="text-xs text-[#718096]">
              Configure clinic address, operating hours, and Bolna AI production credentials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={settings.clinicName}
                onChange={(e) => setClinicSettings({ ...settings, clinicName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setClinicSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Line</label>
              <input
                type="text"
                value={settings.emergencyContact}
                onChange={(e) => setClinicSettings({ ...settings, emergencyContact: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">OPD Hours</label>
              <input
                type="text"
                value={settings.operatingHours}
                onChange={(e) => setClinicSettings({ ...settings, operatingHours: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Bolna Credentials */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#172B4D]">Bolna AI Production Telephony</h4>
                <p className="text-xs text-slate-500">
                  Connect real telephone numbers via Bolna Agent ID
                </p>
              </div>
              <button
                onClick={onOpenBolnaModal}
                className="text-xs font-bold text-[#2563EB] hover:underline"
              >
                Open Setup Assistant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bolna API Key</label>
                <input
                  type="password"
                  value={settings.bolnaApiKey}
                  onChange={(e) => setClinicSettings({ ...settings, bolnaApiKey: e.target.value })}
                  placeholder="bolna_live_api_..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bolna Agent ID</label>
                <input
                  type="text"
                  value={settings.bolnaAgentId}
                  onChange={(e) => setClinicSettings({ ...settings, bolnaAgentId: e.target.value })}
                  placeholder="agent_xxxxxxxx-xxxx-xxxx"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono bg-[#F5F8FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handleResetDb}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Database to Seed Data</span>
            </button>

            <button
              onClick={async () => {
                await updateSettings(settings);
                showActionToast('Settings saved successfully.');
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Digital Prescription Document Modal */}
      <DigitalPrescriptionModal
        prescription={selectedPrescriptionForView}
        isOpen={isViewRxModalOpen}
        onClose={() => {
          setIsViewRxModalOpen(false);
          setSelectedPrescriptionForView(null);
        }}
        onEdit={(rx) => {
          setEditingPrescription(rx);
          setIsCreateRxModalOpen(true);
        }}
        clinicInfo={{
          name: settings?.clinicName,
          address: settings?.address,
          phone: settings?.phone,
          emergencyContact: settings?.emergencyContact,
        }}
      />

      {/* Create / Edit Prescription Modal */}
      <CreatePrescriptionModal
        isOpen={isCreateRxModalOpen}
        onClose={() => {
          setIsCreateRxModalOpen(false);
          setEditingPrescription(null);
          setPrefilledAppointmentForRx(null);
        }}
        onSubmit={handleSavePrescription}
        doctors={doctors}
        patients={patients}
        appointments={appointments}
        existingPrescriptions={prescriptions}
        initialData={editingPrescription}
        prefilledAppointment={prefilledAppointmentForRx}
      />

      {/* Patient File & History Modal */}
      <PatientHistoryModal
        patient={selectedPatientForHistory}
        isOpen={isPatientHistoryModalOpen}
        onClose={() => {
          setIsPatientHistoryModalOpen(false);
          setSelectedPatientForHistory(null);
        }}
        prescriptions={prescriptions}
        appointments={appointments}
        onViewPrescription={(rx) => {
          setSelectedPrescriptionForView(rx);
          setIsViewRxModalOpen(true);
        }}
        onCreatePrescriptionForPatient={(pat) => {
          setEditingPrescription(null);
          setPrefilledAppointmentForRx(null);
          setIsCreateRxModalOpen(true);
        }}
      />
    </div>
  );
};
