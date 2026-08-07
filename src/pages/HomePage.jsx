import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { drivingAPI } from "../lib/supabaseClient";

export default function HomePage({
  translate,
  statistics,
  language = "he",
  user,
}) {
  const [drivingStats, setDrivingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDrivingStats();
    }
  }, [user]);

  const fetchDrivingStats = async () => {
    try {
      const { data: categoryStats } = await drivingAPI.getCategoryStats();
      const { data: recentResults } = await drivingAPI.getRecentResults(100);

      if (categoryStats) {
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

  const getPracticeSessionsCount = () => {
    const drivingPractice = drivingStats?.practiceSessionsCount || 0;
    const vocabularyPractice = statistics?.classified || 0;
    return drivingPractice + vocabularyPractice;
  };

  const getWordsLearned = () => {
    return statistics?.classified || 0;
  };

  const stats = [
    {
      title: translate?.statistics?.totalPracticeSessions || "תרגילים שבוצעו",
      value: getPracticeSessionsCount(),
    },
    {
      title: translate?.statistics?.totalWordsLearned || "מילים שנלמדו",
      value: getWordsLearned(),
    },
    {
      title: translate?.statistics?.completedSentences || "שאלות נענו",
      value: 0,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-10 animate-slide-up">
      {/* אזור סטטיסטיקה עילי */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                {loading ? (
                  <span className="inline-block w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></span>
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-slate-600 dark:text-dark-muted font-medium">
                {stat.title}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* אזור בחירת נושא */}
      <section>
        <h2 className="text-center text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">
          {translate?.chooseSubject || "בחר נושא ללמידה"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* כרטיסיית נהיגה */}
          <Link to="/practice/driving" className="glass-card-interactive flex flex-col p-6 group">
            <div className="w-full h-2 bg-gradient-to-r from-orange-400 to-red-500 absolute top-0 left-0"></div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {translate?.topics?.driving?.title || "תיאוריה לנהיגה"}
            </h3>
            <p className="text-slate-600 dark:text-dark-muted flex-grow mb-6">
              {translate?.topics?.driving?.description}
            </p>
            
            {drivingStats?.overallPercentage > 0 && (
              <div className="mt-auto">
                <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-dark-muted mb-2">
                  <span>{translate?.progressBar?.currrentScore}</span>
                  <span className="text-brand-600 dark:text-brand-400">{drivingStats.overallPercentage}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${drivingStats.overallPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Link>

          {/* כרטיסיית אוצר מילים */}
          <Link to="/practice/vocabulary" className="glass-card-interactive flex flex-col p-6 group">
            <div className="w-full h-2 bg-gradient-to-r from-emerald-400 to-green-500 absolute top-0 left-0"></div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {translate?.topics?.vocabulary?.title || "למידת מילים"}
            </h3>
            <p className="text-slate-600 dark:text-dark-muted flex-grow mb-6">
              {translate?.topics?.vocabulary?.description || "למד מילים חדשות והרחב את אוצר המילים שלך"}
            </p>
            
            {statistics?.total > 0 && (
              <div className="mt-auto">
                <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-dark-muted mb-2">
                  <span>{translate?.progressBar?.classified || "סווגו"}:</span>
                  <span className="text-brand-600 dark:text-brand-400">{statistics.classified} / {statistics.total}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(statistics.classified / statistics.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </Link>

          {/* כרטיסיית השלמת משפטים (בקרוב) */}
          <Link to="/practice/sentence-completion" className="glass-card-interactive flex flex-col p-6 group opacity-80 cursor-default" onClick={(e) => e.preventDefault()}>
            <div className="w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600 absolute top-0 left-0"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {translate?.topics?.sentenceCompletion?.title || "השלמת משפטים"}
              </h3>
              <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 text-xs font-bold rounded-full">
                {translate?.comingSoon || "בקרוב..."}
              </span>
            </div>
            <p className="text-slate-600 dark:text-dark-muted flex-grow">
              {translate?.topics?.sentenceCompletion?.description || "השלם את המילה החסרה במשפט"}
            </p>
          </Link>
        </div>
      </section>

      {/* כפתור לסטטיסטיקות מפורטות */}
      {!loading && (statistics?.total > 0 || drivingStats?.totalQuestions > 0) && (
        <section className="flex justify-center mt-4">
          <Link
            to="/stats"
            className="group flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-full font-medium transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-1"
          >
            <span>
              {language === "he" ? "צפה בסטטיסטיקות מפורטות" : "مشاهده آمار دقیق"}
            </span>
            <span className="text-xl transition-transform group-hover:-translate-x-1">
              ←
            </span>
          </Link>
        </section>
      )}
    </div>
  );
}
