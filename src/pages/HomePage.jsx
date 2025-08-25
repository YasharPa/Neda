import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";
import { drivingAPI } from "../lib/supabaseClient";

export default function HomePage({ translate, statistics, language = "he" }) {
  const [drivingStats, setDrivingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivingStats();
  }, []);

  const fetchDrivingStats = async () => {
    try {
      const { data: categoryStats } = await drivingAPI.getCategoryStats();
      const { data: recentResults } = await drivingAPI.getRecentResults(100);

      if (categoryStats) {
        // חישוב סטטיסטיקות נהיגה
        const totalQuestions = categoryStats.reduce(
          (sum, stat) => sum + stat.total_questions,
          0
        );
        const totalCorrect = categoryStats.reduce(
          (sum, stat) => sum + stat.correct_answers,
          0
        );
        const overallPercentage =
          totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;

        setDrivingStats({
          totalQuestions,
          totalCorrect,
          overallPercentage,
          practiceSessionsCount: recentResults ? recentResults.length : 0,
        });
      }
    } catch (error) {
      console.error("Error fetching driving stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // חישוב תרגילים שבוצעו (בהתבסס על תוצאות נהיגה וסטטיסטיקות מילים)
  const getPracticeSessionsCount = () => {
    const drivingPractice = drivingStats?.practiceSessionsCount || 0;
    const vocabularyPractice = statistics?.classified || 0; // כל מילה שסווגה = פעילות תרגול
    return drivingPractice + vocabularyPractice;
  };

  // חישוב מילים שנלמדו (מילים שסווגו)
  const getWordsLearned = () => {
    return statistics?.classified || 0;
  };

  const stats = [
    {
      title: translate?.statistics?.totalPracticeSessions || "תרגילים שבוצעו",
      value: getPracticeSessionsCount(),
      icon: "📝",
    },
    {
      title: translate?.statistics?.totalWordsLearned || "מילים שנלמדו",
      value: getWordsLearned(),
      icon: "📚",
    },
    {
      title: translate?.statistics?.completedSentences || "שאלות נענו",
      value: 0,
      icon: "✅",
    },
  ];

  return (
    <div className="home-container">
      <section className="stats-section">
        <div className="stats-row">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card-home">
              <div className="stat-icon-home">{stat.icon}</div>
              <div className="stat-content-home">
                <div className="stat-number-home">
                  {loading ? "..." : stat.value}
                </div>
                <div className="stat-label-home">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* נושאי לימוד */}
      <section className="topics-section">
        <h2>📚 {translate?.chooseSubject || "בחר נושא ללמידה"}</h2>
        <div className="topics-grid">
          <Link to="/practice/driving" className="topic-card enhanced">
            <div className="topic-card-header">
              <span className="topic-icon">🚗</span>
              <h3>{translate?.topics?.driving?.title || "תיאוריה לנהיגה"}</h3>
            </div>
            <p className="topic-description">
              {language === "he"
                ? "תרגל שאלות תיאוריה ושפר את הציונים שלך"
                : "سوالات تئوری را تمرین کنید و نمرات خود را بهبود دهید"}
            </p>
            {drivingStats?.overallPercentage > 0 && (
              <div className="topic-progress">
                <div className="topic-progress-text">
                  {language === "he" ? "ציון נוכחי:" : "نمره فعلی:"}{" "}
                  {drivingStats.overallPercentage}%
                </div>
                <div className="topic-progress-bar">
                  <div
                    className="topic-progress-fill driving"
                    style={{ width: `${drivingStats.overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Link>

          <Link to="/practice/vocabulary" className="topic-card enhanced">
            <div className="topic-card-header">
              <span className="topic-icon">📖</span>
              <h3>{translate?.topics?.vocabulary?.title || "למידת מילים"}</h3>
            </div>
            <p className="topic-description">
              {translate?.topics?.vocabulary?.description ||
                "למד מילים חדשות והרחב את אוצר המילים שלך"}
            </p>
            {statistics?.total > 0 && (
              <div className="topic-progress">
                <div className="topic-progress-text">
                  {translate?.progressBar?.classified || "סווגו"}:{" "}
                  {statistics.classified}/{statistics.total}
                </div>
                <div className="topic-progress-bar">
                  <div
                    className="topic-progress-fill vocabulary"
                    style={{
                      width: `${
                        (statistics.classified / statistics.total) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </Link>

          <Link
            to="/practice/sentences"
            className="topic-card enhanced coming-soon-card"
          >
            <div className="topic-card-header">
              <span className="topic-icon">✏️</span>
              <h3>
                {translate?.topics?.sentenceCompletion?.title || "השלמת משפטים"}
              </h3>
              <span className="coming-soon-badge">
                {language === "he" ? "בקרוב" : "به زودی"}
              </span>
            </div>
            <p className="topic-description">
              {translate?.topics?.sentenceCompletion?.description ||
                "השלם את המילה החסרה במשפט"}
            </p>
          </Link>
        </div>
      </section>
      {/* קישור לסטטיסטיקות מפורטות */}
      {!loading &&
        (statistics?.total > 0 || drivingStats?.totalQuestions > 0) && (
          <section className="detailed-stats-link">
            <Link to="/stats" className="view-detailed-stats">
              <span className="stats-link-icon">📈</span>
              <span className="stats-link-text">
                {language === "he"
                  ? "צפה בסטטיסטיקות מפורטות"
                  : "مشاهده آمار دقیق"}
              </span>
              <span className="stats-link-arrow">←</span>
            </Link>
          </section>
        )}
    </div>
  );
}
