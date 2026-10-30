// קצב הקראה מעט איטי מהרגיל, כדי שיהיה קל לשמוע את ההגייה
export const SPEECH_RATE = 0.85;
// מגבלת האורך של שירות ההקראה של Google Translate
const GOOGLE_TTS_MAX_LENGTH = 200;
// ב-iOS, speak() שמגיע מיד אחרי cancel() נבלע בשקט – מחכים רגע לפני ההקראה הבאה
const CANCEL_SETTLE_MS = 100;

const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

// ─── בחירת קול ───────────────────────────────────────────────────────────────

// מחזיר קול לשפה, null אם הקולות נטענו ואין קול מתאים,
// או undefined אם רשימת הקולות עדיין ריקה (קורה ב-iOS בטעינה הראשונה).
// לא שומרים במטמון: ב-Safari האירוע voiceschanged לא תמיד נשלח,
// ו"אין קול" שנשמר פעם אחת היה נשאר לתמיד
const findVoice = (lang) => {
  const allVoices = window.speechSynthesis.getVoices();
  if (!allVoices.length) return undefined;

  const prefix = lang.slice(0, 2);
  const voices = allVoices.filter(
    (v) => v.lang.startsWith(prefix) || (prefix === "he" && v.lang.startsWith("iw"))
  );
  return (
    voices.find((v) => /google/i.test(v.name)) ||
    voices.find((v) => v.localService) ||
    voices[0] ||
    null
  );
};

// ─── ניגון: רק הקראה אחת בכל רגע ─────────────────────────────────────────────

let currentAudio = null;
// שומרים הפניה ל-utterance, אחרת הדפדפן עלול לאסוף אותו ו-onend לא ייקרא
let currentUtterance = null;
let pendingSpeak = null;
let finishCurrent = null;

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  clearTimeout(pendingSpeak);
  pendingSpeak = null;
  if (hasSpeechSynthesis) {
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) synth.cancel();
  }
  currentUtterance = null;
  finishCurrent?.();
  finishCurrent = null;
};

// גיבוי: הקראה דרך Google Translate כשאין במכשיר קול מתאים
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

// מקריא טקסט ועוצר כל הקראה אחרת. onEnd נקרא פעם אחת – בסיום, בשגיאה או בעצירה
export const speak = (text, { lang = "he-IL", rate = SPEECH_RATE, onEnd } = {}) => {
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };

  const synth = hasSpeechSynthesis ? window.speechSynthesis : null;
  const wasBusy = Boolean(synth && (synth.speaking || synth.pending));
  stopSpeaking();
  finishCurrent = done;

  const voice = synth ? findVoice(lang) : null;
  if (voice === null) {
    playGoogleTTS(text, lang, rate, done);
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  // כשהקולות עוד לא נטענו, המערכת בוחרת קול לפי lang
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.onend = done;
  utterance.onerror = done;
  currentUtterance = utterance;

  const start = () => {
    pendingSpeak = null;
    if (currentUtterance !== utterance) return;
    // ב-iOS ההקראה נתקעת לפעמים במצב paused (למשל אחרי מעבר לאפליקציה אחרת)
    synth.resume();
    synth.speak(utterance);
  };

  // בלי הקראה קודמת – מקריאים מיד, עוד בתוך הלחיצה (iOS דורש פעולת משתמש)
  if (wasBusy) pendingSpeak = setTimeout(start, CANCEL_SETTLE_MS);
  else start();
};
