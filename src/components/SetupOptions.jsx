// כפתורי בחירה למסכי הגדרות תרגול

export const OptionButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-medium border-2 transition-all duration-200 ${
      active
        ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20"
        : "bg-white/60 dark:bg-dark-surface/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-400"
    }`}
  >
    {children}
  </button>
);

export const SettingRow = ({ label, children }) => (
  <div className="flex flex-col gap-3">
    <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);
