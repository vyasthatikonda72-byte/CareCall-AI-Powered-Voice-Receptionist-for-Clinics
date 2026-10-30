import React from 'react';
import { PhoneCall, ShieldCheck, Calendar, Users, Stethoscope, Globe, Sparkles, AlertCircle } from 'lucide-react';
import type { Language } from '../types/index.ts';

interface NavbarProps {
  activeTab: 'landing' | 'voice' | 'book' | 'doctors' | 'admin';
  setActiveTab: (tab: 'landing' | 'voice' | 'book' | 'doctors' | 'admin') => void;
  onOpenVoiceModal: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenBolnaModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenVoiceModal,
  currentLanguage,
  onLanguageChange,
  onOpenBolnaModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Care<span className="text-teal-600">Call</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  AI Voice Receptionist
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Your Clinic Never Misses a Call
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'landing'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'voice'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Voice Receptionist</span>
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'book'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'doctors'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Bolna Integration Status pill */}
            <button
              onClick={onOpenBolnaModal}
              title="Bolna AI Integration & Outbound Calling Setup"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Bolna AI Demo</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentLanguage === 'en'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentLanguage === 'hi'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('te')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentLanguage === 'te'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Primary Voice Call Button */}
            <button
              onClick={onOpenVoiceModal}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">Start Voice Call</span>
              <span className="sm:hidden">Call AI</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-100 no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'landing' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'voice' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Voice Receptionist
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'book' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'doctors' ? 'bg-teal-600 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Admin Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};
