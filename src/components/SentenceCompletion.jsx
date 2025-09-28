import { useState } from "react";
import "../styles/SentenceCompletion.css";

export default function SentenceCompletion({ translate }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [current, setCurrent] = useState(0);

  const fakeData = [
    {
      id: 1,
      question: "I ____ to school every day.",
      answer: "go",
      options: ["go", "goes", "went", "wont"],
      explanation:
        "The correct answer is 'go' because the subject is 'I', which takes the base form of the verb.",
    },
    {
      id: 2,
      question: "She ____ pizza every Friday.",
      answer: "eats",
      options: ["eat", "eats", "eating", "ate"],
      explanation:
        "The correct answer is 'eats' because the subject is 'She', which takes the third person singular form of the verb.",
    },
  ];

  const currentQuestion = fakeData[current];

  const handleSelect = (option) => {
    setSelected(option);
    setIsCorrect(option === currentQuestion.answer);
  };

  const nextQuestion = () => {
    setSelected(null);
    setIsCorrect(null);
    setCurrent((prev) => (prev + 1) % fakeData.length);
  };

  return (
    <div>
      <div className="sentence-completion">
        <p className="sentence">{currentQuestion.question}</p>

        <div className="options">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              className={`option-btn ${
                selected === option ? (isCorrect ? "correct" : "incorrect") : ""
              }`}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
            >
              {option}
            </button>
          ))}
        </div>

        {selected && (
          <p className="feedback">
            {isCorrect
              ? translate.correctAnswer
              : translate.wrongAnswer + ". " + translate.theAnswerIs}
            : {currentQuestion.answer}
          </p>
        )}
        {selected && (
          <p className="explanation">{currentQuestion.explanation}</p>
        )}
        {selected && (
          <button className="next-btn" onClick={nextQuestion}>
            שאלה הבאה
          </button>
        )}
      </div>
    </div>
  );
}
