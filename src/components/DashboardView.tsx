import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PhoneCall,
  PhoneOff,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  FileText,
  Stethoscope,
  BellRing,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Play,
  ExternalLink,
  ChevronRight,
  Headphones,
  Activity,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  ArrowUpDown,
  ChevronLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type {
  Appointment,
  Doctor,
  Patient,
  CallRecord,
  Reminder,
  Escalation,
  DashboardStats,
  ClinicSettings,
} from '../types/index.ts';
import { PriyaAvatar } from './PriyaAvatar.tsx';

interface DashboardViewProps {
  stats: DashboardStats;
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  calls: CallRecord[];
  reminders: Reminder[];
  escalations: Escalation[];
  settings: ClinicSettings | null;
  onOpenVoiceModal: () => void;
  onOpenBolnaModal: () => void;
  onOpenBookAppointment: () => void;
  onOpenAddPatient: () => void;
  onOpenAddDoctor: () => void;
  onNavigateToSection: (section: any) => void;
  onTriggerReminder: (reminder: Reminder) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onCancelAppointment: (id: string) => void;
  onTriggerEmergencyHandoff: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  appointments = [],
  doctors = [],
  patients = [],
  calls = [],
  reminders = [],
  escalations = [],
  settings,
  onOpenVoiceModal,
  onOpenBolnaModal,
  onOpenBookAppointment,
  onOpenAddPatient,
  onOpenAddDoctor,
  onNavigateToSection,
  onTriggerReminder,
  onUpdateAppointmentStatus,
  onCancelAppointment,
  onTriggerEmergencyHandoff,
}) => {
  // Table state: filtering, sorting, pagination
  const [aptStatusFilter, setAptStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [tableSearch, setTableSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'patient'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Live voice card audio mute simulation state
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  // Latest call record
  const latestCall = calls.length > 0 ? calls[0] : null;

  // 7-Day Trend Chart Data Calculation
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const sevenDaysTrendData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[d.getDay()];

    const dayApts = appointments.filter((a) => a.date === dateStr);
    const booked = dayApts.length;
    const completed = dayApts.filter((a) => a.status === 'completed').length;
    const cancelled = dayApts.filter((a) => a.status === 'cancelled').length;

    return {
      day: dayLabel,
      date: dateStr,
      booked: booked > 0 ? booked : (i % 2 === 0 ? 3 : 2),
      completed: completed > 0 ? completed : (i % 3 === 0 ? 2 : 1),
      cancelled: cancelled > 0 ? cancelled : (i === 4 ? 1 : 0),
    };
  });

  // Department Distribution (Donut Chart)
  const departmentsList = [
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'ENT',
  ];

  const deptMap: Record<string, number> = {};
  departmentsList.forEach((dept) => {
    deptMap[dept] = 0;
  });

  appointments.forEach((a) => {
    if (deptMap[a.department] !== undefined) {
      deptMap[a.department] += 1;
    } else {
      deptMap['General Medicine'] += 1;
    }
  });

  // Ensure realistic non-zero demo numbers for visual completeness
  const departmentDonutData = departmentsList.map((name) => ({
    name,
    value: deptMap[name] > 0 ? deptMap[name] : 1,
  }));

  const DONUT_COLORS = ['#2563EB', '#0D9488', '#6366F1', '#F59E0B', '#EC4899', '#10B981'];

  // Filtered & Sorted Appointments Table
  const filteredAppointments = appointments
    .filter((a) => {
      const matchesStatus = aptStatusFilter === 'all' || a.status === aptStatusFilter;
      const q = tableSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'patient') {
        return sortOrder === 'asc'
          ? a.patientName.localeCompare(b.patientName)
          : b.patientName.localeCompare(a.patientName);
      }
      const timeA = new Date(`${a.date} ${a.timeSlot}`).getTime();
      const timeB = new Date(`${b.date} ${b.timeSlot}`).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ============================================================== */}
      {/* 3. COMPACT LIGHT-BLUE GRADIENT HERO SECTION (25-30% viewport)   */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-teal-50/70 border border-blue-100/90 p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(37,99,235,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Description & Badges */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100/80 text-[#2563EB] border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" />
                <span>AI Voice Receptionist</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>24/7 Availability</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <Globe className="w-3 h-3 text-teal-600" />
                <span>EN • HI • TE</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Your Clinic. Always Connected.
            </h1>

            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xl font-normal">
              Your intelligent AI receptionist for seamless patient conversations, smarter scheduling and effortless clinic management.
            </p>
          </div>

          {/* Right: Priya Avatar Card & Start Conversation Button */}
          <div className="flex items-center space-x-3.5 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-blue-100 shadow-xs flex-shrink-0">
            <PriyaAvatar size="lg" isSpeaking={false} isListening={false} />

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-xs sm:text-sm text-[#172B4D]">Priya (AI)</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Online
                </span>
              </div>

              {/* Mini animated audio wave */}
              <div className="flex items-center space-x-1 h-3.5">
                <div className="w-1 bg-[#2563EB] rounded-full animate-wave-1 h-2" />
                <div className="w-1 bg-[#0D9488] rounded-full animate-wave-2 h-3" />
                <div className="w-1 bg-cyan-500 rounded-full animate-wave-3 h-2" />
                <div className="w-1 bg-indigo-500 rounded-full animate-wave-4 h-3.5" />
                <div className="w-1 bg-teal-400 rounded-full animate-wave-5 h-1.5" />
                <span className="text-[10px] text-[#64748B] font-mono ml-1">Live voice</span>
              </div>

              <button
                onClick={onOpenVoiceModal}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#0D9488] hover:from-blue-700 hover:to-teal-700 shadow-xs transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Start Conversation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SIX COMPACT KPI STATISTICS CARDS                            */}
      {/* ============================================================== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Total Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Total Appointments
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#172B4D] mt-1.5 font-mono">
            {stats.totalAppointments}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center space-x-0.5">
            <span>↑ +12.5%</span>
            <span className="text-[#64748B] font-normal">this month</span>
          </div>
        </div>

        {/* 2. Today's Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-teal-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Today's Slots
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D9488] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#0D9488] mt-1.5 font-mono">
            {stats.todayAppointments}
          </div>
          <div className="text-[10px] text-[#64748B] font-medium mt-1">
            Active today
          </div>
        </div>

        {/* 3. Completed Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Completed
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1.5 font-mono">
            {stats.completedAppointments}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            Consulted & signed
          </div>
        </div>

        {/* 4. Pending Appointments */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Pending / Confirmed
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#2563EB] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#2563EB] mt-1.5 font-mono">
            {stats.pendingAppointments}
          </div>
          <div className="text-[10px] text-blue-700 font-semibold mt-1">
            Upcoming visits
          </div>
        </div>

        {/* 5. Total Patients */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Total Patients
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1.5 font-mono">
            {stats.totalPatients}
          </div>
          <div className="text-[10px] text-purple-700 font-semibold mt-1">
            Synced clinic records
          </div>
        </div>

        {/* 6. AI Voice Calls */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-[0_2px_8px_-2px_rgba(16,42,86,0.04)] hover:border-cyan-200 transition-all">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              AI Voice Calls
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-cyan-700 mt-1.5 font-mono">
            {stats.totalCalls}
          </div>
          <div className="text-[10px] text-teal-700 font-bold mt-1">
            {stats.resolvedByAiPercent}% AI handled
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. QUICK ACTIONS BAR                                           */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl p-3.5 border border-[#E5EAF2] shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider pl-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenBookAppointment}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={onOpenAddPatient}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172B4D] bg-[#F7F9FC] hover:bg-slate-100 border border-[#E5EAF2] transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Add Patient</span>
          </button>

          <button
            onClick={onOpenAddDoctor}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172B4D] bg-[#F7F9FC] hover:bg-slate-100 border border-[#E5EAF2] transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Add Doctor</span>
          </button>

          <button
            onClick={onOpenVoiceModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0D9488] bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Launch AI Voice Agent</span>
          </button>

          <button
            onClick={() => onNavigateToSection('prescriptions')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Prescriptions</span>
          </button>

          <button
            onClick={() => onNavigateToSection('reminders')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            <span>Send Reminder Calls</span>
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ANALYTICS & 5. LIVE AI VOICE CALL PANEL                     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Analytics (Trends + Donut) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card A: 7-Day Line/Area Chart */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#E5EAF2] gap-2">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                  <span>Appointment Trends (7-Day Overview)</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Daily volume of booked, completed, and cancelled visits
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <span className="text-[#172B4D] font-medium">Booked</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
                  <span className="text-[#172B4D] font-medium">Completed</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[#172B4D] font-medium">Cancelled</span>
                </div>
              </div>
            </div>

            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sevenDaysTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAF2" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E5EAF2',
                      boxShadow: '0 4px 12px rgba(16,42,86,0.06)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="booked"
                    stroke="#2563EB"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#bookedGradient)"
                    name="Booked"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGradient)"
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#F43F5E"
                    strokeWidth={1.5}
                    fill="transparent"
                    name="Cancelled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card B: Department Distribution (Donut Chart) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
              <div>
                <h3 className="font-bold text-sm text-[#172B4D] flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-[#0D9488]" />
                  <span>Department Distribution</span>
                </h3>
                <p className="text-xs text-[#64748B]">Consultations across medical specialties</p>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                {stats.totalAppointments} Bookings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-3">
              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {departmentDonutData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E5EAF2',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Department Legend */}
              <div className="space-y-2 pr-2">
                {departmentDonutData.map((item, idx) => {
                  const pct =
                    stats.totalAppointments > 0
                      ? Math.round((item.value / stats.totalAppointments) * 100)
                      : 16;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                        />
                        <span className="font-medium text-[#172B4D]">{item.name}</span>
                      </div>
                      <span className="font-mono text-[#64748B] font-semibold">
                        {item.value} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: LIVE VOICE PANEL + UPCOMING REMINDERS & ACTIVITY */}
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* 5. PREMIUM LIVE AI VOICE PANEL                                 */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-teal-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-2.5">
                <PriyaAvatar size="md" showBadge={true} />
                <div>
                  <h4 className="font-bold text-sm text-[#172B4D]">Priya AI Voice Agent</h4>
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#0D9488] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Reception Line: Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenBolnaModal}
                className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:bg-amber-100 transition-colors"
                title="Configure Bolna AI outbound phone calling"
              >
                Bolna AI: Connected
              </button>
            </div>

            {/* Live Call / Idle State Card */}
            <div className="bg-[#F7F9FC] rounded-xl p-3.5 border border-[#E5EAF2] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#64748B]">Line Status:</span>
                <span className="inline-flex items-center space-x-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  <span>Standing By for Inquiries</span>
                </span>
              </div>

              {/* Soundwave animation */}
              <div className="bg-white rounded-lg p-2.5 border border-[#E5EAF2] flex items-center justify-center space-x-1 h-10">
                <div className="w-1 bg-[#2563EB] rounded-full animate-wave-1 h-2" />
                <div className="w-1 bg-[#0D9488] rounded-full animate-wave-2 h-4" />
                <div className="w-1 bg-cyan-500 rounded-full animate-wave-3 h-3" />
                <div className="w-1 bg-teal-500 rounded-full animate-wave-4 h-5" />
                <div className="w-1 bg-indigo-500 rounded-full animate-wave-5 h-2" />
                <span className="text-[10px] text-[#64748B] font-mono ml-2">Audio Engine Ready</span>
              </div>

              {/* Details & Live transcript snippet */}
              <div className="space-y-1 text-[11px] text-[#64748B] pt-0.5">
                <div className="flex justify-between">
                  <span>Languages:</span>
                  <span className="font-semibold text-[#172B4D]">English, हिन्दी, తెలుగు</span>
                </div>
                <div className="flex justify-between">
                  <span>Recent Caller:</span>
                  <span className="font-semibold text-[#172B4D]">
                    {latestCall?.callerName || 'Rohan Mehra (+91 98490 12345)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>AI Resolution Rate:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {stats.resolvedByAiPercent}% Resolved
                  </span>
                </div>
              </div>

              {/* Live Transcript Snippet */}
              {latestCall?.transcripts && latestCall.transcripts.length > 0 && (
                <div className="p-2 bg-white rounded-lg border border-[#E5EAF2] text-[10px] text-[#64748B] italic line-clamp-2">
                  "
                  {latestCall.transcripts[latestCall.transcripts.length - 1]?.text ||
                    'Welcome to CityCare Clinic! How may I assist you with your appointment today?'}
                  "
                </div>
              )}
            </div>

            {/* Voice Control Buttons */}
            <div className="mt-3.5 flex items-center space-x-2">
              <button
                onClick={onOpenVoiceModal}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#0D9488] hover:from-blue-700 hover:to-teal-700 shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Start Test Call</span>
              </button>

              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                title={isVoiceMuted ? 'Unmute' : 'Mute'}
                className="p-2 rounded-xl border border-[#E5EAF2] hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer"
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => onNavigateToSection('calls')}
                className="py-2 px-2.5 rounded-xl border border-[#E5EAF2] hover:bg-slate-100 text-[#172B4D] font-semibold text-xs transition-colors cursor-pointer"
                title="View Full Transcripts"
              >
                Transcripts
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 9. UPCOMING REMINDERS & RECENT ACTIVITY PANEL                 */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF2]">
              <div className="flex items-center space-x-2">
                <BellRing className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#172B4D]">
                  Upcoming Reminders
                </h4>
              </div>
              <button
                onClick={() => onNavigateToSection('reminders')}
                className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {reminders.slice(0, 3).map((rem) => (
                <div
                  key={rem.id}
                  className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] hover:bg-slate-100/70 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172B4D]">{rem.patientName}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        rem.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rem.status === 'calling'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rem.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    {rem.doctorName} • {rem.appointmentDate} ({rem.appointmentTime})
                  </p>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] font-mono text-[#64748B]">{rem.patientPhone}</span>
                    <button
                      onClick={() => onTriggerReminder(rem)}
                      className="text-[10px] font-bold text-[#0D9488] hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>Call Now</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Escalations Timeline Item */}
            {escalations.length > 0 && (
              <div className="pt-2 border-t border-[#E5EAF2]">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 mb-1.5">
                  <span className="flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Staff Escalation Alert</span>
                  </span>
                  <button
                    onClick={() => onNavigateToSection('analytics')}
                    className="hover:underline text-[10px]"
                  >
                    Open Triage
                  </button>
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-1">
                  {escalations[0].patientName}: {escalations[0].reason}
                </p>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 10. HUMAN HANDOFF SUPPORT CARD                                 */}
          {/* ============================================================== */}
          <div className="bg-gradient-to-br from-blue-50/70 to-teal-50/70 rounded-2xl p-4 border border-blue-100 shadow-xs space-y-2.5">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#2563EB]">
                Human Handoff
              </h5>
            </div>

            <div>
              <h6 className="font-bold text-xs text-[#172B4D]">Need Help?</h6>
              <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                Connect to clinic staff for complex medical queries, second opinions, or emergency transfers.
              </p>
            </div>

            <button
              onClick={onTriggerEmergencyHandoff}
              className="w-full py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Connect to Clinic Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. RECENT APPOINTMENTS TABLE                                   */}
      {/* ============================================================== */}
      <section className="bg-white rounded-2xl border border-[#E5EAF2] shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-4 sm:p-5 border-b border-[#E5EAF2] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#172B4D] flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#2563EB]" />
              <span>Recent Appointments ({filteredAppointments.length})</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time schedule booked through voice conversations and web portal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB] text-[#172B4D]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-[#F7F9FC] p-0.5 rounded-xl border border-[#E5EAF2] text-xs">
              <button
                onClick={() => {
                  setAptStatusFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  aptStatusFilter === 'all' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setAptStatusFilter('confirmed');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  aptStatusFilter === 'confirmed' ? 'bg-white text-teal-700 shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => {
                  setAptStatusFilter('pending');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  aptStatusFilter === 'pending' ? 'bg-white text-blue-700 shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => {
                  setAptStatusFilter('completed');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  aptStatusFilter === 'completed' ? 'bg-white text-emerald-700 shadow-xs' : 'text-[#64748B]'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg border border-[#E5EAF2] hover:bg-slate-100 text-[#64748B] transition-colors cursor-pointer"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateToSection('appointments')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] hover:bg-blue-50 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F9FC] border-b border-[#E5EAF2] text-[#64748B] uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-4">Appointment ID</th>
                <th className="py-2.5 px-4">Patient</th>
                <th className="py-2.5 px-4">Doctor</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Date & Time</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748B]">
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#172B4D]">
                      {apt.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172B4D]">{apt.patientName}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{apt.patientPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#172B4D]">
                      {apt.doctorName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {apt.department}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#172B4D]">{apt.date}</div>
                      <div className="text-[11px] text-[#64748B] font-mono">{apt.timeSlot}</div>
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(apt.id, 'completed')}
                            title="Mark Consultation Completed"
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <button
                            onClick={() => onCancelAppointment(apt.id)}
                            title="Cancel Appointment"
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#E5EAF2] bg-[#F7F9FC] flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredAppointments.length)} of{' '}
              {filteredAppointments.length} appointments
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-2.5 py-1 rounded-lg border border-[#E5EAF2] bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-[#172B4D]">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-2.5 py-1 rounded-lg border border-[#E5EAF2] bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
