import { primaryBtnClasses } from "../lib/buttonClasses";

// כרטיס שמוצג לאורחים במקום תוכן שדורש התחברות
export default function LoginPrompt({ translate, message, onLogin }) {
  return (
    <div className="relative overflow-hidden glass-card p-10 md:p-12 text-center flex flex-col items-center gap-4 animate-slide-up">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
      <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">
        {translate?.guest?.loginRequiredTitle || "נדרשת התחברות"}
      </h2>
      <p className="text-slate-600 dark:text-dark-muted m-0 max-w-md">
        {message}
      </p>
      <button
        onClick={onLogin}
        className={`mt-2 px-8 py-3 hover:-translate-y-0.5 active:scale-[0.98] ${primaryBtnClasses}`}
      >
        {translate?.auth?.signIn || "התחבר"}
      </button>
    </div>
  );
}
