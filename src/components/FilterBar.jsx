export default function FilterBar({
  activeFilter,
  onChange,
  counts,
  translate,
}) {
  const FILTERS = [
    { key: "all", label: translate?.filterBar?.all },
    { key: null, label: translate?.filterBar?.unclassified },
    { key: "easy", label: translate?.filterBar?.easy },
    { key: "medium", label: translate?.filterBar?.medium },
    { key: "hard", label: translate?.filterBar?.hard },
  ];
  return (
    <div className="flex flex-wrap gap-2 mb-6 p-4 glass-card border-brand-200 dark:border-brand-900/50">
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 self-center ml-2">
        {translate.filterBar.filter}:
      </span>

      {FILTERS.map((f) => {
        const isActive =
          f.key === "all" ? activeFilter === "all" : activeFilter === f.key;

        const count =
          f.key === "all"
            ? counts.total
            : f.key === null
              ? counts.unclassified
              : (counts[f.key] ?? 0);

        return (
          <button
            key={String(f.key)}
            onClick={() => onChange(f.key === "all" ? "all" : f.key)}
            className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
            transition-all duration-150 border-2
            ${
              isActive
                ? "bg-brand-500 text-white border-brand-600 shadow-md scale-105"
                : "bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
            }
          `}
          >
            {`${f.label}`}
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full font-bold
              ${isActive ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}
            `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
