import { useState } from "react";
import "../styles/Speaker.css";

export default function Speaker({ text, lang = "he-IL" }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = (event) => {
    if (!text) return;
    event.stopPropagation();
    // עצירה של הקראה קודמת
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    speechSynthesis.speak(utterance);
  };
  const voices = speechSynthesis.getVoices();
  console.log(voices);

  return (
    <button
      onClick={handleSpeak}
      className={`speaker ${speaking ? "speaker--active" : ""}`}
      aria-label="הקרא טקסט"
    >
      {speaking ? (
        <svg
          className="speaker__icon speaker__icon--active"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.26 2.5-4.02zM14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.45-.5 8-4.27 8-8.77s-3.55-8.27-8-8.77z" />
        </svg>
      ) : (
        <svg
          className="speaker__icon"
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
