import { useEffect, useRef, useState } from "react";
import Speaker from "./Speaker";
import { speak, stopSpeaking } from "../lib/speech";
import { compareWords } from "../lib/hebrewText";
import { primaryBtnClasses } from "../lib/buttonClasses";

const secondaryBtnClasses =
  "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all";

export default function WritingPractice({ items, translate, onRestart }) {
  const t = translate?.writing;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const inputRef = useRef(null);

  const current = items[index];
  const finished = index >= items.length;

  // התחלה מחדש כשרשימת הפריטים מתחלפת (מקור או קטגוריה אחרים)
  useEffect(() => {
    setIndex(0);
    setAnswer("");
    setResult(null);
    setScore({ correct: 0, answered: 0 });
  }, [items]);

  useEffect(() => {
    if (!current) return;
    // הקראה אוטומטית כשמופיע פריט חדש
    speak(current.hebrew);
    inputRef.current?.focus();
    return stopSpeaking;
  }, [current]);

  const submit = (revealed = false) => {
    if (result || !current) return;
    if (!revealed && !answer.trim()) return;

    const comparison = compareWords(current.hebrew, revealed ? "" : answer);
    const isCorrect = !revealed && comparison.isCorrect;
    setResult({ ...comparison, isCorrect, revealed });
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      answered: prev.answered + 1,
    }));
  };

  const next = () => {
    setAnswer("");
    setResult(null);
    setIndex((prev) => prev + 1);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (result) next();
    else submit();
  };

  const percentage = items.length > 0 ? (score.answered / items.length) * 100 : 0;

  if (finished) {
    return (
      <div className="relative overflow-hidden glass-card p-8 md:p-10 text-center flex flex-col items-center gap-4 animate-slide-up">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-brand-600"></div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">
          {t?.finishedTitle || "סיימת את התרגול!"}
        </h2>
        <p className="text-xl text-slate-600 dark:text-dark-muted m-0">
          {t?.finalScore || "ענית נכון על"}{" "}
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {score.correct} / {score.answered}
          </span>
        </p>
        <button
          onClick={onRestart}
          className={`mt-2 px-8 py-3 hover:-translate-y-0.5 active:scale-[0.98] ${primaryBtnClasses}`}
        >
          {t?.restart || "תרגל שוב"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden glass-card p-6 md:p-10 flex flex-col gap-6">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-brand-600"></div>

      {/* התקדמות וניקוד */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-dark-muted">
          <span>
            {index + 1} / {items.length}
          </span>
          <span>
            {t?.score || "ניקוד"}:{" "}
            <span className="text-brand-600 dark:text-brand-400 font-bold">
              {score.correct} / {score.answered}
            </span>
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-brand-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* הקראה */}
      <div className="flex flex-col items-center gap-3 bg-brand-50/50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-800/50">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-200 m-0 text-center">
          {t?.instructions || "הקשב והקלד את מה ששמעת"}
        </p>
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-1">
            <Speaker text={current.hebrew} label={t?.listen || "השמע שוב"} />
            <span className="text-xs text-slate-500 dark:text-dark-muted">{t?.listen || "השמע שוב"}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Speaker text={current.hebrew} rate={0.6} label={t?.slow || "השמע לאט"} />
            <span className="text-xs text-slate-500 dark:text-dark-muted">{t?.slow || "השמע לאט"}</span>
          </div>
        </div>
      </div>

      {/* הקלדה */}
      <input
        ref={inputRef}
        type="text"
        dir="rtl"
        lang="he"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={!!result}
        placeholder={t?.placeholder || "הקלד כאן בעברית..."}
        className="w-full text-xl md:text-2xl px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-surface text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 focus:border-brand-500 outline-none transition-all"
      />

      {/* משוב */}
      {result && (
        <div
          className={`p-6 rounded-2xl flex flex-col gap-3 animate-slide-up ${
            result.isCorrect
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"
          }`}
        >
          <p
            className={`text-xl font-bold m-0 ${
              result.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {result.isCorrect
              ? t?.correct || "כל הכבוד, נכון!"
              : result.revealed
                ? t?.revealed || "התשובה הנכונה:"
                : t?.wrong || "כמעט! המילים באדום שגויות:"}
          </p>

          <p className="text-2xl md:text-3xl font-bold m-0 flex flex-wrap gap-x-2 gap-y-1" dir="rtl" lang="he">
            {result.revealed ? (
              <span className="text-slate-800 dark:text-slate-100">{current.hebrew}</span>
            ) : (
              result.words.map((w, i) => (
                <span
                  key={i}
                  className={w.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400 underline decoration-2"}
                >
                  {w.word}
                </span>
              ))
            )}
          </p>

          {!result.isCorrect && !result.revealed && (
            <p className="text-slate-600 dark:text-dark-muted m-0">
              {t?.yourAnswer || "התשובה שלך"}: <span dir="rtl" lang="he">{answer}</span>
            </p>
          )}

          {current.persian && (
            <p className="text-lg text-slate-700 dark:text-slate-300 m-0" dir="rtl" lang="fa">
              {t?.meaning || "פירוש בפרסית"}: {current.persian}
            </p>
          )}
        </div>
      )}

      {/* כפתורים */}
      {result ? (
        <button
          onClick={next}
          className={`w-full py-4 text-xl hover:-translate-y-0.5 active:scale-[0.98] animate-slide-up ${primaryBtnClasses}`}
        >
          {index + 1 < items.length ? t?.next || "הבא" : t?.finish || "סיים"}
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => submit()}
            disabled={!answer.trim()}
            className={`flex-1 py-4 text-xl hover:-translate-y-0.5 active:scale-[0.98] ${primaryBtnClasses}`}
          >
            {t?.check || "בדוק"}
          </button>
          <button
            onClick={() => submit(true)}
            className={`sm:w-48 py-4 text-lg active:scale-[0.98] ${secondaryBtnClasses}`}
          >
            {t?.showAnswer || "הצג תשובה"}
          </button>
        </div>
      )}
    </div>
  );
}
