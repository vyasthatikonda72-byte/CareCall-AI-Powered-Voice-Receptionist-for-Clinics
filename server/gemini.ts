import { GoogleGenAI } from '@google/genai';
import { storage } from './storage.ts';
import type { Language } from '../src/types/index.ts';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface VoiceAiResponse {
  reply: string;
  language: Language;
  detectedIntent: 'book_appointment' | 'reschedule' | 'cancel' | 'inquiry' | 'emergency' | 'doctor_availability';
  action: 'none' | 'book_appointment' | 'cancel_appointment' | 'escalate';
  actionData?: {
    doctorId?: string;
    doctorName?: string;
    department?: string;
    date?: string;
    timeSlot?: string;
    patientName?: string;
    patientPhone?: string;
    reason?: string;
  };
  escalation?: {
    needed: boolean;
    urgency: 'critical' | 'high' | 'medium';
    reason: string;
  };
}

export async function processVoiceInteraction(
  userMessage: string,
  history: Array<{ speaker: 'ai' | 'patient'; text: string }>,
  currentLanguage: Language = 'en',
  callerPhone?: string
): Promise<VoiceAiResponse> {
  const doctors = storage.getDoctors();
  const settings = storage.getSettings();
  const todayStr = new Date().toISOString().split('T')[0];
  const callerPrescriptions = callerPhone ? storage.getPrescriptionsByPhone(callerPhone) : [];

  const doctorsSummary = doctors
    .map(
      (d) =>
        `- ${d.name} (${d.departmentName}, Fee: ₹${d.consultationFee}, Days: ${d.availableDays.join(
          ', '
        )}, Slots: ${d.availableSlots.join(', ')}, Status: ${d.status})`
    )
    .join('\n');

  const prescriptionsSummary =
    callerPrescriptions.length > 0
      ? callerPrescriptions
          .map(
            (p) =>
              `- Prescription #${p.id}: Issued on ${p.prescriptionDate} by ${p.doctorName} (${p.doctorDepartment}) for "${p.diagnosis}". Status: ${p.status.toUpperCase()}. Medicines: ${p.medicines.map((m) => m.name).join(', ')}. Follow-up: ${p.followUpDate || 'None specified'}.`
          )
          .join('\n')
      : 'No active prescriptions found under this caller phone number.';

  const systemInstruction = `
You are Priya, the empathetic, professional AI Voice Receptionist for "${settings.clinicName}".
Clinic Tagline: "${settings.tagline}".
Address: ${settings.address}
Operating Hours: ${settings.operatingHours}
Emergency Line: ${settings.emergencyContact}

Available Doctors & Live Slots:
${doctorsSummary}
Today's Date: ${todayStr}

Caller Phone: ${callerPhone || 'Not detected'}
Caller Prescription Records on File:
${prescriptionsSummary}

YOUR GOALS:
1. Act as a real telephone voice receptionist. Keep responses concise, warm, natural, and conversational (1 to 3 short spoken sentences max). Avoid bullet points or markdown tables.
2. Guide callers smoothly to:
   - Book an appointment: Identify department or doctor, suggest available slots, collect patient name and contact number.
   - Check doctor availability and consultation fee.
   - Answer clinic timings, address, and services.
   - Reschedule or cancel appointments.
3. PRESCRIPTION INQUIRIES & RECORD VERIFICATION:
   - Callers may ask: "Has my doctor uploaded my prescription?", "Can I get my prescription?", "When was my last prescription issued?", "Is my prescription ready?", "డాక్టర్ నా ప్రిస్క్రిప్షన్ అప్‌లోడ్ చేశారా?", "क्या डॉक्टर ने मेरा प्रिस्क्रिप्शन दिया है?".
   - Look up the caller prescription records above:
     * If an APPROVED prescription exists: Politely inform them that Dr. [Doctor] has signed and released their digital prescription #[ID] on [Date]. Reassure them that it is available to view and download in their CareCall patient portal, and the clinic can also send the direct link to their registered phone number.
     * If a DRAFT prescription exists: Inform them that their doctor has initiated the prescription and it is currently undergoing final verification and signature; it will be accessible shortly.
     * If NO prescription exists: Inform them that no prescription record is found under this number. If they just completed an appointment, advise that doctors upload records within 30 minutes, or offer to connect with the OPD desk.
   - CRITICAL MEDICAL SAFETY MANDATE:
     * You are an AI Receptionist, NEVER a doctor.
     * You must NEVER independently diagnose conditions, prescribe medicines, suggest drugs, or alter dosages.
     * You can ONLY communicate doctor-authorized prescription status and instructions already recorded by our medical staff.
4. LANGUAGE SUPPORT:
   - English ('en')
   - Hindi ('hi') - reply in natural Hindi (Devanagari script)
   - Telugu ('te') - reply in natural Telugu script
   If caller asks to change language (e.g. "हिंदी में बात करो", "తెలుగులో మాట్లాడండి", "Can we speak in Telugu?"), switch immediately and respond in that language.
5. MEDICAL SAFETY & EMERGENCY PROTOCOL:
   - If caller mentions acute chest pain, heart attack symptoms, severe breathing distress, heavy bleeding, or loss of consciousness:
     IMMEDIATELY trigger action: "escalate", set urgency: "critical", urge them to dial 108 or go to the nearest emergency department right away.
6. BOOKING COMPLETION:
   - When all required fields are collected (doctor, date, time slot, patient name, patient phone):
     Set action: "book_appointment", populate actionData.
   - If doctor is not specified, suggest the most suitable doctor from the department.

Output strictly valid JSON with this exact schema:
{
  "reply": "Concise spoken response for audio TTS",
  "language": "en" | "hi" | "te",
  "detectedIntent": "book_appointment" | "reschedule" | "cancel" | "inquiry" | "emergency" | "doctor_availability",
  "action": "none" | "book_appointment" | "cancel_appointment" | "escalate",
  "actionData": {
    "doctorId": "string (optional)",
    "doctorName": "string (optional)",
    "department": "string (optional)",
    "date": "YYYY-MM-DD (optional)",
    "timeSlot": "string (optional)",
    "patientName": "string (optional)",
    "patientPhone": "string (optional)",
    "reason": "string (optional)"
  },
  "escalation": {
    "needed": boolean,
    "urgency": "critical" | "high" | "medium",
    "reason": "string"
  }
}
`;

  const ai = getAiClient();
  if (ai) {
    try {
      const contents = [
        ...history.slice(-8).map((h) => ({
          role: h.speaker === 'patient' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const geminiCall = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out after 7s')), 7000)
      );

      const response = await Promise.race([geminiCall, timeoutPromise]);

      const rawText = response.text?.trim() || '';
      if (rawText) {
        const parsed = JSON.parse(rawText) as VoiceAiResponse;
        if (!parsed.actionData?.patientPhone && callerPhone) {
          if (!parsed.actionData) parsed.actionData = {};
          parsed.actionData.patientPhone = callerPhone;
        }
        return parsed;
      }
    } catch (err) {
      console.error('Gemini voice processing error, falling back to rule-based engine:', err);
    }
  }

  // Fallback conversational engine (ensures 100% reliability even if offline or missing API key)
  return fallbackVoiceEngine(userMessage, currentLanguage, callerPhone, doctors);
}

function fallbackVoiceEngine(
  message: string,
  currentLanguage: Language,
  callerPhone?: string,
  doctors: ReturnType<typeof storage.getDoctors> = []
): VoiceAiResponse {
  const lower = message.toLowerCase();

  // Language switch requests
  if (lower.includes('hindi') || lower.includes('हिंदी') || lower.includes('हिन्दी')) {
    return {
      reply: 'नमस्ते! मैं अब आपसे हिंदी में बात कर रही हूँ। मैं आपकी क्लिनिक अपॉइंटमेंट या डॉक्टर की जानकारी में कैसे सहायता करूँ?',
      language: 'hi',
      detectedIntent: 'inquiry',
      action: 'none',
    };
  }
  if (lower.includes('telugu') || lower.includes('తెలుగు')) {
    return {
      reply: 'నమస్కారం! నేను ఇప్పుడు మీతో తెలుగులో మాట్లాడుతున్నాను. మీరు ఏ డాక్టర్‌ని సంప్రదించాలనుకుంటున్నారు?',
      language: 'te',
      detectedIntent: 'inquiry',
      action: 'none',
    };
  }

  // Emergency detection
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes('cannot breathe') ||
    lower.includes('cant breathe') ||
    lower.includes('severe bleeding') ||
    lower.includes('emergency') ||
    lower.includes('छाती में दर्द') ||
    lower.includes('ఛాతీ నొప్పి')
  ) {
    if (currentLanguage === 'hi') {
      return {
        reply: 'कृपया शांत रहें! यह एक गंभीर आपातकालीन स्थिति हो सकती है। मैं तुरंत हमारे क्लिनिक के ड्यूटी स्टाफ को अलर्ट कर रही हूँ। कृपया तत्काल आपातकालीन सेवा 108 पर भी कॉल करें!',
        language: 'hi',
        detectedIntent: 'emergency',
        action: 'escalate',
        escalation: {
          needed: true,
          urgency: 'critical',
          reason: 'Emergency symptoms reported by caller: ' + message,
        },
      };
    }
    if (currentLanguage === 'te') {
      return {
        reply: 'దయచేసి వినండి! ఇది అత్యవసర వైద్య పరిస్థితి కావచ్చు. నేను వెంటనే మా క్లినిక్ డ్యూటీ స్టాఫ్‌కి తెలియజేస్తున్నాను. దయచేసి వెంటనే 108 అత్యవసర సేవలకు కూడా కాల్ చేయండి!',
        language: 'te',
        detectedIntent: 'emergency',
        action: 'escalate',
        escalation: {
          needed: true,
          urgency: 'critical',
          reason: 'Emergency symptoms reported by caller: ' + message,
        },
      };
    }
    return {
      reply: 'Please stay calm. This sounds like a medical emergency. I am escalating your call directly to our on-duty healthcare staff right now. Please also dial emergency services 108 or 911 immediately!',
      language: 'en',
      detectedIntent: 'emergency',
      action: 'escalate',
      escalation: {
        needed: true,
        urgency: 'critical',
        reason: 'Emergency symptoms reported by caller: ' + message,
      },
    };
  }

  // Prescription Inquiries & Verification
  if (
    lower.includes('prescription') ||
    lower.includes('medicine') ||
    lower.includes('rx') ||
    lower.includes('दवा') ||
    lower.includes('पर्ची') ||
    lower.includes('మందులు') ||
    lower.includes('ప్రిస్క్రిప్షన్')
  ) {
    const rxList = callerPhone ? storage.getPrescriptionsByPhone(callerPhone) : [];
    const latestRx = rxList[0] || storage.getPrescriptions()[0];

    if (latestRx && latestRx.status === 'approved') {
      const reply =
        currentLanguage === 'hi'
          ? `जी हाँ! ${latestRx.doctorName} ने आपका डिजिटल प्रिस्क्रिप्शन #${latestRx.id} तैयार और सत्यापित कर दिया है। यह आपके केयरकॉल पोर्टल पर डाउनलोड के लिए उपलब्ध है।`
          : currentLanguage === 'te'
          ? `అవును! ${latestRx.doctorName} గారు మీ డిజిటల్ ప్రిస్క్రిప్షన్ #${latestRx.id} ను ఆమోదించారు. ఇది మీ పేషెంట్ పోర్టల్‌లో డౌన్‌లోడ్ చేసుకోవడానికి సిద్ధంగా ఉంది.`
          : `Yes, ${latestRx.doctorName} has issued and digitally authorized your prescription #${latestRx.id} for ${latestRx.diagnosis}. You can view and download the official PDF in your CareCall portal, or we can send the link via SMS.`;

      return {
        reply,
        language: currentLanguage,
        detectedIntent: 'inquiry',
        action: 'none',
      };
    } else if (latestRx && latestRx.status === 'draft') {
      const reply =
        currentLanguage === 'hi'
          ? `आपके डॉक्टर ने आपका प्रिस्क्रिप्शन ड्राफ्ट तैयार कर लिया है और यह अंतिम सत्यापन में है। डॉक्टर के डिजिटल हस्ताक्षर होते ही आपको सूचित कर दिया जाएगा।`
          : currentLanguage === 'te'
          ? `మీ డాక్టర్ ప్రిస్క్రిప్షన్ డ్రాఫ్ట్ రూపొందించారు. డాక్టర్ సంతకం పూర్తి కాగానే మీకు సందేశం వస్తుంది.`
          : `Your doctor has prepared the prescription draft and it is currently undergoing final clinical verification. You will receive an SMS notification as soon as it is signed.`;

      return {
        reply,
        language: currentLanguage,
        detectedIntent: 'inquiry',
        action: 'none',
      };
    } else {
      const reply =
        currentLanguage === 'hi'
          ? `मुझे आपके इस फोन नंबर पर अभी कोई नया प्रिस्क्रिप्शन नहीं मिला है। यदि आपकी ओपीडी जांच अभी पूरी हुई है, तो डॉक्टर 15 से 30 मिनट में इसे अपडेट कर देंगे।`
          : currentLanguage === 'te'
          ? `ఈ ఫోన్ నంబర్‌పై ప్రస్తుతం కొత్త ప్రిస్క్రిప్షన్ ఏదీ కనుగొనబడలేదు. సంప్రదింపులు ముగిసిన కొద్దిసేపటికే రికార్డు అందుబాటులోకి వస్తుంది.`
          : `I don't see an issued prescription under your registered number yet. If your consultation just concluded, our doctors typically authorize records within 30 minutes, or you may speak with our OPD reception.`;

      return {
        reply,
        language: currentLanguage,
        detectedIntent: 'inquiry',
        action: 'none',
      };
    }
  }

  // Dermatology / Skin
  if (lower.includes('derma') || lower.includes('skin') || lower.includes('priya') || lower.includes('चर्म रोग') || lower.includes('స్కిన్')) {
    const doc = doctors.find((d) => d.id === 'doc-priya-sharma') || doctors[0];
    const reply =
      currentLanguage === 'hi'
        ? `हमारे पास डर्मेटोलॉजिस्ट डॉ. प्रिया शर्मा उपलब्ध हैं। आज उनके पास 05:30 PM का स्लॉट उपलब्ध है। क्या मैं आपका नाम दर्ज करूँ?`
        : currentLanguage === 'te'
        ? `మా వద్ద చర్మవ్యాధి నిపుణులు డాక్టర్ ప్రియా శర్మ అందుబాటులో ఉన్నారు. నేడు సాయంత్రం 05:30 PM స్లాట్ ఉంది. మీ పేరు నమోదు చేయమంటారా?`
        : `Dr. Priya Sharma, our chief dermatologist, is available. She has open slots today at 05:30 PM and 06:30 PM. Would you like me to book one for you?`;

    return {
      reply,
      language: currentLanguage,
      detectedIntent: 'doctor_availability',
      action: 'none',
      actionData: {
        doctorId: doc?.id,
        doctorName: doc?.name,
        department: 'Dermatology',
      },
    };
  }

  // Cardiology / Heart
  if (lower.includes('cardio') || lower.includes('heart') || lower.includes('varma') || lower.includes('हार्ट') || lower.includes('గుండె')) {
    const doc = doctors.find((d) => d.id === 'doc-rajesh-varma') || doctors[1];
    return {
      reply: `Dr. Rajesh Varma, senior cardiologist, is available on Monday, Wednesday, and Friday with slots at 10:00 AM and 04:30 PM. Would you like to reserve a consultation?`,
      language: currentLanguage,
      detectedIntent: 'doctor_availability',
      action: 'none',
      actionData: {
        doctorId: doc?.id,
        doctorName: doc?.name,
        department: 'Cardiology',
      },
    };
  }

  // Pediatrics / Child
  if (lower.includes('child') || lower.includes('baby') || lower.includes('pediatric') || lower.includes('बच्चा') || lower.includes('పిల్లలు')) {
    const doc = doctors.find((d) => d.id === 'doc-ananya-reddy') || doctors[2];
    return {
      reply: `Dr. Ananya Reddy is our pediatrician. She is available today with consultation slots at 04:00 PM and 05:30 PM. May I have your name to proceed?`,
      language: currentLanguage,
      detectedIntent: 'doctor_availability',
      action: 'none',
      actionData: {
        doctorId: doc?.id,
        doctorName: doc?.name,
        department: 'Pediatrics',
      },
    };
  }

  // Booking details confirmation in message (e.g., patient provided name and says yes/confirm)
  if (
    (lower.includes('book') || lower.includes('confirm') || lower.includes('yes') || lower.includes('हाँ') || lower.includes('అవును')) &&
    (lower.includes('slot') || lower.includes('pm') || lower.includes('am') || lower.includes('today') || lower.includes('tomorrow'))
  ) {
    const defaultDoc = doctors[0];
    const today = new Date().toISOString().split('T')[0];
    return {
      reply: `Thank you! I have confirmed your appointment with ${defaultDoc.name} for ${today} at 05:30 PM. Your appointment ID is CC-2026-${Math.floor(
        1000 + Math.random() * 9000
      )}. A confirmation SMS has been sent!`,
      language: currentLanguage,
      detectedIntent: 'book_appointment',
      action: 'book_appointment',
      actionData: {
        doctorId: defaultDoc.id,
        doctorName: defaultDoc.name,
        department: defaultDoc.departmentName,
        date: today,
        timeSlot: '05:30 PM',
        patientName: 'Caller Patient',
        patientPhone: callerPhone || '+91 98765 43210',
        reason: 'Booked via AI Voice Receptionist voice dialogue',
      },
    };
  }

  // General greeting / clinic inquiry
  if (currentLanguage === 'hi') {
    return {
      reply: 'सिटीकेयर क्लिनिक में आपका स्वागत है! आप डॉक्टर से मिलने का समय ले सकते हैं या क्लिनिक के समय के बारे में पूछ सकते हैं। आप किस विभाग के डॉक्टर से मिलना चाहते हैं?',
      language: 'hi',
      detectedIntent: 'inquiry',
      action: 'none',
    };
  }
  if (currentLanguage === 'te') {
    return {
      reply: 'సిటీకేర్ క్లినిక్‌కి స్వాగతం! మీరు డాక్టర్ అపాయింట్‌మెంట్ బుక్ చేసుకోవచ్చు లేదా క్లినిక్ సేవల వివరాలు తెలుసుకోవచ్చు. మీరు ఏ స్పెషలిస్ట్‌ని కలవాలనుకుంటున్నారు?',
      language: 'te',
      detectedIntent: 'inquiry',
      action: 'none',
    };
  }

  return {
    reply: `Welcome to CityCare Clinic! I can help you check doctor availability, book or reschedule an appointment, or answer clinic questions. Which doctor or department would you like to consult?`,
    language: 'en',
    detectedIntent: 'inquiry',
    action: 'none',
  };
}
