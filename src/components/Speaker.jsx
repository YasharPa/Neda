import { useRef, useState, useSyncExternalStore } from "react";

// קצב הקראה מעט איטי מהרגיל, כדי שיהיה קל לשמוע את ההגייה
const SPEECH_RATE = 0.85;
// מגבלת האורך של שירות ההקראה של Google Translate
const GOOGLE_TTS_MAX_LENGTH = 200;

const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

// ─── קולות: מטמון משותף לכל הרמקולים באפליקציה ──────────────────────────────

const voiceCache = new Map();
const voiceListeners = new Set();
let voicesVersion = 0;

if (hasSpeechSynthesis) {
  // רשימת הקולות נטענת אצל חלק מהדפדפנים רק אחרי voiceschanged
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    voiceCache.clear();
    voicesVersion += 1;
    voiceListeners.forEach((listener) => listener());
  });
}

const subscribeToVoices = (listener) => {
  voiceListeners.add(listener);
  return () => voiceListeners.delete(listener);
};

const getVoicesVersion = () => voicesVersion;

// בחירת קול לשפה – עדיפות לקול של Google אם קיים במכשיר
const findVoice = (lang) => {
  if (!hasSpeechSynthesis) return null;
  if (voiceCache.has(lang)) return voiceCache.get(lang);

  const prefix = lang.slice(0, 2);
  const voices = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith(prefix) || (prefix === "he" && v.lang.startsWith("iw")));
  const voice = voices.find((v) => /google/i.test(v.name)) || voices[0] || null;

  // שומרים גם "אין קול" – המטמון מתרוקן ב-voiceschanged אם קולות נטענים מאוחר יותר
  voiceCache.set(lang, voice);
  return voice;
};

const useVoice = (lang) => {
  useSyncExternalStore(subscribeToVoices, getVoicesVersion);
  return findVoice(lang);
};

// ─── ניגון: רק הקראה אחת בכל רגע ─────────────────────────────────────────────

let currentAudio = null;
let finishCurrent = null;

const stopAll = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (hasSpeechSynthesis) window.speechSynthesis.cancel();
  finishCurrent?.();
  finishCurrent = null;
};

// גיבוי: הקראה דרך Google Translate כשאין במכשיר קול עברי
const playGoogleTTS = (text, lang, rate, onEnd) => {
  if (text.length > GOOGLE_TTS_MAX_LENGTH) {
    onEnd();
    return;
  }
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang.slice(0, 2)}&q=${encodeURIComponent(text)}`;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.playbackRate = rate;
  audio.onended = onEnd;
  audio.onerror = onEnd;
  audio.play().catch(onEnd);
};

export default function Speaker({ text, lang = "he-IL", size = "medium", rate = SPEECH_RATE, label }) {
  const [speaking, setSpeaking] = useState(false);
  const playIdRef = useRef(0);
  const voice = useVoice(lang);
  const disabled = lang === "fa-IR";

  const handleSpeak = (event) => {
    if (!text || disabled) return;
    event.stopPropagation();
    // אחרי לחיצת עכבר/מגע משחררים את הפוקוס, כדי שקיצורי המקלדת ימשיכו לעבוד
    if (event.detail > 0) event.currentTarget.blur();
    stopAll();

    // רק סיום של ההקראה האחרונה מכבה את המצב – ביטול של הקראה קודמת לא
    const playId = ++playIdRef.current;
    const done = () => {
      if (playIdRef.current === playId) setSpeaking(false);
    };
    finishCurrent = done;
    setSpeaking(true);

    if (!voice) {
      playGoogleTTS(text, lang, rate, done);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.voice = voice;
    utterance.rate = rate;
    utterance.onend = done;
    utterance.onerror = done;

    window.speechSynthesis.speak(utterance);
  };

  const btnClasses = disabled 
    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50" 
    : speaking 
      ? "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 shadow-inner scale-95" 
      : "bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-500 dark:hover:text-brand-400 hover:shadow-md hover:-translate-y-0.5";

  return (
    <button
      onClick={handleSpeak}
      // לחיצה על הרמקול לא מתחילה גרירה של כרטיס
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      className={`${size === "small" ? "w-8 h-8" : "w-10 h-10"} shrink-0 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 transition-all duration-300 ${btnClasses}`}
      aria-label={label || "הקרא טקסט"}
      title={label}
    >
      {speaking ? (
        <svg
          className="w-5 h-5 animate-pulse"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.45-.5 8-4.27 8-8.77s-3.55-8.27-8-8.77z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3z" />
        </svg>
      )}
    </button>
  );
}
