import { useState, useEffect } from "react";
import { useVocabulary } from "../hooks/useVocabulary";
import { drivingAPI } from "../lib/supabaseClient";
import LoadingSpinner from "../components/LoadingSpinner";

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
    <div className="w-full flex flex-col gap-10 animate-slide-up pb-10">
      <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right border-brand-200 dark:border-brand-900/50">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center md:justify-start gap-3 m-0">
            <span className="text-brand-500">📊</span> {translate?.statistics?.overallStatistics}
          </h1>
          <p className="text-slate-600 dark:text-dark-muted mt-2 m-0 text-lg">
            {translate?.statistics?.learningProgress}
          </p>
        </div>
        <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-bold border border-brand-200/50 dark:border-brand-800/50">
          בקרוב
        </span>
      </div>

      {/* סטטיסטיקות כלליות */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="text-4xl">📚</div>
          <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{vocabularyStats.total}</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted font-medium">{translate?.statistics?.totalWords}</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="text-4xl text-emerald-500">✓</div>
          <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{vocabularyProgress}%</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted font-medium">{translate?.statistics.classifiedProgress}</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="text-4xl">🆕</div>
          <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{wordsThisWeek}</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted font-medium">{translate?.statistics.newWordOfWeekend}</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="text-4xl">🚗</div>
          <div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{drivingOverall.overallPercentage}%</div>
            <div className="text-sm text-slate-600 dark:text-dark-muted font-medium">{translate?.statistics.avarageGrade}</div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות מילים */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 m-0 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-brand-500">📖</span> {translate.statistics.wordStats}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 text-center flex flex-col items-center gap-2 border-t-4 border-t-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10">
            <div className="text-2xl text-emerald-500">✓</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{vocabularyStats.easy}</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{translate?.statistics.easyWords}</div>
          </div>

          <div className="glass-card p-5 text-center flex flex-col items-center gap-2 border-t-4 border-t-orange-500 bg-orange-50/30 dark:bg-orange-900/10">
            <div className="text-2xl text-orange-500">⚠️</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{vocabularyStats.medium}</div>
            <div className="text-xs font-semibold text-orange-700 dark:text-orange-400">{translate?.statistics.mediumWords}</div>
          </div>

          <div className="glass-card p-5 text-center flex flex-col items-center gap-2 border-t-4 border-t-red-500 bg-red-50/30 dark:bg-red-900/10">
            <div className="text-2xl text-red-500">🔥</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{vocabularyStats.hard}</div>
            <div className="text-xs font-semibold text-red-700 dark:text-red-400">{translate?.statistics.hardWords}</div>
          </div>

          <div className="glass-card p-5 text-center flex flex-col items-center gap-2 border-t-4 border-t-slate-400 bg-slate-100/50 dark:bg-slate-800/50">
            <div className="text-2xl text-slate-400">❓</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{vocabularyStats.unclassified}</div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">{translate?.statistics.notClassifiedWords}</div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות נהיגה */}
      {drivingStats && drivingStats.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
            {translate?.statistics.drivingStats}
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 glass-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">📝</div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{translate?.statistics.sumAnsweredQuestions}</div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{drivingOverall.totalQuestions}</div>
            </div>

            <div className="flex-1 glass-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl text-emerald-500">✓</div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{translate?.statistics.correctAnswers}</div>
              </div>
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{drivingOverall.totalCorrect}</div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
              <span className="text-brand-500">📊</span> {translate?.statistics.performanceBySubject}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivingStats.map((stat, index) => {
                const percentage = stat.total_questions > 0
                    ? Math.round((stat.correct_answers / stat.total_questions) * 100)
                    : 0;
                
                let colorClass = "from-red-400 to-red-500";
                let textClass = "text-red-600 dark:text-red-400";
                if (percentage >= 80) {
                  colorClass = "from-emerald-400 to-emerald-500";
                  textClass = "text-emerald-600 dark:text-emerald-400";
                } else if (percentage >= 60) {
                  colorClass = "from-orange-400 to-orange-500";
                  textClass = "text-orange-600 dark:text-orange-400";
                }

                return (
                  <div key={index} className="glass-card p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 m-0 text-sm">{stat.category}</h4>
                      <div className={`font-bold text-lg ${textClass}`}>{percentage}%</div>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-left" dir="ltr">
                      {stat.correct_answers} / {stat.total_questions} {translate?.statistics.correct}
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
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0 border-b-2 border-slate-200 dark:border-slate-800 pb-2">
            {translate?.statistics.lastResults}
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentResults.slice(0, 10).map((result, index) => (
                <div key={index} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${result.is_correct ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                    {result.is_correct ? "✓" : "✕"}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {result.driving_questions?.category || "נושא לא ידוע"}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(result.created_at).toLocaleDateString("he-IL")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* אם אין נתוני נהיגה */}
      {(!drivingStats || drivingStats.length === 0) && (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="text-5xl opacity-80">🚗</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 m-0">{translate?.statistics.noRecentResults}</h3>
          <p className="text-slate-500 dark:text-slate-400 m-0">{translate?.statistics.pleasePractice}</p>
          <a href="/practice/driving" className="mt-4 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition-all shadow-md shadow-brand-500/20">
            {translate?.statistics.startPracticing}
          </a>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
