import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  PhoneCall,
  BellRing,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Headphones,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import { PriyaAvatar } from './PriyaAvatar.tsx';

export type NavSection =
  | 'dashboard'
  | 'appointments'
  | 'prescriptions'
  | 'patients'
  | 'doctors'
  | 'calls'
  | 'reminders'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenVoiceModal: () => void;
  onViewPublicSite: () => void;
  activeEscalationCount?: number;
  upcomingReminderCount?: number;
  pendingPrescriptionCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  onOpenVoiceModal,
  onViewPublicSite,
  activeEscalationCount = 0,
  upcomingReminderCount = 0,
  pendingPrescriptionCount = 0,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavSection,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'appointments' as NavSection,
      label: 'Appointments',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'prescriptions' as NavSection,
      label: 'Prescriptions',
      icon: FileText,
      badge: pendingPrescriptionCount > 0 ? `${pendingPrescriptionCount} Draft` : null,
    },
    {
      id: 'patients' as NavSection,
      label: 'Patients',
      icon: Users,
      badge: null,
    },
    {
      id: 'doctors' as NavSection,
      label: 'Doctors',
      icon: Stethoscope,
      badge: null,
    },
    {
      id: 'calls' as NavSection,
      label: 'AI Voice Calls',
      icon: PhoneCall,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'reminders' as NavSection,
      label: 'Reminders',
      icon: BellRing,
      badge: upcomingReminderCount > 0 ? upcomingReminderCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'analytics' as NavSection,
      label: 'Analytics',
      icon: BarChart3,
      badge: activeEscalationCount > 0 ? `${activeEscalationCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'settings' as NavSection,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#102A56] text-slate-300 flex flex-col z-30 transition-all duration-300 border-r border-[#1B3A70] select-none ${
        isCollapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1B3A70]">
        {!isCollapsed ? (
          <div
            className="flex items-center space-x-2.5 overflow-hidden cursor-pointer"
            onClick={() => onSelectSection('dashboard')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base text-white tracking-tight">CareCall</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-[#0D9488]/30 text-teal-300 rounded border border-[#0D9488]/40">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                AI Voice Receptionist
              </p>
            </div>
          </div>
        ) : (
          <div
            className="mx-auto cursor-pointer"
            onClick={() => onSelectSection('dashboard')}
            title="CareCall AI Receptionist"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-md">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1 no-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>
        )}

        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-300'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold tracking-tight border ${
                    item.badgeColor || 'bg-white/10 text-white border-white/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Active Indicator Strip */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-400 rounded-r-full" />
              )}
            </button>
          );
        })}

        {/* Quick Launch Voice AI Pill */}
        <div className="pt-3">
          <button
            onClick={onOpenVoiceModal}
            className={`w-full flex items-center rounded-xl text-xs font-bold transition-all text-teal-300 bg-[#0D9488]/15 hover:bg-[#0D9488]/25 border border-[#0D9488]/30 cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
            title="Launch Priya AI Voice Receptionist"
          >
            <div className="flex items-center space-x-2.5">
              <PhoneCall className="w-4 h-4 text-teal-400 animate-pulse flex-shrink-0" />
              {!isCollapsed && <span>Voice Demo</span>}
            </div>
            {!isCollapsed && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <div className="p-3 border-t border-[#1B3A70] bg-[#0C2042] space-y-2">
        {!isCollapsed ? (
          <>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-2.5 text-xs">
              <PriyaAvatar size="sm" showBadge={false} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-[11px]">Priya AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-teal-300 block font-medium">24/7 Virtual Voice</span>
              </div>
            </div>

            <button
              onClick={onViewPublicSite}
              className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>Public Patient View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              title="AI Receptionist: Active 24/7"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
