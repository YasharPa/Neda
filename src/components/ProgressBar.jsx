import "../styles/ProgressBar.css";

const ProgressBar = ({ stats, percentage }) => {
  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>📊 התקדמות סיווג המילים</h3>
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
          <span className="stat-label">סווגו</span>
        </div>
        <div className="stat-divider">מתוך</div>
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">סה"כ</span>
        </div>
      </div>

      <div className="difficulty-summary">
        <div className="summary-item easy">
          <span className="summary-icon">✅</span>
          <span className="summary-count">{stats.easy}</span>
          <span className="summary-label">קל</span>
        </div>
        <div className="summary-item medium">
          <span className="summary-icon">⚠️</span>
          <span className="summary-count">{stats.medium}</span>
          <span className="summary-label">בינוני</span>
        </div>
        <div className="summary-item hard">
          <span className="summary-icon">🔥</span>
          <span className="summary-count">{stats.hard}</span>
          <span className="summary-label">קשה</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
