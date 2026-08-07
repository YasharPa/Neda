/**
 * ProgressBar component displays a progress bar with a title and percentage.
 *
 * @param {Object} props
 * @param {number} props.percentage - Progress percentage (0-100).
 * @param {Object} props.translate - Translation object for labels.
 * @param {Object} props.translate.progressBar - Progress bar labels.
 * @param {string} props.translate.progressBar.title - Title label for the progress bar.
 */

function ProgressBar({ percentage, translate }) {
  return (
    <div className="glass-card p-6 md:p-8 mb-8 border-brand-200 dark:border-brand-900/50">
      <div className="flex justify-between items-center mb-5">
        <h3 className="m-0 text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
          {translate?.progressBar?.title}
        </h3>
        <span className="text-3xl font-black text-brand-600 dark:text-brand-400">
          {percentage}%
        </span>
      </div>

      <div className="w-full h-4 md:h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 dark:from-brand-500 dark:to-brand-400 rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-50"></div>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
