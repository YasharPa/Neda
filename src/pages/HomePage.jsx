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
          0,
        );
        const totalCorrect = categoryStats.reduce(
          (sum, stat) => sum + stat.correct_answers,
          0,
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
  const topicCardHeader =
    "flex flex-col sm:flex-row items-center text-center sm:text-start relative mb-4";
  const topicCardSubHeader = "m-0 text-[1.3rem] text-[#333]";
  const topicIcon = "text-[2.5rem] mb-2 sm:mb-0 ml-0 sm:ml-4";
  const topicCardEnhanced =
    "block bg-white relative overflow-hidden rounded-2xl p-6 sm:p-8 text-inherit no-underline border border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#4caf50] before:via-[#2196f3] before:to-[#ff9800]";

  const topicDescription = "text-[#666] mb-4 leading-[1.6]";
  const topicProgressText = "text-sm text-[#666] mb-2";
  const topicProgressBar = "h-1.5 bg-gray-100 rounded overflow-hidden";
  const topicProgressFillBase =
    "h-full rounded-sm transition-all duration-300 ease-in-out";
  return (
    <div className="max-w-[1200px] mx-auto p-8 min-h-[calc(100vh-200px)] md:p-4">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 text-center flex-1  rounded-xl border border-black/10 shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
            >
              <div className="text-[2.5rem] mb-2">{stat.icon}</div>
              <div className="text-[2rem] font-bold text-[#2a7ae4] mb-1">
                {loading ? "..." : stat.value}
              </div>
              <div className="text-[#666] text-[0.9rem]">{stat.title}</div>
            </div>
          ))}
        </div>
      </section>
      {/* נושאי לימוד */}
      <section className="mb-12">
        <h2 className="text-center mb-8 text-[#333] text-3xl">
          {translate?.chooseSubject || "בחר נושא ללמידה"}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] md:gap-8">
          <Link to="/practice/driving" className={topicCardEnhanced}>
            <div className={topicCardHeader}>
              <span className={topicIcon}>🚗</span>
              <h3 className={topicCardSubHeader}>
                {translate?.topics?.driving?.title || "תיאוריה לנהיגה"}
              </h3>
            </div>
            <p className={topicDescription}>
              {translate?.topics?.driving?.description}
            </p>
            {drivingStats?.overallPercentage > 0 && (
              <div className="mt-4">
                <div className={topicProgressText}>
                  {translate?.progressBar?.currrentScore}
                  {drivingStats.overallPercentage}%
                </div>
                <div className={topicProgressBar}>
                  <div
                    className={`${topicProgressFillBase} bg-gradient-to-r from-[#ff9800] to-[#ff5722]`}
                    style={{ width: `${drivingStats.overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Link>

          <Link to="/practice/vocabulary" className={topicCardEnhanced}>
            <div className={topicCardHeader}>
              <span className={topicIcon}>📖</span>
              <h3 className={topicCardSubHeader}>
                {translate?.topics?.vocabulary?.title || "למידת מילים"}
              </h3>
            </div>
            <p className={topicDescription}>
              {translate?.topics?.vocabulary?.description ||
                "למד מילים חדשות והרחב את אוצר המילים שלך"}
            </p>
            {statistics?.total > 0 && (
              <div className="mt-4">
                <div className={topicProgressText}>
                  {translate?.progressBar?.classified || "סווגו"}:{" "}
                  {statistics.classified}/{statistics.total}
                </div>
                <div className={topicProgressBar}>
                  <div
                    className={`${topicProgressFillBase} bg-gradient-to-r from-[#4caf50] to-[#8bc34a]`}
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
            to="/practice/sentence-completion"
            className={`${topicCardEnhanced} opacity-70 relative`}
          >
            <div className={topicCardHeader}>
              <span className={topicIcon}>✏️</span>
              <h3 className={topicCardSubHeader}>
                {translate?.topics?.sentenceCompletion?.title || "השלמת משפטים"}
              </h3>
              <span className="absolute -top-2 bg-[#ff6b35] text-white py-[0.3rem] px-[0.8rem] rounded-xl text-[0.8rem] font-bold">
                {translate?.comingSoon || "בקרוב..."}
              </span>
            </div>
            <p className={topicDescription}>
              {translate?.topics?.sentenceCompletion?.description ||
                "השלם את המילה החסרה במשפט"}
            </p>
          </Link>
        </div>
      </section>
      {/* קישור לסטטיסטיקות מפורטות */}
      {!loading &&
        (statistics?.total > 0 || drivingStats?.totalQuestions) > 0 && (
          <section className="text-center mt-8">
            <Link
              to="/stats"
              className="group inline-flex items-center gap-2 bg-[#2a7ae4] text-white py-4 px-8 rounded-[25px] no-underline font-semibold transition-all duration-300 shadow-[0_4px_15px_rgba(42,122,228,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(42,122,228,0.4)] hover:bg-[#1e6ad1]"
            >
              <span className="stats-link-text">
                {language === "he"
                  ? "צפה בסטטיסטיקות מפורטות"
                  : "مشاهده آمار دقیق"}
              </span>
              <span className="text-[1.2rem] transition-transform duration-300 group-hover:-translate-x-[3px]">
                ←
              </span>
            </Link>
          </section>
        )}
    </div>
  );
}
