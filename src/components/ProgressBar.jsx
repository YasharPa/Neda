import "../styles/ProgressBar.css";

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
    <div className="bg-white rounded-xl p-[25px] mb-[30px] shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center mb-[20px]">
        <h3 className="m-0 text-[#2c3e50] text-xl">
          {translate?.progressBar?.title}
        </h3>
        <span className="text-3xl font-bold text-[#2a7ae4]">{percentage}%</span>
      </div>

      <div
        className="w-full h-[25px] bg-[#ecf0f1] rounded-xl overflow-hidden
mb-[15px]"
      >
        <div
          className="h-full bg-[linear-gradient(90deg,#1e5bb8,#2a7ae4)] transition-[width] duration-500 ease-in-out rounded-xl"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
