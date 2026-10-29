import { Link } from "react-router-dom";

// מקטע סטטיסטיקה לסוג תרגול: כותרת, אריחי מספרים, או הזמנה להתחיל לתרגל
export default function PracticeStatsSection({ icon, title, tiles, hasData, emptyText, ctaTo, ctaText }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-brand-500">{icon}</span> {title}
      </h2>
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className={`glass-card p-5 text-center flex flex-col items-center gap-2 border-t-4 ${tile.borderClass}`}
            >
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tile.value}</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{tile.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center flex flex-col items-center gap-4 border-dashed border-2 border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 m-0">{emptyText}</p>
          <Link
            to={ctaTo}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all shadow-md shadow-brand-500/20"
          >
            {ctaText}
          </Link>
        </div>
      )}
    </div>
  );
}
