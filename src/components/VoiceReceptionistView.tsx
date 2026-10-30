import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  Send,
  Globe,
  Stethoscope,
  Shield,
  Activity,
  Headphones,
  History,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language, TranscriptItem, Appointment, Escalation, Doctor, CallRecord } from '../types/index.ts';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from '../utils/voice.ts';
import { sendVoiceInteraction, saveCallRecord, fetchDoctors, fetchCalls } from '../services/api.ts';
import { PriyaAvatar } from './PriyaAvatar.tsx';

interface VoiceReceptionistViewProps {
  initialLanguage?: Language;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onViewDashboard?: () => void;
  onOpenBolnaModal?: () => void;
}

export const VoiceReceptionistView: React.FC<VoiceReceptionistViewProps> = ({
  initialLanguage = 'en',
  onAppointmentBooked,
  onViewDashboard,
  onOpenBolnaModal,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [callerPhone, setCallerPhone] = useState<string>('+91 98490 55432');
  const [callerName, setCallerName] = useState<string>('Rohan Mehra');

  const [textInput, setTextInput] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [lastBookedApt, setLastBookedApt] = useState<Appointment | null>(null);
  const [lastEscalation, setLastEscalation] = useState<Escalation | null>(null);
  const [callSummary, setCallSummary] = useState<string | null>(null);

  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [pastCalls, setPastCalls] = useState<CallRecord[]>([]);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);
  const durationRef = useRef<number>(0);

  useEffect(() => {
    fetchDoctors().then(setDoctorsList).catch(console.error);
    fetchCalls().then(setPastCalls).catch(console.error);
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, interimTranscript, isProcessing]);

  useEffect(() => {
    if (callActive) {
      durationRef.current = 0;
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGreeting = (lang: Language) => {
    if (lang === 'hi') {
      return 'नमस्ते! सिटीकेयर क्लिनिक में आपका स्वागत है। मैं आपकी एआई रिसेप्शनिस्ट प्रिया हूँ। मैं आज आपकी क्या सहायता कर सकती हूँ?';
    }
    if (lang === 'te') {
      return 'నమస్కారం! సిటీకేర్ క్లినిక్‌కి స్వాగతం. నేను మీ వర్చువల్ రిసెప్షనిస్ట్ ప్రియను. మీరు ఏ డాక్టర్‌ని సంప్రదించాలనుకుంటున్నారు?';
    }
    return 'Welcome to CityCare Clinic! I am Priya, your virtual receptionist. How may I assist you with your appointment today?';
  };

  const startCall = (langToUse: Language = language) => {
    setCallActive(true);
    setCallSummary(null);
    setLastBookedApt(null);
    setLastEscalation(null);

    const greetingText = getGreeting(langToUse);
    const initialItem: TranscriptItem = {
      id: `t-${Date.now()}`,
      speaker: 'ai',
      text: greetingText,
      timestamp: '00:01',
      language: langToUse,
    };
    setTranscripts([initialItem]);

    if (soundEnabled) {
      setIsAiSpeaking(true);
      speakText(
        greetingText,
        langToUse,
        () => setIsAiSpeaking(true),
        () => {
          setIsAiSpeaking(false);
          startListening(langToUse);
        }
      );
    } else {
      startListening(langToUse);
    }
  };

  const startListening = (lang: Language = language) => {
    if (!isSpeechRecognitionSupported()) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = createSpeechRecognizer(
        lang,
        (transcript, isFinal) => {
          if (isFinal) {
            setInterimTranscript('');
            handleUserMessage(transcript, lang);
          } else {
            setInterimTranscript(transcript);
          }
        },
        (err) => {
          console.warn('Speech recognition warning:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const interruptAndSpeak = () => {
    stopSpeaking();
    setIsAiSpeaking(false);
    startListening(language);
  };

  const handleUserMessage = async (messageText: string, currentLang: Language = language) => {
    if (!messageText.trim() || isProcessing) return;

    const userItem: TranscriptItem = {
      id: `t-${Date.now()}`,
      speaker: 'patient',
      text: messageText,
      timestamp: formatDuration(durationRef.current),
      language: currentLang,
    };

    const updatedTranscripts = [...transcripts, userItem];
    setTranscripts(updatedTranscripts);
    setTextInput('');
    setInterimTranscript('');
    stopListening();
    setIsProcessing(true);

    try {
      const response = await sendVoiceInteraction({
        message: messageText,
        history: updatedTranscripts.map((t) => ({ speaker: t.speaker, text: t.text })),
        language: currentLang,
        callerPhone,
      });

      let targetLang = currentLang;
      if (response.language && response.language !== currentLang) {
        targetLang = response.language;
        setLanguage(targetLang);
      }

      const aiItem: TranscriptItem = {
        id: `t-${Date.now() + 1}`,
        speaker: 'ai',
        text: response.reply,
        timestamp: formatDuration(durationRef.current),
        language: targetLang,
      };
      setTranscripts((prev) => [...prev, aiItem]);

      if (response.bookedAppointment) {
        setLastBookedApt(response.bookedAppointment);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onAppointmentBooked) {
          onAppointmentBooked(response.bookedAppointment);
        }
      }

      if (response.createdEscalation) {
        setLastEscalation(response.createdEscalation);
      }

      if (soundEnabled) {
        setIsAiSpeaking(true);
        speakText(
          response.reply,
          targetLang,
          () => setIsAiSpeaking(true),
          () => {
            setIsAiSpeaking(false);
            if (callActive) {
              startListening(targetLang);
            }
          }
        );
      } else {
        startListening(targetLang);
      }
    } catch (err: any) {
      console.error('Failed to process message:', err);
      const errItem: TranscriptItem = {
        id: `t-${Date.now() + 1}`,
        speaker: 'ai',
        text: 'I could not process that request clearly. Could you please repeat?',
        timestamp: formatDuration(durationRef.current),
        language: currentLang,
      };
      setTranscripts((prev) => [...prev, errItem]);
      startListening(currentLang);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHangUp = async (saveRecord = true) => {
    stopListening();
    stopSpeaking();
    setIsListening(false);
    setIsAiSpeaking(false);
    setCallActive(false);

    if (saveRecord && transcripts.length > 1) {
      const summaryText = lastBookedApt
        ? `Appointment confirmed with ${lastBookedApt.doctorName} for ${lastBookedApt.date} at ${lastBookedApt.timeSlot}. (Booking ID: ${lastBookedApt.id})`
        : lastEscalation
        ? `Escalated to clinic nurse for urgent evaluation: ${lastEscalation.reason}`
        : `Patient voice call completed in ${language.toUpperCase()}.`;

      setCallSummary(summaryText);

      try {
        const saved = await saveCallRecord({
          callerName: lastBookedApt?.patientName || callerName,
          callerPhone,
          timestamp: new Date().toISOString(),
          durationSeconds: Math.max(durationRef.current, 12),
          status: lastEscalation ? 'escalated' : 'completed',
          language,
          intent: lastBookedApt ? 'book_appointment' : lastEscalation ? 'emergency' : 'inquiry',
          sentiment: lastEscalation ? 'urgent' : 'positive',
          summary: summaryText,
          appointmentId: lastBookedApt?.id,
          escalatedToStaff: Boolean(lastEscalation),
          escalationReason: lastEscalation?.reason,
          transcripts,
          channel: 'browser_voice',
        });

        setPastCalls((prev) => [saved, ...prev]);
      } catch (e) {
        console.error('Failed to save call record:', e);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Voice Hub Header Banner */}
      <div className="rounded-2xl bg-white border border-[#E5EAF2] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-4">
          <PriyaAvatar size="xl" isSpeaking={isAiSpeaking} isListening={isListening} />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-extrabold text-lg text-[#172B4D]">Priya AI Voice Receptionist</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online & Ready</span>
              </span>
              <button
                onClick={onOpenBolnaModal}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                Bolna Telephony: Ready
              </button>
            </div>
            <p className="text-xs text-[#64748B]">
              Primary AI Voice Assistant for CityCare Clinic. Fluent in English, Hindi, and Telugu.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              if (soundEnabled) stopSpeaking();
              setSoundEnabled(!soundEnabled);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center space-x-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-[#F7F9FC] text-[#172B4D] border-[#E5EAF2] hover:bg-slate-100'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#2563EB]" /> : <VolumeX className="w-4 h-4 text-amber-600" />}
            <span>{soundEnabled ? 'Speech Audio On' : 'Muted'}</span>
          </button>

          {!callActive ? (
            <button
              onClick={() => startCall(language)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#0D9488] hover:from-blue-700 hover:to-teal-700 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Connect Live Voice Line</span>
            </button>
          ) : (
            <button
              onClick={() => handleHangUp(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Live Voice Interactive Card + Schedule & Call History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Voice Conversation Box */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5EAF2] shadow-xs overflow-hidden flex flex-col h-[600px]">
            {/* Top Bar of Call Window */}
            <div className="bg-[#102A56] px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs">
                  <PhoneCall className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Live Voice Session with Priya</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-300">
                    {callActive ? (
                      <span className="flex items-center space-x-1.5 text-emerald-300 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Duration: {formatDuration(callDuration)}</span>
                      </span>
                    ) : (
                      <span>Idle • Ready to Connect</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Language Pills in Call Header */}
              <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-0.5 border border-white/15">
                <button
                  onClick={() => {
                    setLanguage('en');
                    if (callActive) handleUserMessage('Please switch conversation to English', 'en');
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('hi');
                    if (callActive) handleUserMessage('कृपया हिंदी में बात करें', 'hi');
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    language === 'hi' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => {
                    setLanguage('te');
                    if (callActive) handleUserMessage('దయచేసి తెలుగులో మాట్లాడండి', 'te');
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    language === 'te' ? 'bg-white text-[#102A56] shadow-xs' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>

            {/* Soundwave Animation Strip */}
            <div className="bg-[#F7F9FC] border-b border-[#E5EAF2] px-5 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[#64748B] font-medium text-[11px]">Status:</span>
                {isAiSpeaking ? (
                  <span className="text-teal-700 font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    <span>AI Speaking Spoken Audio</span>
                  </span>
                ) : isListening ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listening to you... (Speak freely)</span>
                  </span>
                ) : isProcessing ? (
                  <span className="text-amber-700 font-semibold flex items-center space-x-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini 3.8 Flash checking clinic schedule...</span>
                  </span>
                ) : (
                  <span className="text-[#64748B]">Microphone waiting</span>
                )}
              </div>

              {/* 5-bar Waveform */}
              <div className="flex items-center space-x-1 h-5">
                <div
                  className={`w-1 rounded-full bg-[#2563EB] transition-all ${
                    isAiSpeaking || isListening ? 'animate-wave-1' : 'h-1.5'
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-[#0D9488] transition-all ${
                    isAiSpeaking || isListening ? 'animate-wave-2' : 'h-2'
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-cyan-500 transition-all ${
                    isAiSpeaking || isListening ? 'animate-wave-3' : 'h-1.5'
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-indigo-500 transition-all ${
                    isAiSpeaking || isListening ? 'animate-wave-4' : 'h-2.5'
                  }`}
                />
                <div
                  className={`w-1 rounded-full bg-teal-500 transition-all ${
                    isAiSpeaking || isListening ? 'animate-wave-5' : 'h-1'
                  }`}
                />
              </div>
            </div>

            {/* Confirmed Appointment Notification Card */}
            {lastBookedApt && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-900">
                      Confirmed in Database: #{lastBookedApt.id}
                    </span>
                    <p className="text-[11px] text-emerald-700">
                      {lastBookedApt.doctorName} • {lastBookedApt.date} ({lastBookedApt.timeSlot})
                    </p>
                  </div>
                </div>
                {onViewDashboard && (
                  <button
                    onClick={onViewDashboard}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs hover:bg-emerald-50 cursor-pointer"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Conversation Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#F7F9FC]/60">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <PriyaAvatar size="xl" showBadge={false} />
                  <div className="max-w-md">
                    <h5 className="font-bold text-sm text-[#172B4D]">Priya is Standing By</h5>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                      Press <strong>Connect Live Voice Line</strong> to begin talking naturally in English, Hindi, or Telugu. Priya checks real doctor availability, books slots, and resolves clinic inquiries.
                    </p>
                  </div>
                  <button
                    onClick={() => startCall(language)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Connect Now</span>
                  </button>
                </div>
              ) : (
                <>
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`flex items-start space-x-2.5 ${
                        t.speaker === 'patient' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          t.speaker === 'ai' ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-[#102A56] text-white'
                        }`}
                      >
                        {t.speaker === 'ai' ? 'AI' : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                          t.speaker === 'ai'
                            ? 'bg-white text-[#172B4D] border border-[#E5EAF2] rounded-tl-none'
                            : 'bg-[#2563EB] text-white rounded-tr-none'
                        }`}
                      >
                        <p className="leading-relaxed">{t.text}</p>
                        <div
                          className={`text-[10px] mt-1 flex items-center space-x-1 ${
                            t.speaker === 'ai' ? 'text-[#64748B]' : 'text-blue-100 justify-end'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>{t.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {interimTranscript && (
                    <div className="flex items-start space-x-2.5 flex-row-reverse space-x-reverse">
                      <div className="w-7 h-7 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 text-xs bg-slate-200 text-slate-600 italic">
                        {interimTranscript}...
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex items-start space-x-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        AI
                      </div>
                      <div className="bg-white border border-[#E5EAF2] rounded-2xl rounded-tl-none px-4 py-2 shadow-xs flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={transcriptEndRef} />
                </>
              )}
            </div>

            {/* Quick Spoken Prompts */}
            {callActive && (
              <div className="px-4 py-2 bg-[#F7F9FC] border-t border-[#E5EAF2] overflow-x-auto no-scrollbar flex items-center space-x-2 text-xs">
                <span className="text-[10px] font-bold uppercase text-[#64748B] whitespace-nowrap">
                  Click to speak:
                </span>
                <button
                  onClick={() =>
                    handleUserMessage('I want to book an appointment with Dr. Priya Sharma today')
                  }
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-[#172B4D] border border-[#E5EAF2] whitespace-nowrap transition-colors cursor-pointer"
                >
                  Book Dr. Priya today
                </button>
                <button
                  onClick={() => handleUserMessage('डॉ. प्रिया से मिलने का समय क्या है? (Hindi)')}
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-[#172B4D] border border-[#E5EAF2] whitespace-nowrap transition-colors cursor-pointer"
                >
                  डॉ. प्रिया का समय
                </button>
                <button
                  onClick={() =>
                    handleUserMessage('నాకు డాక్టర్ రాజేష్ వర్మ గారి అపాయింట్‌మెంట్ కావాలి (Telugu)')
                  }
                  className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-[#172B4D] border border-[#E5EAF2] whitespace-nowrap transition-colors cursor-pointer"
                >
                  కార్డియాలజిస్ట్ అపాయింట్‌మెంట్
                </button>
                <button
                  onClick={() =>
                    handleUserMessage('Severe chest pain and heavy breathing, please call emergency staff!')
                  }
                  className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap font-medium hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  🚨 Emergency Chest Pain Test
                </button>
              </div>
            )}

            {/* Controls bottom row */}
            <div className="bg-white border-t border-[#E5EAF2] p-3 sm:p-4">
              {callActive ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={isListening ? stopListening : () => startListening(language)}
                        className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        <span>{isListening ? 'Mute Mic' : 'Speak'}</span>
                      </button>

                      {isAiSpeaking && (
                        <button
                          onClick={interruptAndSpeak}
                          className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Interrupt AI</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleHangUp(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>End Call</span>
                    </button>
                  </div>

                  {/* Fallback Text Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (textInput.trim()) {
                        handleUserMessage(textInput, language);
                      }
                    }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Or type your message here..."
                      className="flex-1 px-3 py-1.5 text-xs bg-[#F7F9FC] border border-[#E5EAF2] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                    <button
                      type="submit"
                      disabled={!textInput.trim() || isProcessing}
                      className="p-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B]">
                    {callSummary ? 'Conversation recorded and synced.' : 'Ready to start live test.'}
                  </span>
                  <button
                    onClick={() => startCall(language)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 shadow-xs cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Connect Call</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Schedule, Past Calls & Human Handoff */}
        <div className="space-y-4">
          {/* Medical Safety Card */}
          <div className="bg-gradient-to-br from-blue-50/70 to-teal-50/70 rounded-2xl p-4 border border-blue-100 shadow-xs space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 text-[#2563EB] font-bold uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4" />
              <span>Medical Triage Safeguards</span>
            </div>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Priya never diagnoses illnesses or prescribes drugs. For emergencies, she directs patients to dial 108 / 911 immediately and alerts clinic staff.
            </p>
          </div>

          {/* Past Voice Calls Log List */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5EAF2]">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Recent Voice Sessions</span>
              </h5>
              <span className="text-[10px] text-[#64748B] font-mono">{pastCalls.length} logged</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {pastCalls.slice(0, 4).map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172B4D]">{c.callerName}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">{c.durationSeconds}s</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] line-clamp-1">{c.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Schedule Overview */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-xs space-y-2.5">
            <h5 className="font-bold text-xs uppercase tracking-wider text-[#172B4D] flex items-center space-x-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Live Available Doctors</span>
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {doctorsList.slice(0, 4).map((doc) => (
                <div key={doc.id} className="p-2 rounded-xl bg-[#F7F9FC] border border-[#E5EAF2] flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#172B4D] block">{doc.name}</span>
                    <span className="text-[10px] text-teal-700 font-medium">{doc.departmentName}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      doc.status === 'available'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {doc.status === 'available' ? 'Available' : 'In Consult'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
