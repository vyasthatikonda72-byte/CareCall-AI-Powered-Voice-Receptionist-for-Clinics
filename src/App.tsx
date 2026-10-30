import React, { useState, useEffect } from 'react';
import type { Language, Appointment, Doctor, Patient, Escalation, Reminder } from './types/index.ts';
import { Sidebar, NavSection } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { VoiceReceptionistView } from './components/VoiceReceptionistView.tsx';
import { VoiceReceptionistModal } from './components/VoiceReceptionistModal.tsx';
import { BookingPortal } from './components/BookingPortal.tsx';
import { DoctorDirectory } from './components/DoctorDirectory.tsx';
import { BolnaSetupModal } from './components/BolnaSetupModal.tsx';
import { AddPatientModal } from './components/AddPatientModal.tsx';
import { AddDoctorModal } from './components/AddDoctorModal.tsx';
import { Footer } from './components/Footer.tsx';
import { fetchEscalations, fetchReminders, resetDatabase, fetchPrescriptions } from './services/api.ts';

export default function App() {
  // Navigation: Platform Admin SaaS (default) or Public Patient View
  const [viewMode, setViewMode] = useState<'platform' | 'public_landing' | 'public_voice' | 'public_book'>('platform');
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Language & Modals
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [bolnaModalOpen, setBolnaModalOpen] = useState<boolean>(false);
  const [addPatientModalOpen, setAddPatientModalOpen] = useState<boolean>(false);
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState<boolean>(false);

  // Global search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Notifications and live alerts
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pendingPrescriptionCount, setPendingPrescriptionCount] = useState<number>(0);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    fetchEscalations().then(setEscalations).catch(console.error);
    fetchReminders().then(setReminders).catch(console.error);
    fetchPrescriptions()
      .then((rxs) => setPendingPrescriptionCount(rxs.filter((r) => r.status === 'draft').length))
      .catch(console.error);
  }, [refreshTrigger]);

  const handleOpenVoice = (lang?: Language) => {
    if (lang) setCurrentLanguage(lang);
    setVoiceModalOpen(true);
  };

  const handleSelectSection = (section: NavSection) => {
    setCurrentSection(section);
    setViewMode('platform');
    setMobileMenuOpen(false);
  };

  const handleResetDb = async () => {
    if (!confirm('Restore sample database records?')) return;
    try {
      await resetDatabase();
      setRefreshTrigger((prev) => prev + 1);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex text-[#172B4D] antialiased selection:bg-[#2563EB] selection:text-white">
      {/* 1. DARK NAVY VERTICAL SIDEBAR (Desktop) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={handleSelectSection}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenVoiceModal={() => handleOpenVoice(currentLanguage)}
          onViewPublicSite={() => setViewMode('public_landing')}
          activeEscalationCount={escalations.filter((e) => e.status !== 'resolved').length}
          upcomingReminderCount={reminders.filter((r) => r.status === 'scheduled').length}
          pendingPrescriptionCount={pendingPrescriptionCount}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#10264A]/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#10264A] transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentSection={currentSection}
          onSelectSection={handleSelectSection}
          isCollapsed={false}
          onToggleCollapse={() => setMobileMenuOpen(false)}
          onOpenVoiceModal={() => {
            handleOpenVoice(currentLanguage);
            setMobileMenuOpen(false);
          }}
          onViewPublicSite={() => {
            setViewMode('public_landing');
            setMobileMenuOpen(false);
          }}
          activeEscalationCount={escalations.filter((e) => e.status !== 'resolved').length}
          upcomingReminderCount={reminders.filter((r) => r.status === 'scheduled').length}
          pendingPrescriptionCount={pendingPrescriptionCount}
        />
      </div>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navigation */}
        <TopNav
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenVoiceModal={() => handleOpenVoice(currentLanguage)}
          onOpenBolnaModal={() => setBolnaModalOpen(true)}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          escalations={escalations}
          reminders={reminders}
          onSelectSection={handleSelectSection}
          onResetDb={handleResetDb}
        />

        {/* Public View Header Banner (When viewing patient landing or portal) */}
        {viewMode !== 'platform' && (
          <div className="bg-[#10264A] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs border-b border-blue-900/40">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-teal-300">Viewing Patient-Facing Experience:</span>
              <span className="capitalize text-slate-300">
                {viewMode === 'public_landing'
                  ? 'Landing Page'
                  : viewMode === 'public_voice'
                  ? 'Voice Receptionist Console'
                  : 'Booking Portal'}
              </span>
            </div>
            <button
              onClick={() => setViewMode('platform')}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors"
            >
              Back to Admin Hub
            </button>
          </div>
        )}

        {/* Main Body View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {viewMode === 'platform' && (
            <AdminDashboard
              key={refreshTrigger}
              currentSection={currentSection}
              onSelectSection={handleSelectSection}
              onOpenVoiceModal={() => handleOpenVoice(currentLanguage)}
              onOpenBolnaModal={() => setBolnaModalOpen(true)}
              onOpenBookAppointment={() => setViewMode('public_book')}
              onOpenAddPatient={() => setAddPatientModalOpen(true)}
              onOpenAddDoctor={() => setAddDoctorModalOpen(true)}
              globalSearchQuery={searchQuery}
            />
          )}

          {viewMode === 'public_landing' && (
            <LandingPage
              onStartVoiceDemo={() => handleOpenVoice(currentLanguage)}
              onNavigateToBooking={() => setViewMode('public_book')}
              onNavigateToDashboard={() => setViewMode('platform')}
              onNavigateToDoctors={() => {
                setCurrentSection('doctors');
                setViewMode('platform');
              }}
              currentLanguage={currentLanguage}
            />
          )}

          {viewMode === 'public_voice' && (
            <VoiceReceptionistView
              initialLanguage={currentLanguage}
              onAppointmentBooked={() => setRefreshTrigger((prev) => prev + 1)}
              onViewDashboard={() => setViewMode('platform')}
            />
          )}

          {viewMode === 'public_book' && (
            <BookingPortal
              onAppointmentCreated={() => {
                setRefreshTrigger((prev) => prev + 1);
              }}
              onViewDashboard={() => setViewMode('platform')}
            />
          )}
        </main>

        {/* Footer */}
        <Footer
          onNavigate={(section) => {
            if (section === 'landing') setViewMode('public_landing');
            else if (section === 'voice') setViewMode('public_voice');
            else if (section === 'book') setViewMode('public_book');
            else {
              setViewMode('platform');
              setCurrentSection(section as any);
            }
          }}
          onOpenVoiceModal={() => handleOpenVoice(currentLanguage)}
        />
      </div>

      {/* 3. MODALS (Accessible from any view) */}
      <VoiceReceptionistModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        initialLanguage={currentLanguage}
        onAppointmentBooked={() => setRefreshTrigger((prev) => prev + 1)}
        onViewDashboard={() => {
          setViewMode('platform');
          setCurrentSection('appointments');
        }}
      />

      <BolnaSetupModal
        isOpen={bolnaModalOpen}
        onClose={() => setBolnaModalOpen(false)}
      />

      <AddPatientModal
        isOpen={addPatientModalOpen}
        onClose={() => setAddPatientModalOpen(false)}
        onPatientAdded={() => {
          setRefreshTrigger((prev) => prev + 1);
          setCurrentSection('patients');
        }}
      />

      <AddDoctorModal
        isOpen={addDoctorModalOpen}
        onClose={() => setAddDoctorModalOpen(false)}
        onDoctorAdded={() => {
          setRefreshTrigger((prev) => prev + 1);
          setCurrentSection('doctors');
        }}
      />
    </div>
  );
}
