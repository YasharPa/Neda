import "../styles/ProgressBar.css";

/**
 * ProgressBar component displays a progress bar with statistics and difficulty summary.
 *
 * @param {Object} props
 * @param {Object} props.stats - Statistics for the progress bar.
 * @param {number} props.stats.classified - Number of classified items.
 * @param {number} props.stats.total - Total number of items.
 * @param {number} props.stats.easy - Number of easy items.
 * @param {number} props.stats.medium - Number of medium items.
 * @param {number} props.stats.hard - Number of hard items.
 * @param {number} props.percentage - Progress percentage (0-100).
 * @param {Object} props.translate - Translation object for labels.
 * @param {Object} props.translate.progressBar - Progress bar labels.
 * @param {string} props.translate.progressBar.title - Title label.
 * @param {string} props.translate.progressBar.classified - Classified label.
 * @param {string} props.translate.progressBar.outof - Out of label.
 * @param {string} props.translate.progressBar.total - Total label.
 * @param {string} props.translate.progressBar.easy - Easy label.
 * @param {string} props.translate.progressBar.medium - Medium label.
 * @param {string} props.translate.progressBar.hard - Hard label.
 */

const ProgressBar = ({ stats, percentage, translate }) => {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>📊 {translate?.progressBar?.title}</h3>
        <span className="progress-percentage">{percentage}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.classified}</span>
          <span className="stat-label">
            {translate?.progressBar?.classified}
          </span>
        </div>
        <div className="stat-divider">{translate?.progressBar?.outof}</div>
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">{translate?.progressBar?.total}</span>
        </div>
      </div>

      <div className="difficulty-summary">
        <div className="summary-item easy">
          <span className="summary-icon">✅</span>
          <span className="summary-count">{stats.easy}</span>
          <span className="summary-label">{translate?.progressBar?.easy}</span>
        </div>
        <div className="summary-item medium">
          <span className="summary-icon">⚠️</span>
          <span className="summary-count">{stats.medium}</span>
          <span className="summary-label">
            {translate?.progressBar?.medium}
          </span>
        </div>
        <div className="summary-item hard">
          <span className="summary-icon">🔥</span>
          <span className="summary-count">{stats.hard}</span>
          <span className="summary-label">{translate?.progressBar.hard}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
