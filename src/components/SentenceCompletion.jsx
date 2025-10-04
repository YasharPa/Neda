import { useState } from "react";
import "../styles/SentenceCompletion.css";
import { useSentceCompleation } from "../hooks/useSentcesCompletion";
import LoadingSpinner from "./LoadingSpinner";

export default function SentenceCompletion({ translate, language }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [current, setCurrent] = useState(0);

  const { questions, loading, error } = useSentceCompleation();

  if (questions.length === 0) return <p>אין שאלות להצגה</p>;

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
    <div>
      {loading && <LoadingSpinner translate={translate}></LoadingSpinner>}
      {error && (
        <div className="error-message">
          <p>Error loading questions. Please try again later.</p>
        </div>
      )}
      <div className="sentence-completion">
        <p className="sentence">{currentQuestion.question}</p>

        <div className="options">
          {currentQuestion.options.map((option) => (
            <button
              key={option.key}
              className={`option-btn ${
                selected === option.key
                  ? isCorrect
                    ? "correct"
                    : "incorrect"
                  : ""
              }`}
              onClick={() => handleSelect(option.key)}
              disabled={selected !== null}
            >
              {option.answer}
            </button>
          ))}
        </div>

        {selected && (
          <p className="feedback">
            {isCorrect
              ? translate.correctAnswer + ": "
              : translate.wrongAnswer + ". " + translate.theAnswerIs + ": "}
            {
              currentQuestion.options.find(
                (opt) => opt.key === currentQuestion.correctAnswer
              ).answer
            }
          </p>
        )}
        {selected && (
          <p className="explanation">
            {language === "he"
              ? currentQuestion.explanationInHE
              : currentQuestion.explanationInFA}
          </p>
        )}
        {selected && (
          <button className="next-btn" onClick={nextQuestion}>
            {translate.driving.quiz.nextQuestion}
          </button>
        )}
      </div>
    </div>
  );
}
