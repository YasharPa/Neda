import { useState } from "react";
import { useSentceCompleation } from "../hooks/useSentcesCompletion";
import LoadingSpinner from "./LoadingSpinner";

export default function SentenceCompletion({ translate, language }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [current, setCurrent] = useState(0);

  const { questions, loading, error } = useSentceCompleation();
  
  if (loading) return <LoadingSpinner translate={translate}></LoadingSpinner>;
  if (questions.length === 0) return <div className="text-center p-8 text-slate-500 dark:text-slate-400">אין שאלות להצגה</div>;

  const currentQuestion = questions[current];
  const handleSelect = (option) => {
    setSelected(option);
    setIsCorrect(option == currentQuestion.correctAnswer);
  };

  const nextQuestion = () => {
    setSelected(null);
    setIsCorrect(null);
    setCurrent((prev) => (prev + 1) % questions.length);
  };
  
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-center font-medium">
            Error loading questions. Please try again later.
          </div>
        )}
        
        <div className="glass-card p-6 md:p-10 flex flex-col gap-8">
          <div className="bg-brand-50/50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-800/50">
            <p className="text-2xl md:text-3xl text-center font-bold text-slate-800 dark:text-slate-100 leading-relaxed m-0">
              {currentQuestion.question}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option) => {
              let btnClass = "w-full text-lg md:text-xl p-4 md:p-5 rounded-2xl font-bold transition-all duration-300 border-2 ";
              
              if (selected === null) {
                btnClass += "bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 text-slate-700 dark:text-slate-200 hover:shadow-md hover:-translate-y-1 cursor-pointer";
              } else if (selected === option.key) {
                btnClass += isCorrect 
                  ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]" 
                  : "bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]";
              } else if (option.key == currentQuestion.correctAnswer) {
                btnClass += "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 opacity-80";
              } else {
                btnClass += "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed";
              }

              return (
                <button
                  key={option.key}
                  className={btnClass}
                  onClick={() => handleSelect(option.key)}
                  disabled={selected !== null}
                >
                  {option.answer}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className={`p-6 rounded-2xl flex flex-col gap-3 ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'} animate-slide-up`}>
              <p className={`text-xl font-bold m-0 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {isCorrect
                  ? translate.correctAnswer + ": "
                  : translate.wrongAnswer + ". " + translate.theAnswerIs + ": "}
                {currentQuestion.options.find((opt) => opt.key === currentQuestion.correctAnswer).answer}
              </p>
              
              <p className="text-slate-700 dark:text-slate-300 text-lg m-0">
                {language === "he" ? currentQuestion.explanationInHE : currentQuestion.explanationInFA}
              </p>
            </div>
          )}
          
          {selected && (
            <button 
              className="mt-2 w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:-translate-y-1 animate-slide-up" 
              onClick={nextQuestion}
            >
              {translate.driving.quiz.nextQuestion}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
