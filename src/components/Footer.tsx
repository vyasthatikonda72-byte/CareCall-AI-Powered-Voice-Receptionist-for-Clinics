import React from 'react';
import { PhoneCall, ShieldAlert, Heart, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'landing' | 'voice' | 'book' | 'doctors' | 'admin') => void;
  onOpenVoiceModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenVoiceModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Medical Safety Disclaimer Banner */}
      <div className="bg-rose-950/60 border-b border-rose-900/50 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 text-rose-300 text-center text-[11px] sm:text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            <strong>Emergency Notice:</strong> CareCall is an appointment receptionist. For acute chest pain, trauma, difficulty breathing, or severe emergencies, immediately dial <strong>108 (India)</strong> or <strong>911 (US)</strong>.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <PhoneCall className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                Care<span className="text-teal-400">Call</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered virtual receptionist for hospitals and clinics. Tagline: <em>"Your Clinic Never Misses a Call."</em>
            </p>
            <div className="text-[11px] text-teal-400 flex items-center space-x-1.5 font-medium">
              <Globe className="w-3.5 h-3.5" />
              <span>English • हिन्दी • తెలుగు</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('landing')}
                  className="hover:text-white transition-colors"
                >
                  Overview & Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('voice')}
                  className="hover:text-white transition-colors"
                >
                  Voice Receptionist Console
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('book')}
                  className="hover:text-white transition-colors"
                >
                  Online Appointment Booking
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="hover:text-white transition-colors"
                >
                  Doctor Availability Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white transition-colors"
                >
                  Clinic Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Clinical Integrations */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Integrations</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300">Bolna AI Phone Telephony</span>
              </li>
              <li>
                <span className="text-slate-300">Gemini 3.8 Flash AI Model</span>
              </li>
              <li>
                <span className="text-slate-300">Web Speech API (Browser Voice)</span>
              </li>
              <li>
                <span className="text-slate-300">SMS & WhatsApp Reminders</span>
              </li>
              <li>
                <span className="text-slate-300">Conflict-Free Clinic Database</span>
              </li>
            </ul>
          </div>

          {/* Clinic Hours & Contact */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">CityCare Clinic</h4>
            <p className="text-slate-400 text-xs mb-2 leading-relaxed">
              104 Healthcare Blvd, Jubilee Hills, Hyderabad 500033
            </p>
            <p className="text-slate-400 text-xs mb-3">
              OPD Timings: Mon - Sat: 8:00 AM - 8:30 PM
            </p>
            <button
              onClick={onOpenVoiceModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800 hover:bg-teal-900 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Virtual Receptionist</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} CareCall. All rights reserved. Confidential Healthcare SaaS.</p>
          <p className="flex items-center space-x-1">
            <span>Built for clinic staff and patients with care</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
