import { useState, useEffect, useMemo, useRef } from "react";
import { useSentceCompleation } from "../hooks/useSentcesCompletion";
import { useAuth } from "../hooks/useAuth";
import { sentenceCompletionAPI } from "../lib/supabaseClient";
import { shuffleArray } from "../lib/shuffle";
import LoadingSpinner from "./LoadingSpinner";
import Speaker from "./Speaker";
import { OptionButton, SettingRow } from "./SetupOptions";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const QUESTION_COUNTS = [10, 20, "all"];
const BLANK = "___";

const getCorrectOption = (question) =>
  question.options.find((opt) => opt.key === question.correctAnswer);

// משפט עם החסר, או עם התשובה הנכונה בתוכו אחרי שענו
const Sentence = ({ text, fill }) => {
  const [before, after] = text.split(BLANK);
  return (
    <>
      {before}
      {fill ? (
        <span className="text-emerald-600 dark:text-emerald-400 underline decoration-2 underline-offset-8">
          {fill}
        </span>
      ) : (
        <span className="inline-block min-w-[4rem] border-b-4 border-brand-400 mx-1 align-baseline">&nbsp;</span>
      )}
      {after}
    </>
  );
};

export default function SentenceCompletion({ translate, language }) {
  const t = translate.sentenceCompletion;
  const { user } = useAuth();
  const { questions, loading, error, fetchData } = useSentceCompleation();

  const [difficulty, setDifficulty] = useState("all");
  const [topic, setTopic] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);

  const [round, setRound] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savedRef = useRef(false);

  const topics = useMemo(
    () => [...new Set(questions.map((q) => q.topic).filter(Boolean))],
    [questions],
  );

  const available = useMemo(
    () =>
      questions.filter(
        (q) =>
          (difficulty === "all" || q.difficulty === difficulty) &&
          (topic === "all" || q.topic === topic),
      ),
    [questions, difficulty, topic],
  );

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const mistakes = answers.filter((a) => !a.isCorrect).map((a) => a.question);

  const startRound = (list) => {
    // גם סדר התשובות מתערבב, כדי שלא יזכרו מיקום
    setRound(list.map((q) => ({ ...q, options: shuffleArray(q.options) })));
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
    setSaveError(false);
    savedRef.current = false;
  };

  const handleStart = () => {
    const shuffled = shuffleArray(available);
    startRound(questionCount === "all" ? shuffled : shuffled.slice(0, questionCount));
  };

  const resetRound = () => {
    setRound([]);
    setAnswers([]);
    setFinished(false);
  };

  const endRound = () => {
    if (answers.length === 0) {
      resetRound();
      return;
    }
    setFinished(true);
  };

  const currentQuestion = round[current];
  const isCorrect = selected !== null && selected === currentQuestion?.correctAnswer;

  const handleSelect = (key) => {
    if (selected !== null) return;
    setSelected(key);
    setAnswers((prev) => [
      ...prev,
      { question: currentQuestion, isCorrect: key === currentQuestion.correctAnswer },
    ]);
  };

  const nextQuestion = () => {
    if (current + 1 >= round.length) {
      endRound();
      return;
    }
    setSelected(null);
    setCurrent((prev) => prev + 1);
  };

  // שמירת הסבב בסיומו
  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    sentenceCompletionAPI
      .saveSession({ total: answers.length, correct: correctCount }, user?.id)
      .then(({ error }) => setSaveError(Boolean(error)));
  }, [finished, answers.length, correctCount, user]);

  // קיצורי מקלדת: 1-4 לבחירה, Enter לשאלה הבאה
  useEffect(() => {
    if (!currentQuestion || finished) return;
    const handleKey = (e) => {
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(e.target.tagName)) return;
      const index = Number(e.key) - 1;
      if (selected === null && index >= 0 && index < currentQuestion.options.length) {
        handleSelect(currentQuestion.options[index].key);
      } else if (selected !== null && e.key === "Enter") {
        nextQuestion();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (loading) return <LoadingSpinner translate={translate} />;

  if (error) {
    return (
      <div className="glass-card p-8 text-center flex flex-col items-center gap-4">
        <p className="m-0 text-red-600 dark:text-red-400 font-medium">{t.loadError}</p>
        <button
          onClick={fetchData}
          className="bg-brand-600 text-white rounded-xl py-3 px-6 font-bold hover:bg-brand-500 transition-colors"
        >
          {translate.errors.tryAgain}
        </button>
      </div>
    );
  }

  // ── מסך סיכום ──

  if (finished) {
    const percentage = Math.round((correctCount / answers.length) * 100);
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <div className="glass-card p-8 text-center flex flex-col items-center gap-3">
          <div className="text-5xl">{percentage >= 80 ? "🏆" : "💪"}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 m-0">
            {t.summaryTitle}
          </h2>
          <div className="text-5xl font-bold text-brand-600 dark:text-brand-400">{percentage}%</div>
          <p className="m-0 text-slate-600 dark:text-dark-muted font-medium">
            {correctCount} {t.of} {answers.length} {t.correctLabel}
          </p>
          {saveError && <p className="text-sm text-red-600 dark:text-red-400 m-0">{t.saveError}</p>}
        </div>

        {mistakes.length > 0 && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="m-0 text-xl font-bold text-slate-800 dark:text-slate-100">{t.mistakes}</h3>
            {mistakes.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="m-0 text-lg font-bold text-slate-800 dark:text-slate-100">
                    <Sentence text={q.question} fill={getCorrectOption(q).answer} />
                  </p>
                  <Speaker text={q.question.replace(BLANK, getCorrectOption(q).answer)} lang="he-IL" />
                </div>
                {q.translationFA && (
                  <p className="m-0 text-slate-500 dark:text-slate-400">{q.translationFA}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {mistakes.length > 0 && (
            <button
              onClick={() => startRound(shuffleArray(mistakes))}
              className="bg-brand-600 text-white rounded-xl py-3 px-6 font-bold transition-all duration-300 hover:bg-brand-500 shadow-md shadow-brand-500/20"
            >
              {t.repeatMistakes} ({mistakes.length})
            </button>
          )}
          <button
            onClick={resetRound}
            className="glass-card-interactive py-3 px-6 font-bold text-slate-700 dark:text-slate-200"
          >
            {t.newSession}
          </button>
        </div>
      </div>
    );
  }

  // ── מסך תרגול ──

  if (currentQuestion) {
    const correctOption = getCorrectOption(currentQuestion);
    const progress = Math.round((answers.length / round.length) * 100);
    const isLast = current + 1 >= round.length;

    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-600 dark:text-dark-muted">
            {t.question} {current + 1} {t.of} {round.length}
            <span className="mx-2 text-emerald-600 dark:text-emerald-400">· ✓ {correctCount}</span>
          </div>
          <button
            onClick={endRound}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.endSession}
          </button>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="glass-card p-6 md:p-10 flex flex-col gap-8">
          <div className="flex flex-col items-center gap-3">
            {currentQuestion.topic && t.topics[currentQuestion.topic] && (
              <span className="text-xs font-semibold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-full">
                {t.topics[currentQuestion.topic]}
              </span>
            )}
            <div className="w-full bg-brand-50/50 dark:bg-brand-900/20 p-6 rounded-2xl border border-brand-100 dark:border-brand-800/50">
              <p className="text-2xl md:text-3xl text-center font-bold text-slate-800 dark:text-slate-100 leading-relaxed m-0">
                <Sentence
                  text={currentQuestion.question}
                  fill={selected !== null ? correctOption.answer : null}
                />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              let btnClass = "w-full text-lg md:text-xl p-4 md:p-5 rounded-2xl font-bold transition-all duration-300 border-2 flex items-center gap-3 ";

              if (selected === null) {
                btnClass += "bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 text-slate-700 dark:text-slate-200 hover:shadow-md hover:-translate-y-1 cursor-pointer";
              } else if (selected === option.key) {
                btnClass += isCorrect
                  ? "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                  : "bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30 scale-[1.02]";
              } else if (option.key === currentQuestion.correctAnswer) {
                btnClass += "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300";
              } else {
                btnClass += "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed";
              }

              return (
                <div key={option.key} className="flex items-center gap-2">
                  <button
                    className={btnClass}
                    onClick={() => handleSelect(option.key)}
                    disabled={selected !== null}
                  >
                    <span className="hidden md:inline text-sm opacity-50">{index + 1}</span>
                    <span className="flex-1">{option.answer}</span>
                  </button>
                  {/* הקראת התשובה – לשמוע את ההבדל בין זכר לנקבה */}
                  <Speaker text={option.answer} lang="he-IL" size="small" />
                </div>
              );
            })}
          </div>

          {selected !== null && (
            <div className={`p-6 rounded-2xl flex flex-col gap-3 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50"} animate-slide-up`}>
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xl font-bold m-0 ${isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                  {isCorrect
                    ? translate.correctAnswer + "!"
                    : translate.wrongAnswer + ". " + translate.theAnswerIs + ": " + correctOption.answer}
                </p>
                <Speaker text={currentQuestion.question.replace(BLANK, correctOption.answer)} lang="he-IL" />
              </div>

              {currentQuestion.translationFA && (
                <p className="m-0 text-slate-700 dark:text-slate-300">
                  <span className="font-bold">{t.translation}: </span>
                  {currentQuestion.translationFA}
                </p>
              )}

              <p className="text-slate-700 dark:text-slate-300 text-lg m-0">
                {language === "he" ? currentQuestion.explanationInHE : currentQuestion.explanationInFA}
              </p>
            </div>
          )}

          {selected !== null && (
            <button
              className="mt-2 w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all hover:-translate-y-1 animate-slide-up"
              onClick={nextQuestion}
            >
              {isLast ? t.finish : translate.driving.quiz.nextQuestion}
            </button>
          )}
        </div>

        <p className="hidden md:block text-center text-xs text-slate-400 dark:text-slate-500 m-0">
          {t.keyboardHint}
        </p>
      </div>
    );
  }

  // ── מסך הגדרות ──

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
        <h2 className="m-0 text-xl font-bold text-slate-800 dark:text-slate-100">{t.setupTitle}</h2>

        <SettingRow label={t.difficulty}>
          {DIFFICULTIES.map((level) => (
            <OptionButton key={level} active={difficulty === level} onClick={() => setDifficulty(level)}>
              {translate.filterBar[level]}
            </OptionButton>
          ))}
        </SettingRow>

        {topics.length > 0 && (
          <SettingRow label={t.topic}>
            <OptionButton active={topic === "all"} onClick={() => setTopic("all")}>
              {t.allTopics}
            </OptionButton>
            {topics.map((key) => (
              <OptionButton key={key} active={topic === key} onClick={() => setTopic(key)}>
                {t.topics[key] || key}
              </OptionButton>
            ))}
          </SettingRow>
        )}

        <SettingRow label={t.questionCount}>
          {QUESTION_COUNTS.map((count) => (
            <OptionButton key={count} active={questionCount === count} onClick={() => setQuestionCount(count)}>
              {count === "all" ? t.all : count}
            </OptionButton>
          ))}
        </SettingRow>
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-dark-muted">
          {available.length > 0 ? `${available.length} ${t.available}` : t.noQuestions}
        </span>
        <button
          onClick={handleStart}
          disabled={available.length === 0}
          className="w-full sm:w-auto bg-brand-600 text-white rounded-xl py-4 px-12 text-lg font-bold transition-all duration-300 hover:bg-brand-500 shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t.start}
        </button>
      </div>
    </div>
  );
}
