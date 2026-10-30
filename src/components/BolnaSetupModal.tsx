import React, { useState, useEffect } from 'react';
import {
  BellRing,
  PhoneCall,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Info,
  X,
  Play,
  RefreshCw,
} from 'lucide-react';
import type { ClinicSettings } from '../types/index.ts';
import { fetchSettings, updateSettings, triggerBolnaPhoneCall } from '../services/api.ts';

interface BolnaSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BolnaSetupModal: React.FC<BolnaSetupModalProps> = ({ isOpen, onClose }) => {
  const [settings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [agentId, setAgentId] = useState<string>('');
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('+91 98490 12345');
  const [patientName, setPatientName] = useState<string>('Rohan Mehra');

  const [saving, setSaving] = useState<boolean>(false);
  const [calling, setCalling] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isDemoCall, setIsDemoCall] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      fetchSettings().then((s) => {
        setClinicSettings(s);
        setApiKey(s.bolnaApiKey || '');
        setAgentId(s.bolnaAgentId || '');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCredentials = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings({
        bolnaApiKey: apiKey.trim(),
        bolnaAgentId: agentId.trim(),
      });
      setClinicSettings(updated);
      setResultMessage('Bolna credentials saved successfully!');
    } catch (e: any) {
      setResultMessage(`Error saving credentials: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerTestCall = async () => {
    setCalling(true);
    setResultMessage(null);
    try {
      const res = await triggerBolnaPhoneCall({
        recipientPhoneNumber: testPhoneNumber,
        patientName,
        doctorName: 'Dr. Priya Sharma',
        appointmentDate: 'Tomorrow',
        appointmentTime: '10:00 AM',
        callType: 'reminder',
      });

      setIsDemoCall(res.isDemoMode);
      setResultMessage(res.message);
    } catch (err: any) {
      setResultMessage(`Call failed: ${err.message}`);
    } finally {
      setCalling(false);
    }
  };

  const hasConfiguredCredentials = Boolean(apiKey && agentId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BellRing className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Bolna AI Phone Calling Integration</h3>
              <p className="text-xs text-amber-100">Outbound Voice Calls & Telephone Automation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasConfiguredCredentials ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-bold text-slate-800">
              {hasConfiguredCredentials
                ? 'Status: Live Bolna Credentials Connected'
                : 'Status: Interactive Demo Mode (Simulated Phone Calls)'}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              hasConfiguredCredentials
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {hasConfiguredCredentials ? 'Live Mode' : 'Demo Mode'}
          </span>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Explanation Banner */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-amber-900">
              <Info className="w-4 h-4 text-amber-700" />
              <span>How CareCall Uses Bolna AI</span>
            </div>
            <p className="leading-relaxed">
              CareCall natively supports <strong>Bolna AI</strong> (
              <a
                href="https://bolna.dev"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
              >
                bolna.dev
              </a>
              ) to power actual telephone calls for outbound appointment reminder calls, patient confirmations, and live IVR telephone numbers.
            </p>
            <p className="leading-relaxed">
              When credentials are not entered, the application runs in <strong>Demo Mode</strong>, providing full browser-based voice synthesis, transcripts, and simulated outbound triggers so you can test all clinic workflows without an external phone bill.
            </p>
          </div>

          {/* Result toast */}
          {resultMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-start space-x-2 ${
                isDemoCall
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{resultMessage}</span>
            </div>
          )}

          {/* Test Call Trigger */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>Test Outbound Reminder Call</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Recipient Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Recipient Phone Number
                </label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <button
              onClick={handleTriggerTestCall}
              disabled={calling}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              {calling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting Outbound Call...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Trigger Outbound Call ({hasConfiguredCredentials ? 'Real Phone' : 'Demo Simulation'})</span>
                </>
              )}
            </button>
          </div>

          {/* API Configuration Form */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Key className="w-4 h-4 text-slate-600" />
                <span>Bolna Production Credentials</span>
              </h4>
              <a
                href="https://bolna.dev"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-teal-700 font-semibold flex items-center space-x-1 hover:underline"
              >
                <span>Get Bolna Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bolna API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="bolna_live_api_..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bolna Agent ID
              </label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="agent_xxxxxxxx-xxxx-xxxx"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono bg-white"
              />
            </div>

            <button
              onClick={handleSaveCredentials}
              disabled={saving}
              className="w-full py-2 rounded-lg font-bold text-xs text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Bolna Configuration'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
