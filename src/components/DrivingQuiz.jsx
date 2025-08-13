import { useState, useEffect } from "react";
import { drivingAPI } from "../lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/DrivingQuiz.css";

const DrivingQuiz = ({ translate, language = "he" }) => {
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
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    byCategory: {},
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await drivingAPI.getAllQuestions();

      if (error) {
        console.error("Error loading questions:", error);
        setError(translate.driving.quiz.loadingError);
        return;
      }

      if (data && data.length > 0) {
        setQuestions(data);
        await loadNextQuestion(data, []);
      } else {
        setError(translate.driving.quiz.noQuestions);
      }
    } catch (error) {
      console.error("Error in loadQuestions:", error);
      setError(translate.driving.quiz.loadingError);
    } finally {
      setLoading(false);
    }
  };

  // טעינת השאלה הבאה עם אלגוריתם חכם
  const loadNextQuestion = async (
    questionsData = questions,
    answeredQuestions = userAnswers
  ) => {
    const answeredIds = answeredQuestions.map((a) => a.questionId);

    if (answeredIds.length >= questionsData.length) {
      setQuizComplete(true);
      return;
    }

    // אם זו השאלה הראשונה
    if (answeredIds.length === 0) {
      const firstQuestion = questionsData[0];
      setCurrentQuestion(firstQuestion);
      setStartTime(Date.now());
      return;
    }

    try {
      // שימוש באלגוריתם החכם
      const { data: nextQuestion, error } =
        await drivingAPI.getSmartNextQuestion(answeredIds);

      if (error || !nextQuestion) {
        // fallback לשאלה רנדומלית
        const availableQuestions = questionsData.filter(
          (q) => !answeredIds.includes(q.id)
        );
        if (availableQuestions.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * availableQuestions.length
          );
          setCurrentQuestion(availableQuestions[randomIndex]);
        }
      } else {
        setCurrentQuestion(nextQuestion);
      }

      setStartTime(Date.now());
    } catch (error) {
      console.error("Error loading next question:", error);
    }
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion.correct_answer;
    const responseTime = startTime ? Date.now() - startTime : null;
    const category = currentQuestion.category;

    // שמירה ב-Supabase
    try {
      await drivingAPI.saveQuizResult(
        sessionId,
        currentQuestion.id,
        answerIndex,
        isCorrect,
        responseTime
      );
    } catch (error) {
      console.error("Error saving result:", error);
    }

    // עדכון תשובות המשתמש המקומיות
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      correct: isCorrect,
      category: category,
      responseTime: responseTime,
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    // עדכון סטטיסטיקות מקומיות
    setStats((prev) => {
      const newStats = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        byCategory: { ...prev.byCategory },
      };

      if (!newStats.byCategory[category]) {
        newStats.byCategory[category] = { correct: 0, total: 0 };
      }
      newStats.byCategory[category].total++;
      if (isCorrect) {
        newStats.byCategory[category].correct++;
      }

      return newStats;
    });
  };

  const handleNextQuestion = async () => {
    setSelectedAnswer(null);
    setShowResult(false);
    await loadNextQuestion(questions, userAnswers);
  };

  const resetQuiz = () => {
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers([]);
    setQuizComplete(false);
    setError(null);
    setStats({
      correct: 0,
      incorrect: 0,
      byCategory: {},
    });
    loadQuestions();
  };

  // פונקציה לקבלת התוכן לפי שפה
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

  if (loading) {
    return <LoadingSpinner translate={translate} message={translate.loading} />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>😔 {translate.loadingError}</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={loadQuestions}>
          🔄 {language === "he" ? "נסה שוב" : "دوباره امتحان کن"}
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="no-questions">
        <h2>😔 {translate.driving.quiz.noQuestions}</h2>
        <p>
          {language === "he"
            ? "אנא נסה שוב מאוחר יותר"
            : "لطفاً بعداً دوباره امتحان کنید"}
        </p>
      </div>
    );
  }

  if (quizComplete) {
    const totalQuestions = userAnswers.length;
    const successRate =
      totalQuestions > 0
        ? Math.round((stats.correct / totalQuestions) * 100)
        : 0;

    return (
      <div className="quiz-complete">
        <div className="completion-header">
          <h2>🎉 {translate.quiz.quizComplete}</h2>
          <div className="final-score">
            <span className="score-percentage">{successRate}%</span>
            <span className="score-details">
              ({stats.correct}/{totalQuestions})
            </span>
          </div>
        </div>

        <div className="stats-breakdown">
          <h3>📊 {translate.quiz.categoryBreakdown}</h3>
          {Object.entries(stats.byCategory).map(([category, categoryStats]) => {
            const rate =
              categoryStats.total > 0
                ? Math.round(
                    (categoryStats.correct / categoryStats.total) * 100
                  )
                : 0;
            return (
              <div key={category} className="category-stat">
                <span className="category-name">{category}</span>
                <div className="category-progress">
                  <div
                    className="category-fill"
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
                <span className="category-score">{rate}%</span>
              </div>
            );
          })}
        </div>

        <div className="completion-actions">
          <button className="restart-btn" onClick={resetQuiz}>
            🔄 {translate.driving.quiz.restartQuiz}
          </button>
        </div>
      </div>
    );
  }

  const questionContent = getQuestionContent(currentQuestion);
  if (!questionContent) {
    return <LoadingSpinner message={translate.driving.quiz.loading} />;
  }

  const progress =
    questions.length > 0
      ? ((userAnswers.length + 1) / questions.length) * 100
      : 0;

  return (
    <div className="driving-quiz">
      {/* פס התקדמות */}
      <div className="quiz-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {translate.question} {userAnswers.length + 1} {translate.of}{" "}
          {questions.length}
        </span>
      </div>

      {/* סטטיסטיקות נוכחיות */}
      <div className="current-stats">
        <div className="stat-item correct">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{stats.correct}</span>
          <span className="stat-label">{translate.driving.quiz.correct}</span>
        </div>
        <div className="stat-item incorrect">
          <span className="stat-icon">❌</span>
          <span className="stat-value">{stats.incorrect}</span>
          <span className="stat-label">{translate.driving.quiz.incorrect}</span>
        </div>
      </div>

      {/* השאלה */}
      <div className="question-container">
        <div className="question-category">📂 {questionContent.category}</div>
        <h2 className="question-text">{questionContent.question}</h2>

        <div className="options-container">
          {questionContent.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${
                selectedAnswer === index
                  ? index === currentQuestion.correct_answer
                    ? "correct"
                    : "incorrect"
                  : ""
              } ${
                showResult && index === currentQuestion.correct_answer
                  ? "correct-answer"
                  : ""
              }`}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="option-text">{option}</span>
              {showResult && index === currentQuestion.correct_answer && (
                <span className="correct-indicator">✓</span>
              )}
              {showResult &&
                selectedAnswer === index &&
                index !== currentQuestion.correct_answer && (
                  <span className="incorrect-indicator">✗</span>
                )}
            </button>
          ))}
        </div>

        {/* תוצאה והסבר */}
        {showResult && (
          <div className="result-container">
            <div
              className={`result-feedback ${
                selectedAnswer === currentQuestion.correct_answer
                  ? "correct"
                  : "incorrect"
              }`}
            >
              {selectedAnswer === currentQuestion.correct_answer ? (
                <>
                  <span className="result-icon">🎉</span>
                  <span className="result-text">
                    {translate.driving.quiz.correctAnswer}
                  </span>
                </>
              ) : (
                <>
                  <span className="result-icon">😔</span>
                  <span className="result-text">
                    {translate.driving.quiz.wrongAnswer}
                  </span>
                </>
              )}
            </div>

            <div className="explanation">
              <h4>💡 {translate.driving.quiz.explanation}</h4>
              <p>{questionContent.explanation}</p>
            </div>

            <button className="next-btn" onClick={handleNextQuestion}>
              {userAnswers.length >= questions.length - 1
                ? `🏁 ${translate.driving.quiz.finishQuiz}`
                : `➡️ ${translate.driving.quiz.nextQuestion}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrivingQuiz;
