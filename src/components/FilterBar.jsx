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
    <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-xl shadow-sm border border-[#e9ecef]">
      <span className="text-sm font-semibold text-[#7f8c8d] self-center ml-2">
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
            transition-all duration-150 border
            ${
              isActive
                ? "bg-[#2a7ae4] text-white border-[#2a7ae4] shadow-sm scale-105"
                : "bg-white text-[#495057] border-[#dee2e6] hover:border-[#2a7ae4] hover:text-[#2a7ae4]"
            }
          `}
          >
            {`${f.label}`}
            <span
              className={`
              text-xs px-1.5 py-0.5 rounded-full font-bold
              ${isActive ? "bg-white/25 text-white" : "bg-[#f0f0f0] text-[#666]"}
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
