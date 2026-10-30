import React, { useState } from 'react';
import {
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Headphones,
  Zap,
  Users,
  Activity,
  Award,
  ChevronRight,
  MessageSquare,
  Building,
  HeartHandshake,
} from 'lucide-react';
import type { Language } from '../types/index.ts';

interface LandingPageProps {
  onStartVoiceDemo: () => void;
  onNavigateToBooking: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToDoctors: () => void;
  currentLanguage: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartVoiceDemo,
  onNavigateToBooking,
  onNavigateToDashboard,
  onNavigateToDoctors,
  currentLanguage,
}) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-teal-100/70 text-teal-800 border border-teal-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
              <span>Your Clinic Never Misses a Call</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI Voice Receptionist for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600">
                Modern Healthcare
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
              Empower your hospital or clinic with Priya — an intelligent 24/7 AI virtual receptionist.
              She answers patient calls naturally in <strong>English, Hindi, and Telugu</strong>, checks live doctor availability, books appointments, and safely escalates emergencies.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onStartVoiceDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span>Try Voice Demo Now</span>
              </button>

              <button
                onClick={onNavigateToDashboard}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Users className="w-5 h-5 text-slate-600" />
                <span>Open Clinic Dashboard</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-teal-600" />
                <span>English • हिन्दी • తెలుగు</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Emergency Triage Safeguard</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Voice Demo Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-700 to-cyan-700 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Live Interactive Voice Receptionist Preview</h3>
                  <p className="text-xs text-teal-100">Click below to experience how Priya talks with patients</p>
                </div>
              </div>
              <button
                onClick={onStartVoiceDemo}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-teal-800 hover:bg-teal-50 shadow-xs transition-all flex items-center space-x-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Start Live Call</span>
              </button>
            </div>

            <div className="p-6 bg-slate-50/70 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dialogue Step 1 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    1. Natural Voice Call
                  </span>
                  <span className="text-xs text-slate-400 font-mono">00:03</span>
                </div>
                <p className="text-xs font-medium text-slate-800">
                  <strong>Patient:</strong> "Hi, I have a skin allergy and need an appointment with a dermatologist today."
                </p>
                <p className="text-xs text-teal-800 bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                  <strong>Priya (AI):</strong> "Dr. Priya Sharma is available today at 05:30 PM and 06:30 PM. Which time suits you?"
                </p>
              </div>

              {/* Dialogue Step 2 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    2. Live Conflict Check
                  </span>
                  <span className="text-xs text-slate-400 font-mono">00:15</span>
                </div>
                <p className="text-xs font-medium text-slate-800">
                  <strong>Patient:</strong> "5:30 PM works. My name is Rohan Mehra."
                </p>
                <p className="text-xs text-blue-800 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                  <strong>Priya (AI):</strong> "Checking schedule... Slot is open! Booking confirmed. Your ID is #CC-2026-101."
                </p>
              </div>

              {/* Dialogue Step 3 */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    3. Instant Dashboard Sync
                  </span>
                  <span className="text-xs text-slate-400 font-mono">00:22</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Appointment logged in Clinic DB</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Automated voice reminder queued</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>No receptionist manual effort</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-400">100%</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Calls Answered 24/7</p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">70%</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Receptionist Time Saved</p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">3</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Fluent Languages (EN, HI, TE)</p>
            </div>
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">0</div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Double-Booking Conflicts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Comprehensive Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Hospitals, Clinics & Doctors
          </h2>
          <p className="text-sm text-slate-500">
            Everything your medical practice needs to streamline phone reception, eliminate wait times, and guarantee 24/7 patient accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">24/7 Natural Voice Receptionist</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Patients speak over phone or browser just like talking to a friendly human staff member. Handles greetings, questions, doctor availability, and clinic directions without menu trees.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Multilingual (English, Hindi, Telugu)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eliminates language barriers. Seamlessly switches languages mid-conversation when requested ("తెలుగులో మాట్లాడండి" or "हिंदी में बात करें") to serve diverse patient demographics.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Real-Time Conflict-Free Booking</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Checks the actual clinic database before promising any appointment. Strictly prevents double-booking of doctor slots and instantly issues a unique booking ID with SMS notification.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Emergency Protocol & Human Handoff</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Safety first. If a patient mentions chest pain, trauma, or dyspnea, the AI immediately urges emergency services (108/911) and escalates directly to duty clinic staff.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Automated Outbound Reminders</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Integrated with Bolna AI for outbound voice phone calls. Proactively phones patients 24 hours prior to confirm attendance or handle rescheduling, slashing clinic no-show rates.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Hospital Admin SaaS Console</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Full appointment management, doctor availability toggling, patient records, call transcripts with audio playback simulation, and interactive analytics charts.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-14 text-white space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
              Simple 4-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How CareCall Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From the patient's first ring to a confirmed OPD appointment in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-base">
                1
              </div>
              <h4 className="font-bold text-base text-white">Patient Calls Clinic</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Patient dials clinic phone or starts voice demo. Priya answers instantly without busy tones or hold queues.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-base">
                2
              </div>
              <h4 className="font-bold text-base text-white">AI Understands & Checks DB</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Converses naturally in caller's preferred language (EN/HI/TE), queries doctor slots, and confirms timing.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h4 className="font-bold text-base text-white">Books Conflict-Free Slot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Locks the slot in the database, generates booking ID (e.g., #CC-2026-101), and dispatches confirmation.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                4
              </div>
              <h4 className="font-bold text-base text-white">Syncs with Admin Dashboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clinic doctors and receptionists immediately see the booking, patient records, and full transcript.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLINIC ONBOARDING & CONTACT SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Get Started
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bring CareCall to Your Clinic
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Request a tailored onboarding demo for your hospital or outpatient practice.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-emerald-900">Demo Request Received!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you! Our clinic integration specialist will reach out to schedule your setup and Bolna voice agent provisioning.
              </p>
              <button
                onClick={() => setContactSubmitted(false)}
                className="mt-2 text-xs font-bold text-teal-700 underline"
              >
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinic / Hospital Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Apex Health Center"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 XXXXX"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>Request Custom Clinic Voice Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
