import { useState, useEffect } from "react";
import { useVocabulary } from "../hooks/useVocabulary";
import { drivingAPI } from "../lib/supabaseClient";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/StatsPage.css";

const StatsPage = ({ translate }) => {
  const { stats: vocabularyStats, words } = useVocabulary();
  const [drivingStats, setDrivingStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivingStats();
  }, []);

  const fetchDrivingStats = async () => {
    setLoading(true);
    try {
      // קבלת סטטיסטיקות נהיגה
      const { data: categoryStats, error: statsError } =
        await drivingAPI.getCategoryStats();
      const { data: results, error: resultsError } =
        await drivingAPI.getRecentResults(20);

      if (!statsError && categoryStats) {
        setDrivingStats(categoryStats);
      }

      if (!resultsError && results) {
        setRecentResults(results);
      }
    } catch (error) {
      console.error("Error fetching driving stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // חישוב סטטיסטיקות כלליות לנהיגה
  const getDrivingOverallStats = () => {
    if (!drivingStats || drivingStats.length === 0) {
      return { totalQuestions: 0, totalCorrect: 0, overallPercentage: 0 };
    }

    const totalQuestions = drivingStats.reduce(
      (sum, stat) => sum + stat.total_questions,
      0
    );
    const totalCorrect = drivingStats.reduce(
      (sum, stat) => sum + stat.correct_answers,
      0
    );
    const overallPercentage =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    return { totalQuestions, totalCorrect, overallPercentage };
  };

  // קבלת מילים שנוספו השבוע
  const getWordsAddedThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return words.filter((word) => {
      const wordDate = new Date(word.created_at);
      return wordDate >= oneWeekAgo;
    }).length;
  };

  if (loading) {
    return <LoadingSpinner translate={translate} />;
  }

  const drivingOverall = getDrivingOverallStats();
  const wordsThisWeek = getWordsAddedThisWeek();
  const vocabularyProgress =
    vocabularyStats.total > 0
      ? Math.round((vocabularyStats.classified / vocabularyStats.total) * 100)
      : 0;

  return (
    <div className="stats-page">
      <div className="page-header">
        <div className="header-title-container">
          <h1>📊 {translate?.statistics?.overallStatistics}</h1>
          <span className="coming-soon-badge-stats">בקרוב</span>
        </div>
        <p>{translate?.statistics?.learningProgress}</p>
      </div>

      {/* סטטיסטיקות כלליות */}
      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{vocabularyStats.total}</div>
            <div className="stat-label">
              {translate?.statistics?.totalWords}
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            ✅ {translate?.statistics.classifiedProgress}
          </div>
          <div className="stat-content">
            <div className="stat-number">{vocabularyProgress}%</div>
            <div className="stat-label"></div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <div className="stat-number">{wordsThisWeek}</div>
            <div className="stat-label">
              {translate?.statistics.newWordOfWeekend}
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-number">
              {drivingOverall.overallPercentage}%
            </div>
            <div className="stat-label">
              {translate?.statistics.avarageGrade}
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות מילים */}
      <div className="section">
        <h2>📖 {translate.statistics.wordStats}</h2>
        <div className="vocab-stats-grid">
          <div className="vocab-stat easy">
            <div className="vocab-stat-icon">✅</div>
            <div className="vocab-stat-content">
              <div className="vocab-stat-number">{vocabularyStats.easy}</div>
              <div className="vocab-stat-label">
                {translate?.statistics.easyWords}
              </div>
            </div>
          </div>

          <div className="vocab-stat medium">
            <div className="vocab-stat-icon">⚠️</div>
            <div className="vocab-stat-content">
              <div className="vocab-stat-number">{vocabularyStats.medium}</div>
              <div className="vocab-stat-label">
                {translate?.statistics.mediumWords}
              </div>
            </div>
          </div>

          <div className="vocab-stat hard">
            <div className="vocab-stat-icon">🔥</div>
            <div className="vocab-stat-content">
              <div className="vocab-stat-number">{vocabularyStats.hard}</div>
              <div className="vocab-stat-label">
                {translate?.statistics.hardWords}
              </div>
            </div>
          </div>

          <div className="vocab-stat unclassified">
            <div className="vocab-stat-icon">❓</div>
            <div className="vocab-stat-content">
              <div className="vocab-stat-number">
                {vocabularyStats.unclassified}
              </div>
              <div className="vocab-stat-label">
                {translate?.statistics.notClassifiedWords}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות נהיגה */}
      {drivingStats && drivingStats.length > 0 && (
        <div className="section">
          <h2>{translate?.statistics.drivingStats}</h2>
          <div className="driving-stats-summary">
            <div className="summary-card">
              <div className="summary-icon">📝</div>
              <div className="summary-content">
                <div className="summary-number">
                  {drivingOverall.totalQuestions}
                </div>
                <div className="summary-label">
                  {translate?.statistics.sumAnsweredQuestions}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-content">
                <div className="summary-number">
                  {drivingOverall.totalCorrect}
                </div>
                <div className="summary-label">
                  {translate?.statistics.correctAnswers}
                </div>
              </div>
            </div>
          </div>

          <div className="category-stats">
            <h3>📊 {translate?.statistics.performanceBySubject}</h3>
            <div className="category-grid">
              {drivingStats.map((stat, index) => {
                const percentage =
                  stat.total_questions > 0
                    ? Math.round(
                        (stat.correct_answers / stat.total_questions) * 100
                      )
                    : 0;
                const level =
                  percentage >= 80
                    ? "excellent"
                    : percentage >= 60
                    ? "good"
                    : "needs-work";

                return (
                  <div key={index} className={`category-card ${level}`}>
                    <div className="category-header">
                      <h4>{stat.category}</h4>
                      <div className="category-percentage">{percentage}%</div>
                    </div>
                    <div className="category-details">
                      <div className="category-progress">
                        <div
                          className="category-progress-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="category-numbers">
                        {stat.correct_answers} / {stat.total_questions}{" "}
                        {translate?.statistics.correct}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* תוצאות אחרונות */}
      {recentResults && recentResults.length > 0 && (
        <div className="section">
          <h2>{translate?.statistics.lastResults}</h2>
          <div className="recent-results">
            {recentResults.slice(0, 10).map((result, index) => (
              <div
                key={index}
                className={`result-item ${
                  result.is_correct ? "correct" : "incorrect"
                }`}
              >
                <div className="result-icon">
                  {result.is_correct ? "✅" : "❌"}
                </div>
                <div className="result-content">
                  <div className="result-category">
                    {result.driving_questions?.category || "נושא לא ידוע"}
                  </div>
                  <div className="result-date">
                    {new Date(result.created_at).toLocaleDateString("he-IL")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* אם אין נתוני נהיגה */}
      {(!drivingStats || drivingStats.length === 0) && (
        <div className="section">
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h3>{translate?.statistics.noRecentResults}</h3>
            <p>{translate?.statistics.pleasePractice}</p>
            <a href="/practice/driving" className="cta-button">
              {translate?.statistics.startPracticing}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
