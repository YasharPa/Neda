import { useState, useEffect } from "react";
import { drivingAPI } from "../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import Speaker from "./Speaker";

const LETTERS = ["א", "ב", "ג", "ד"];

const DrivingQuiz = ({
  translate,
  language = "he",
  maxQuestions = 30,
  onBack,
}) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [startTime, setStartTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    byCategory: {},
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

  const handleAnswerSelect = async (answerIndex) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion.correct_answer;
    const responseTime = startTime ? Date.now() - startTime : null;
    const category = currentQuestion.category;

    try {
      await drivingAPI.saveQuizResult(
        sessionId,
        currentQuestion.id,
        answerIndex,
        isCorrect,
        responseTime,
      );
    } catch {
      /* add erorr handaling here */
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
        <p className="text-base text-red-700">{error}</p>
        <button
          onClick={loadQuestions}
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white active:scale-95"
        >
          {translate?.errors?.tryAgain}
        </button>
      </div>
    );

  if (questions.length === 0)
    return (
      <div dir="rtl" className="p-10 text-center text-base text-gray-500">
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
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h2 className="mb-3 text-xl font-medium text-gray-900">
            {translate.driving.quiz.quizComplete}
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {questions.length} שאלות הושלמו
          </p>
          <span className="block text-5xl font-medium text-green-700">
            {successRate}%
          </span>
          <span className="mt-1 block text-sm text-gray-500">
            ({stats.correct}/{totalQuestions})
          </span>
        </div>

        {/* category breakdown */}
        {Object.keys(stats.byCategory).length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-base font-medium text-gray-800">
              פירוט לפי נושאים
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
                      <span className="text-gray-700">{category}</span>
                      <span className="font-medium text-green-700">
                        {rate}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-green-600 transition-all duration-700"
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
            className="w-full rounded-lg bg-red-700 py-3 text-sm font-medium text-white active:scale-95 sm:w-auto sm:px-8"
          >
            {translate.driving.quiz.restartQuiz}
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 active:scale-95 sm:w-auto sm:px-8"
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
      return "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-[0.99] cursor-pointer";
    }
    if (isCorrect) return "border-green-600 bg-green-50 cursor-default";
    if (isSelected && !isCorrect)
      return "border-red-600 bg-red-50 cursor-default";
    return "border-gray-200 bg-white opacity-60 cursor-default";
  };

  const letterClass = (index) => {
    const isSelected = selectedAnswer === index;
    const isCorrect = index === currentQuestion.correct_answer;

    if (!showResult) return "bg-gray-100 text-gray-600";
    if (isCorrect) return "bg-green-600 text-white";
    if (isSelected && !isCorrect) return "bg-red-600 text-white";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div dir="rtl" className="mx-auto max-w-xl space-y-3 p-4">
      {/* ── Progress bar (sticky) ── */}
      <div className="sticky top-0 z-10 rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {translate.driving.quiz.question} {currentQuestionIndex + 1}{" "}
            {translate.driving.quiz.of} {questions.length}
          </span>
          <div className="flex gap-4">
            <span className="font-medium text-green-700">
              ✓ {stats.correct}
            </span>
            <span className="font-medium text-red-700">
              ✗ {stats.incorrect}
            </span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Question card ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <span className="mb-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
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
              className="w-full object-contain"
              style={{ maxHeight: "220px" }}
              onError={(e) => {
                e.target.style.display = "none";
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
          <p className="text-base font-medium leading-relaxed text-gray-900">
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
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-right transition-colors duration-150 ${optionClass(index)}`}
            >
              {/* letter badge */}
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${letterClass(index)}`}
              >
                {LETTERS[index]}
              </span>

              {/* option text */}
              <span className="flex-1 text-sm leading-snug text-gray-800">
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
                <span className="text-base text-green-700">✓</span>
              )}
              {showResult &&
                selectedAnswer === index &&
                index !== currentQuestion.correct_answer && (
                  <span className="text-base text-red-700">✗</span>
                )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result + explanation ── */}
      {showResult && (
        <div className="space-y-3">
          {/* explanation */}
          <div className="rounded-lg border-r-4 border-blue-700 bg-blue-50 px-4 py-3">
            <p className="mb-1 text-s font-medium text-blue-800 font-bold">
              {translate.driving.quiz.explanation}
            </p>
            <p className="text-sm leading-relaxed text-blue-900">
              {questionContent.explanation}
            </p>
          </div>

          {/* next button — sticky at bottom on mobile */}
          <div className="sticky bottom-4">
            <button
              onClick={handleNextQuestion}
              className="w-full rounded-lg bg-blue-500 py-3.5 text-sm font-medium text-white shadow-md active:scale-[0.99]"
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
