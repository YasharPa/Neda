import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DrivingQuiz from "../components/DrivingQuiz";

const DrivingPage = ({ translate, language = "he" }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [questionCount, setQuestionCount] = useState(30);
  const navigate = useNavigate();

  if (showQuiz) {
    return (
      <div className="w-full flex flex-col gap-6 animate-slide-up">
        <div className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
            onClick={() => setShowQuiz(false)}
          >
            <span className="text-xl leading-none">←</span> {translate.driving.backToMenu}
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">
            {translate.driving.title}
          </h1>
        </div>
        <DrivingQuiz
          translate={translate}
          language={language}
          maxQuestions={questionCount}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 animate-slide-up">
      {/* אזור סוגי בחינות */}
      <section className="flex flex-col gap-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-slate-100">
          {translate?.driving.quizSettings.title}
        </h2>
        
        {/* הגדרות כמות שאלות */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 border-brand-200 dark:border-brand-900/50">
          <label htmlFor="questionCount" className="text-lg font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {translate?.driving?.quizSettings?.amountOfQuestions}:
          </label>
          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <select
              id="questionCount"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full appearance-none bg-white dark:bg-dark-surface border-2 border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 rounded-xl px-4 py-3 pr-10 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-brand-500/20 transition-all cursor-pointer"
            >
              <option value={10}>10 {translate?.driving?.quizSettings?.questions}</option>
              <option value={20}>20 {translate?.driving?.quizSettings?.questions}</option>
              <option value={30}>
                30 {translate?.driving?.quizSettings?.questions} ({translate?.driving?.quizSettings?.recommended})
              </option>
              <option value={50}>50 {translate?.driving?.quizSettings?.questions}</option>
              <option value={0}>{translate?.driving?.quizSettings?.allQuestions}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* אפשרויות למידה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="glass-card-interactive flex flex-col p-8 group border-brand-200 dark:border-brand-900/30"
            onClick={() => setShowQuiz(true)}
          >
            <div className="flex flex-col items-center text-center gap-4 flex-grow">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-3xl mb-2 text-brand-600 dark:text-brand-400">
                📝
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {translate.driving.quizTypes.adaptive}
              </h3>
              <p className="text-slate-600 dark:text-dark-muted leading-relaxed">
                {translate.driving.quizTypes.adaptiveDesc}
              </p>
              
              <div className="mt-4 mb-6">
                <span className="inline-block bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-brand-200/50 dark:border-brand-800/50">
                  {questionCount === 0
                    ? `${translate?.driving?.quizSettings?.allQuestions}`
                    : `${questionCount} ${translate?.driving?.quizSettings?.questions}`}
                </span>
              </div>
            </div>
            
            <button className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-lg transition-all shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40">
              {translate.driving.startQuiz}
            </button>
          </div>

          <div className="glass-card flex flex-col p-8 opacity-70 relative cursor-default">
            <span className="absolute top-4 right-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 dark:border-orange-800/50">
              {translate?.comingSoon}
            </span>
            <div className="flex flex-col items-center text-center gap-4 h-full justify-center opacity-80">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-2 text-slate-500">
                📚
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {translate.driving.quizTypes.practice}
              </h3>
              <p className="text-slate-600 dark:text-dark-muted leading-relaxed">
                {translate.driving.quizTypes.practiceDesc}
              </p>
            </div>
          </div>

          <div
            className="glass-card-interactive flex flex-col p-8 group border-brand-200 dark:border-brand-900/30"
            onClick={() => navigate("/practice/driving/signs")}
          >
            <div className="flex flex-col items-center text-center gap-4 flex-grow">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-3xl mb-2 text-brand-600 dark:text-brand-400">
                🚸
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {translate.driving.quizTypes.signs}
              </h3>
              <p className="text-slate-600 dark:text-dark-muted leading-relaxed">
                {translate.driving.quizTypes.signsDesc}
              </p>
            </div>
            
            <button className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-lg transition-all shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40">
              היכנס
            </button>
          </div>
        </div>
      </section>

      {/* קטע מידע */}
      <section>
        <div className="glass-card p-8 border-l-4 border-l-blue-500 dark:border-l-blue-400">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="text-blue-500">ℹ️</span> {translate.infoSection.title}
          </h3>
          <ul className="space-y-3">
            {[
              translate.infoSection.description,
              translate.infoSection.adaptiveLearning,
              translate.infoSection.features
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default DrivingPage;
