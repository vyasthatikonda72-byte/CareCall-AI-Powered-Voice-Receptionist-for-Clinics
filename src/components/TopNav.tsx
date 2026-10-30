import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Bell,
  Globe,
  PhoneCall,
  Menu,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  Settings,
  Shield,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { Language, Escalation, Reminder } from '../types/index.ts';

interface TopNavProps {
  onToggleMobileMenu: () => void;
  onOpenVoiceModal: () => void;
  onOpenBolnaModal: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  escalations: Escalation[];
  reminders: Reminder[];
  onSelectSection: (section: any) => void;
  onResetDb?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onToggleMobileMenu,
  onOpenVoiceModal,
  onOpenBolnaModal,
  currentLanguage,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  escalations = [],
  reminders = [],
  onSelectSection,
  onResetDb,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const activeEscalations = escalations.filter((e) => e.status !== 'resolved');
  const scheduledReminders = reminders.filter((r) => r.status === 'scheduled');
  const notificationCount = activeEscalations.length + scheduledReminders.length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-[#E5EAF2] px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_1px_3px_0_rgba(16,42,86,0.03)]">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-600 hover:text-[#172B4D] hover:bg-slate-100 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patients, doctors, appointments, transcripts..."
            className="w-full pl-9 pr-11 py-2 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white transition-all text-[#172B4D] placeholder-[#64748B]"
          />
          <div className="absolute right-3 top-2.5 hidden sm:flex items-center space-x-0.5 text-[10px] font-mono font-medium text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#E5EAF2]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 ml-3">
        {/* Date Display */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs text-[#64748B] font-medium px-2.5 py-1.5 bg-[#F7F9FC] rounded-lg border border-[#E5EAF2]">
          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{todayDateFormatted}</span>
        </div>

        {/* Bolna Status Pill */}
        <button
          onClick={onOpenBolnaModal}
          title="Bolna AI Outbound Voice Telephony Setup"
          className="hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Bolna AI</span>
        </button>

        {/* Multilingual Switcher */}
        <div className="flex items-center bg-[#F7F9FC] rounded-lg p-0.5 border border-[#E5EAF2]">
          <Globe className="w-3.5 h-3.5 ml-1.5 text-[#64748B] hidden sm:block" />
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              currentLanguage === 'en'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('hi')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              currentLanguage === 'hi'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => onLanguageChange('te')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              currentLanguage === 'te'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-[#64748B] hover:text-[#172B4D]'
            }`}
          >
            తెలుగు
          </button>
        </div>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileDropdownOpen(false);
            }}
            title="Notification Center & Alerts"
            className="relative p-2 rounded-xl text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 border border-[#E5EAF2] transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E5EAF2] py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-[#E5EAF2] flex items-center justify-between">
                <span className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                  Clinic Notification Center ({notificationCount})
                </span>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="text-xs text-[#64748B] hover:text-[#172B4D] cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {activeEscalations.map((esc) => (
                  <div
                    key={esc.id}
                    onClick={() => {
                      onSelectSection('analytics');
                      setNotificationOpen(false);
                    }}
                    className="p-3 hover:bg-rose-50/60 cursor-pointer transition-colors flex items-start space-x-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-rose-900">Urgent Staff Escalation</span>
                        <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          {esc.urgency}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-1">{esc.reason}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Patient: {esc.patientName} ({esc.patientPhone})
                      </span>
                    </div>
                  </div>
                ))}

                {scheduledReminders.slice(0, 3).map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => {
                      onSelectSection('reminders');
                      setNotificationOpen(false);
                    }}
                    className="p-3 hover:bg-teal-50/60 cursor-pointer transition-colors flex items-start space-x-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#172B4D]">
                        Scheduled Reminder: {rem.patientName}
                      </span>
                      <p className="text-[#64748B] text-[11px]">
                        {rem.doctorName} • {rem.appointmentDate} at {rem.appointmentTime}
                      </p>
                    </div>
                  </div>
                ))}

                {notificationCount === 0 && (
                  <div className="p-6 text-center text-[#64748B] text-xs">
                    All notifications cleared. No active escalations.
                  </div>
                )}
              </div>

              <div className="px-4 pt-2 border-t border-[#E5EAF2] text-center">
                <button
                  onClick={() => {
                    onSelectSection('analytics');
                    setNotificationOpen(false);
                  }}
                  className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                >
                  View All Escalations & Reports
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Start Voice Call Button */}
        <button
          onClick={onOpenVoiceModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#0D9488] hover:from-blue-700 hover:to-teal-700 shadow-sm shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline">Start Voice Call</span>
          <span className="sm:hidden">Call</span>
        </button>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationOpen(false);
            }}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-[#E5EAF2] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#102A56] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
              RV
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <span className="font-bold text-[#172B4D] block">Dr. Rajesh Varma</span>
              <span className="text-[10px] text-[#64748B] font-medium">Chief Medical Officer</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden lg:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5EAF2] py-2 z-50 animate-fade-in text-xs">
              <div className="px-4 py-2 border-b border-[#E5EAF2]">
                <p className="font-bold text-[#172B4D]">Dr. Rajesh Varma</p>
                <p className="text-[11px] text-[#64748B]">rajesh.varma@citycare.com</p>
                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Clinic Status: Online</span>
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSelectSection('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[#172B4D] hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Clinic Settings</span>
                </button>
                <button
                  onClick={() => {
                    onOpenBolnaModal();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[#172B4D] hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bolna Telephony Settings</span>
                </button>
                {onResetDb && (
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onResetDb();
                    }}
                    className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
