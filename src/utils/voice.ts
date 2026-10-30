import type { Language } from '../types/index.ts';

// Type declaration for browser SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export function createSpeechRecognizer(
  language: Language,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (err: any) => void,
  onEnd: () => void
) {
  if (!isSpeechRecognitionSupported()) {
    onError(new Error('Speech recognition is not supported in this browser. You can still type responses!'));
    return null;
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();

  // Language mapping
  const langMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
  };

  recognition.lang = langMap[language] || 'en-IN';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final += event.results[i][0].transcript;
      } else {
        interim += event.results[i][0].transcript;
      }
    }

    if (final) {
      onResult(final.trim(), true);
    } else if (interim) {
      onResult(interim.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      onError(event);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

export function speakText(
  text: string,
  language: Language,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const langMap: Record<Language, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    te: 'te-IN',
  };
  utterance.lang = langMap[language] || 'en-IN';
  utterance.rate = 1.0;
  utterance.pitch = 1.05; // Friendly warm receptionist tone

  const voices = window.speechSynthesis.getVoices();
  let chosenVoice = null;

  if (language === 'hi') {
    chosenVoice = voices.find((v) => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
  } else if (language === 'te') {
    chosenVoice =
      voices.find((v) => v.lang.includes('te') || v.name.toLowerCase().includes('telugu')) ||
      voices.find((v) => v.lang.includes('hi')) ||
      voices.find((v) => v.lang.includes('en-IN'));
  } else {
    chosenVoice =
      voices.find((v) => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices.find((v) => v.lang.includes('en-US') && v.name.toLowerCase().includes('female')) ||
      voices.find((v) => v.lang.startsWith('en'));
  }

  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}
