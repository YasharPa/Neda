import { useState } from "react";
import WritingPractice from "../components/WritingPractice";
import LoadingSpinner from "../components/LoadingSpinner";
import LoginPrompt from "../components/LoginPrompt";
import { useAuth } from "../hooks/useAuth";
import { useWritingPractice } from "../hooks/useWritingPractice";

const CATEGORIES = ["greetings", "questions", "plans", "replies", "feelings", "everyday"];

const pillClasses = (active) =>
  `px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-[0.97] ${
    active
      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
  }`;

export default function WritingPage({ translate, onLogin }) {
  const t = translate?.writing;
  const { user } = useAuth();
  const [source, setSource] = useState("phrases");
  const [category, setCategory] = useState(null);

  // המילים האישיות זמינות רק למשתמש מחובר
  const needsLogin = source === "myWords" && !user;
  const { items, loading, error, reload } = useWritingPractice(
    source,
    source === "phrases" ? category : null,
    !needsLogin,
  );

  const renderContent = () => {
    if (needsLogin) {
      return (
        <LoginPrompt
          translate={translate}
          message={t?.myWordsLogin || "כדי לתרגל עם המילים ששמרת, יש להתחבר לחשבון"}
          onLogin={onLogin}
        />
      );
    }
    if (loading) return <LoadingSpinner translate={translate} />;
    if (error) {
      return (
        <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
          <p className="text-red-600 dark:text-red-400 font-medium m-0">
            {translate?.errors?.loadingError || "שגיאה בטעינה"}
          </p>
          <button
            onClick={reload}
            className="px-6 py-2 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
          >
            {translate?.errors?.tryAgain || "נסה שוב"}
          </button>
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="glass-card p-8 text-center text-slate-500 dark:text-dark-muted">
          {source === "myWords"
            ? t?.noWords || "עדיין אין לך מילים שמורות. הוסף מילים בעמוד למידת מילים"
            : t?.noPhrases || "אין משפטים להצגה"}
        </div>
      );
    }
    return <WritingPractice items={items} translate={translate} onRestart={reload} />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 animate-slide-up pb-10 px-4 md:px-0">
      <div className="glass-card p-8 text-center border-brand-200 dark:border-brand-900/50">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 m-0">
          {translate?.topics?.spelling?.title || "כתיבה נכונה"}
        </h1>
        <p className="text-slate-600 dark:text-dark-muted mt-3 mb-0">
          {translate?.topics?.spelling?.description}
        </p>
      </div>

      {/* בחירת מקור ונושא */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          <button className={pillClasses(source === "phrases")} onClick={() => setSource("phrases")}>
            {t?.sourcePhrases || "הודעות יומיומיות"}
          </button>
          <button className={pillClasses(source === "myWords")} onClick={() => setSource("myWords")}>
            {t?.sourceMyWords || "המילים שלי"}
          </button>
        </div>

        {source === "phrases" && (
          <div className="flex flex-wrap justify-center gap-2">
            <button className={pillClasses(category === null)} onClick={() => setCategory(null)}>
              {translate?.filterBar?.all || "הכל"}
            </button>
            {CATEGORIES.map((cat) => (
              <button key={cat} className={pillClasses(category === cat)} onClick={() => setCategory(cat)}>
                {t?.categories?.[cat] || cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
}
