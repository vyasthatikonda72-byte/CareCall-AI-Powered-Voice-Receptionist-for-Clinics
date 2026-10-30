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
  MessageSquare,
  Globe,
  X,
} from 'lucide-react';
import { PriyaAvatar } from './PriyaAvatar.tsx';
import type { Language, TranscriptItem, Appointment, Escalation, Doctor } from '../types/index.ts';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from '../utils/voice.ts';
import { sendVoiceInteraction, saveCallRecord } from '../services/api.ts';

interface VoiceReceptionistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: Language;
  onAppointmentBooked?: (appointment: Appointment) => void;
  onViewDashboard?: () => void;
}

export const VoiceReceptionistModal: React.FC<VoiceReceptionistModalProps> = ({
  isOpen,
  onClose,
  initialLanguage = 'en',
  onAppointmentBooked,
  onViewDashboard,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [callerPhone, setCallerPhone] = useState<string>('+91 98765 43210');
  const [callerName, setCallerName] = useState<string>('Patient Caller');

  const [textInput, setTextInput] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [lastBookedApt, setLastBookedApt] = useState<Appointment | null>(null);
  const [lastEscalation, setLastEscalation] = useState<Escalation | null>(null);
  const [callSummary, setCallSummary] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<any>(null);
  const durationRef = useRef<number>(0);

  // Sync initial language
  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  // Scroll to bottom when transcripts update
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, interimTranscript, isProcessing]);

  // Call timer
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

  // Clean up audio & recognition when closing
  useEffect(() => {
    if (!isOpen) {
      handleHangUp(false);
    }
  }, [isOpen]);

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
      return 'నమస్కారం! సిటీకేర్ క్లినిక్‌కి స్వాగతం. నేను మీ వర్చువల్ రిసెప్షనిస్ట్ ప్రియను. మీకు డాక్టర్ అపాయింట్‌మెంట్ కావాలా లేదా ఏదైనా సమాచారం కావాలా?';
    }
    return 'Welcome to CityCare Clinic! I am Priya, your virtual receptionist. How may I assist you with your appointment today?';
  };

  const startCall = (langToUse: Language = language) => {
    setCallActive(true);
    setCallSummary(null);
    setLastBookedApt(null);
    setLastEscalation(null);
    setErrorMsg(null);

    const greetingText = getGreeting(langToUse);
    const initialItem: TranscriptItem = {
      id: `t-${Date.now()}`,
      speaker: 'ai',
      text: greetingText,
      timestamp: '00:01',
      language: langToUse,
    };
    setTranscripts([initialItem]);

    // Speak greeting
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
          console.warn('Speech recognition error:', err);
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
      } catch (e) {
        // ignore
      }
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

    // Add user message to transcript
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

      // Update active language if AI switched
      let targetLang = currentLang;
      if (response.language && response.language !== currentLang) {
        targetLang = response.language;
        setLanguage(targetLang);
      }

      // Add AI reply to transcript
      const aiItem: TranscriptItem = {
        id: `t-${Date.now() + 1}`,
        speaker: 'ai',
        text: response.reply,
        timestamp: formatDuration(durationRef.current),
        language: targetLang,
      };
      setTranscripts((prev) => [...prev, aiItem]);

      // If appointment was booked
      if (response.bookedAppointment) {
        setLastBookedApt(response.bookedAppointment);
        if (onAppointmentBooked) {
          onAppointmentBooked(response.bookedAppointment);
        }
      }

      // If escalated
      if (response.createdEscalation) {
        setLastEscalation(response.createdEscalation);
      }

      // Speak AI response
      if (soundEnabled) {
        setIsAiSpeaking(true);
        speakText(
          response.reply,
          targetLang,
          () => setIsAiSpeaking(true),
          () => {
            setIsAiSpeaking(false);
            // Resume listening after speaking unless user manually hung up
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
      setErrorMsg(err.message || 'Network error interacting with AI');
      const errItem: TranscriptItem = {
        id: `t-${Date.now() + 1}`,
        speaker: 'ai',
        text: 'I apologize, but I had trouble hearing that clearly. Could you please say that once again?',
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
        ? `Appointment successfully booked for ${lastBookedApt.patientName} with ${lastBookedApt.doctorName} at ${lastBookedApt.timeSlot} on ${lastBookedApt.date}. (ID: ${lastBookedApt.id})`
        : lastEscalation
        ? `Call escalated to staff for triage. Reason: ${lastEscalation.reason}`
        : `General patient inquiry resolved via voice assistant in ${language.toUpperCase()}.`;

      setCallSummary(summaryText);

      try {
        await saveCallRecord({
          callerName: lastBookedApt?.patientName || callerName,
          callerPhone,
          timestamp: new Date().toISOString(),
          durationSeconds: Math.max(durationRef.current, 15),
          status: lastEscalation ? 'escalated' : 'completed',
          language,
          intent: lastBookedApt
            ? 'book_appointment'
            : lastEscalation
            ? 'emergency'
            : 'inquiry',
          sentiment: lastEscalation ? 'urgent' : 'positive',
          summary: summaryText,
          appointmentId: lastBookedApt?.id,
          escalatedToStaff: Boolean(lastEscalation),
          escalationReason: lastEscalation?.reason,
          transcripts,
          channel: 'browser_voice',
        });
      } catch (e) {
        console.error('Failed to save call record:', e);
      }
    }
  };

  const switchLanguageMidCall = (newLang: Language) => {
    setLanguage(newLang);
    const switchPrompt =
      newLang === 'hi'
        ? 'Please switch to Hindi'
        : newLang === 'te'
        ? 'Please switch to Telugu'
        : 'Please switch to English';
    handleUserMessage(switchPrompt, newLang);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#102A56] px-6 py-4 text-white flex items-center justify-between border-b border-blue-950">
          <div className="flex items-center space-x-3.5">
            <PriyaAvatar
              size="md"
              isSpeaking={isAiSpeaking}
              isListening={isListening}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white leading-tight">Priya</h3>
                <span className="text-xs text-blue-200 font-medium">AI Receptionist</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0D9488]/30 text-teal-300 border border-teal-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center space-x-2 mt-0.5">
                <span>CityCare Multispecialty Clinic</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  24/7 Voice Line
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (soundEnabled) stopSpeaking();
                setSoundEnabled(!soundEnabled);
              }}
              title={soundEnabled ? 'Mute AI voice' : 'Enable AI voice audio'}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-amber-300" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                handleHangUp(true);
                onClose();
              }}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Call Status & Soundwave Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            {callActive ? (
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Call In Progress
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formatDuration(callDuration)}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-600">Line Ready</span>
              </div>
            )}

            {/* Language Switch Pills */}
            <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 uppercase">Lang:</span>
              <button
                onClick={() => switchLanguageMidCall('en')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  language === 'en' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => switchLanguageMidCall('hi')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  language === 'hi' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => switchLanguageMidCall('te')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  language === 'te' ? 'bg-teal-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>
          </div>

          {/* Soundwave animation indicator */}
          <div className="flex items-center space-x-1.5 h-6">
            {isAiSpeaking ? (
              <>
                <span className="text-xs text-teal-700 font-medium mr-1.5 animate-pulse">AI Speaking...</span>
                <div className="w-1 bg-teal-500 rounded-full animate-wave-1"></div>
                <div className="w-1 bg-cyan-500 rounded-full animate-wave-2"></div>
                <div className="w-1 bg-teal-600 rounded-full animate-wave-3"></div>
                <div className="w-1 bg-cyan-600 rounded-full animate-wave-4"></div>
                <div className="w-1 bg-teal-400 rounded-full animate-wave-5"></div>
              </>
            ) : isListening ? (
              <>
                <span className="text-xs text-emerald-700 font-medium mr-1.5">Listening to you...</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                <div className="w-1 bg-emerald-500 rounded-full animate-wave-2"></div>
                <div className="w-1 bg-emerald-600 rounded-full animate-wave-4"></div>
              </>
            ) : isProcessing ? (
              <span className="text-xs text-amber-700 font-medium flex items-center space-x-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Checking clinic schedule...</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Success alert if appointment booked */}
        {lastBookedApt && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Appointment Confirmed: #{lastBookedApt.id}
                </p>
                <p className="text-xs text-emerald-700">
                  {lastBookedApt.doctorName} • {lastBookedApt.date} at {lastBookedApt.timeSlot}
                </p>
              </div>
            </div>
            {onViewDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onViewDashboard();
                }}
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs"
              >
                <span>View In Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Escalation alert if triggered */}
        {lastEscalation && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-rose-900">
                  Emergency / Staff Escalation Triggered
                </p>
                <p className="text-xs text-rose-700">{lastEscalation.reason}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
              Priority: {lastEscalation.urgency}
            </span>
          </div>
        )}

        {/* Live Conversation Transcripts */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 min-h-[260px] bg-slate-50/50">
          {!callActive && transcripts.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
                <Mic className="w-8 h-8 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-800 text-base">Test the Live AI Voice Receptionist</h4>
                <p className="text-xs text-slate-500">
                  Speak into your microphone in English, Hindi, or Telugu. The virtual receptionist checks doctor availability, prevents double bookings, and books appointments seamlessly.
                </p>
              </div>

              {/* Caller details configure */}
              <div className="max-w-sm mx-auto bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-left">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Simulated Caller Phone:
                </label>
                <input
                  type="text"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                onClick={() => startCall(language)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Call Now</span>
              </button>
            </div>
          ) : (
            <>
              {transcripts.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start space-x-3 ${
                    item.speaker === 'patient' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      item.speaker === 'ai'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {item.speaker === 'ai' ? 'AI' : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                      item.speaker === 'ai'
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        : 'bg-teal-600 text-white rounded-tr-none'
                    }`}
                  >
                    <p className="leading-relaxed">{item.text}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center space-x-1 ${
                        item.speaker === 'ai' ? 'text-slate-400' : 'text-teal-100 justify-end'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Interim user speech */}
              {interimTranscript && (
                <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 text-xs sm:text-sm bg-slate-200 text-slate-600 italic">
                    {interimTranscript}...
                  </div>
                </div>
              )}

              {/* AI typing / thinking indicator */}
              {isProcessing && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </>
          )}
        </div>

        {/* Quick Spoken Prompts & Chips */}
        {callActive && (
          <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center space-x-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">
              Quick Prompts:
            </span>
            <button
              onClick={() =>
                handleUserMessage('I want to book an appointment with Dr. Priya Sharma today evening')
              }
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
            >
              Book Dr. Priya today
            </button>
            <button
              onClick={() => handleUserMessage('क्या डॉ. प्रिया आज उपलब्ध हैं? मुझे हिंदी में बात करनी है')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
            >
              डॉ. प्रिया की जानकारी (हिन्दी)
            </button>
            <button
              onClick={() =>
                handleUserMessage('నాకు గుండె సంబంధిత సమస్య ఉంది, కార్డియాలజిస్ట్ డాక్టర్ కావాలి')
              }
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
            >
              కార్డియాలజిస్ట్ అపాయింట్‌మెంట్ (తెలుగు)
            </button>
            <button
              onClick={() =>
                handleUserMessage('Severe chest pain and heavy breathing, please call emergency staff!')
              }
              className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap font-medium transition-colors"
            >
              🚨 Emergency Triage Test
            </button>
            <button
              onClick={() => handleUserMessage('What are your clinic operating hours and address?')}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap transition-colors"
            >
              Clinic Timings & Address
            </button>
          </div>
        )}

        {/* Post Call Summary Banner if ended */}
        {callSummary && !callActive && (
          <div className="bg-slate-900 text-white px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-teal-400 font-bold">
                  Call Summary & Auto-Logged Record:
                </p>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{callSummary}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Duration: {formatDuration(callDuration)} • Transcripts synced to Admin Dashboard.
                </p>
              </div>
              <button
                onClick={() => startCall(language)}
                className="ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white whitespace-nowrap transition-colors"
              >
                Call Again
              </button>
            </div>
          </div>
        )}

        {/* Footer Voice & Input Controls */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3">
          {callActive ? (
            <div className="space-y-3">
              {/* Voice action row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={isListening ? stopListening : () => startListening(language)}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs animate-pulse'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isListening ? 'Mute Mic' : 'Speak into Mic'}</span>
                  </button>

                  {isAiSpeaking && (
                    <button
                      onClick={interruptAndSpeak}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Interrupt AI</span>
                    </button>
                  )}
                </div>

                {/* Hang Up Button */}
                <button
                  onClick={() => handleHangUp(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </div>

              {/* Text Fallback input */}
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
                  placeholder="Or type what you want to say to Priya..."
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isProcessing}
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Call ended. All transcripts and booked slots are safely saved.
              </span>
              <button
                onClick={() => startCall(language)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start New Call</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
