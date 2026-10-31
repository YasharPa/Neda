import { useState, useEffect, useRef } from "react";
import { drivingAPI } from "../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import { shuffleArray } from "../lib/shuffle";
import Speaker from "./Speaker";
import { useAuth } from "../hooks/useAuth";

const LETTERS = ["א", "ב", "ג", "ד"];

const DrivingQuiz = ({
  translate,
  language = "he",
  maxQuestions = 30,
  onBack,
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [startTime, setStartTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    byCategory: {},
  });
  // שמירות התשובות רצות אחת אחרי השנייה, כדי שעדכוני הסטטיסטיקה לא יתנגשו
  const saveQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await drivingAPI.getAllQuestions();
      if (error) {
        setError(translate.driving.quiz.loadingError);
        return;
      }
      if (data && data.length > 0) {
        const shuffled = shuffleArray(data);
        const limited =
          maxQuestions > 0 && maxQuestions < shuffled.length
            ? shuffled.slice(0, maxQuestions)
            : shuffled;
        setQuestions(limited);
        if (limited.length > 0) {
          setCurrentQuestion(limited[0]);
          setCurrentQuestionIndex(0);
          setStartTime(Date.now());
        }
      } else {
        setError(translate.driving.quiz.noQuestions);
      }
    } catch {
      setError(translate.driving.quiz.loadingError);
    } finally {
      setLoading(false);
    }
  };

  const loadNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) {
      setQuizComplete(true);
      return;
    }

    setCurrentQuestion(questions[nextIndex]);
    setCurrentQuestionIndex(nextIndex);
    setStartTime(Date.now());
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion.correct_answer;
    const responseTime = startTime ? Date.now() - startTime : null;
    const category = currentQuestion.category;

    // שמירת תוצאה לסטטיסטיקות רק למשתמש מחובר, ברקע – הניקוד המקומי לא מחכה לרשת
    if (user) {
      const questionId = currentQuestion.id;
      saveQueueRef.current = saveQueueRef.current.then(() =>
        drivingAPI.saveQuizResult(
          sessionId,
          questionId,
          answerIndex,
          isCorrect,
          responseTime,
          user.id,
        ),
      );
    }

    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correct: isCorrect,
      category,
      responseTime,
    };

    setUserAnswers((prev) => [...prev, newAnswer]);

    setStats((prev) => {
      const newStats = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        byCategory: { ...prev.byCategory },
      };
      if (!newStats.byCategory[category])
        newStats.byCategory[category] = { correct: 0, total: 0 };
      newStats.byCategory[category].total++;
      if (isCorrect) newStats.byCategory[category].correct++;
      return newStats;
    });
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    loadNextQuestion();
  };

  const resetQuiz = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers([]);
    setQuizComplete(false);
    setError(null);
    setCurrentQuestionIndex(0);
    setStats({ correct: 0, incorrect: 0, byCategory: {} });
    // כל סבב חדש נשמר תחת מזהה סשן משלו
    setSessionId(crypto.randomUUID());
    loadQuestions();
  };

  const getQuestionContent = (question) => {
    if (!question) return null;
    return {
      question: language === "he" ? question.question_he : question.question_fa,
      options: [
        language === "he" ? question.option_a_he : question.option_a_fa,
        language === "he" ? question.option_b_he : question.option_b_fa,
        language === "he" ? question.option_c_he : question.option_c_fa,
        language === "he" ? question.option_d_he : question.option_d_fa,
      ],
      explanation:
        language === "he" ? question.explanation_he : question.explanation_fa,
      category: question.category,
    };
  };

  /* ── Loading / Error / Empty ───────────────────────────────────────────── */

  if (loading) return <LoadingSpinner translate={translate} />;

  if (error)
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center gap-4 p-10 text-center"
      >
        <p className="text-base text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadQuestions}
          className="rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all active:scale-95"
        >
          {translate?.errors?.tryAgain}
        </button>
      </div>
    );

  if (questions.length === 0)
    return (
      <div dir="rtl" className="p-10 text-center text-base text-slate-500 dark:text-dark-muted">
        {translate?.driving.quiz.noQuestions}
      </div>
    );

  /* ── Quiz Complete ─────────────────────────────────────────────────────── */

  if (quizComplete) {
    const totalQuestions = userAnswers.length;
    const successRate =
      totalQuestions > 0
        ? Math.round((stats.correct / totalQuestions) * 100)
        : 0;

    return (
      <div dir="rtl" className="mx-auto max-w-xl space-y-4 p-4">
        {/* score header */}
        <div className="glass-card p-6 text-center">
          <h2 className="mb-3 text-xl font-bold text-slate-800 dark:text-slate-100">
            {translate.driving.quiz.quizComplete}
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-dark-muted">
            {questions.length} {translate?.driving?.quiz?.questionsCompleted}
          </p>
          <span className="block text-5xl font-bold text-emerald-600 dark:text-emerald-400">
            {successRate}%
          </span>
          <span className="mt-1 block text-sm text-slate-500 dark:text-dark-muted">
            ({stats.correct}/{totalQuestions})
          </span>
        </div>

        {/* category breakdown */}
        {Object.keys(stats.byCategory).length > 0 && (
          <div className="glass-card p-5">
            <h3 className="mb-4 text-base font-bold text-slate-800 dark:text-slate-100">
              {translate?.driving?.quiz?.categoryBreakdown}
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([category, catStats]) => {
                const rate =
                  catStats.total > 0
                    ? Math.round((catStats.correct / catStats.total) * 100)
                    : 0;
                return (
                  <div key={category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{category}</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {rate}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 ease-out"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={resetQuiz}
            className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all active:scale-95 sm:w-auto sm:px-8"
          >
            {translate.driving.quiz.restartQuiz}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95 sm:w-auto sm:px-8"
            >
              ← {translate.driving.backToMenu}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Active Quiz ───────────────────────────────────────────────────────── */

  const questionContent = getQuestionContent(currentQuestion);
  if (!questionContent) return <LoadingSpinner translate={translate} />;

  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const optionClass = (index) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = index === currentQuestion.correct_answer;

    if (!showResult) {
      return "border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-surface hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 active:scale-[0.99] cursor-pointer";
    }
    if (isCorrect) return "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-default";
    if (isSelected && !isCorrect)
      return "border-red-500 bg-red-50 dark:bg-red-900/20 cursor-default";
    return "border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-surface opacity-60 cursor-default";
  };

  const letterClass = (index) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = index === currentQuestion.correct_answer;

    if (!showResult) return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    if (isCorrect) return "bg-emerald-500 text-white";
    if (isSelected && !isCorrect) return "bg-red-600 text-white";
    return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
  };

  return (
    <div dir="rtl" className="mx-auto max-w-xl space-y-3 p-4">
      {/* ── Progress bar (sticky) ── */}
      <div className="sticky top-0 z-10 glass-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-dark-muted">
            {translate.driving.quiz.question} {currentQuestionIndex + 1}{" "}
            {translate.driving.quiz.of} {questions.length}
          </span>
          <div className="flex gap-4">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              ✓ {stats.correct}
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              ✗ {stats.incorrect}
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!user && (
          <p className="mt-2 mb-0 text-xs text-slate-500 dark:text-dark-muted">
            {translate?.guest?.progressNotSaved}
          </p>
        )}
      </div>

      {/* ── Question card ── */}
      <div className="glass-card p-5">
        <span className="mb-3 inline-block rounded-full bg-brand-100 dark:bg-brand-900/30 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
          {questionContent.category}
        </span>

        {/* image */}
        {currentQuestion.image_url && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={currentQuestion.image_url}
              alt={
                language === "he"
                  ? currentQuestion.image_alt_he
                  : currentQuestion.image_alt_fa
              }
              className="w-full object-contain max-h-[220px]"
              onError={(e) => {
                e.target.classList.add("hidden");
              }}
            />
          </div>
        )}

        {/* question text */}
        <div className="mb-5 flex items-start gap-2">
          <Speaker
            text={questionContent.question}
            lang={language === "he" ? "he-IL" : "fa-IR"}
          />
          <p className="text-base font-medium leading-relaxed text-slate-800 dark:text-slate-100">
            {questionContent.question}
          </p>
        </div>

        {/* answer options */}
        <div className="space-y-2">
          {questionContent.options.map((option, index) => (
            <button
              key={index}
              disabled={showResult}
              onClick={() => handleAnswerSelect(index)}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-right transition-colors duration-150 ${optionClass(index)}`}
            >
              {/* letter badge */}
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${letterClass(index)}`}
              >
                {LETTERS[index]}
              </span>

              {/* option text */}
              <span className="flex-1 text-sm leading-snug text-slate-800 dark:text-slate-200">
                {option}
              </span>

              {/* speaker */}
              <span onClick={(e) => e.stopPropagation()}>
                <Speaker
                  text={option}
                  lang={language === "he" ? "he-IL" : "fa-IR"}
                />
              </span>

              {/* indicator */}
              {showResult && index === currentQuestion.correct_answer && (
                <span className="text-base text-emerald-600 dark:text-emerald-400">✓</span>
              )}
              {showResult &&
                selectedAnswer === index &&
                index !== currentQuestion.correct_answer && (
                  <span className="text-base text-red-600 dark:text-red-400">✗</span>
                )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result + explanation ── */}
      {showResult && (
        <div className="space-y-3">
          {/* explanation */}
          <div className="rounded-xl border-r-4 border-brand-600 bg-brand-50 dark:bg-brand-900/20 px-4 py-3">
            <p className="mb-1 text-sm font-bold text-brand-800 dark:text-brand-300">
              {translate.driving.quiz.explanation}
            </p>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {questionContent.explanation}
            </p>
          </div>

          {/* next button — sticky at bottom on mobile */}
          <div className="sticky bottom-4">
            <button
              onClick={handleNextQuestion}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-500 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 transition-all active:scale-[0.99]"
            >
              {currentQuestionIndex >= questions.length - 1
                ? `${translate.driving.quiz.finishQuiz}`
                : `${translate.driving.quiz.nextQuestion} ←`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrivingQuiz;
