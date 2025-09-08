import { useEffect, useState } from "react";
import "../styles/SentenceCompletion.css";
import { useVocabulary } from "../hooks/useVocabulary";

export default function SentenceCompletion() {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [current, setCurrent] = useState(0);
  useEffect(() => {});
  // const { words } = useVocabulary();
  const fakeData = [
    {
      id: 1,
      question: "I ____ to school every day.",
      answer: "go",
      options: ["go", "goes", "went", "wont"],
    },
    {
      id: 2,
      question: "She ____ pizza every Friday.",
      answer: "eats",
      options: ["eat", "eats", "eating", "ate"],
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
      <h2>השלמת משפטים</h2>
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
              ? "✅ תשובה נכונה!"
              : `❌ תשובה שגויה. התשובה היא: ${currentQuestion.answer}`}
          </p>
        )}

        {selected && (
          <button className="next-btn" onClick={nextQuestion}>
            שאלה הבאה ➡️
          </button>
        )}
      </div>
    </div>
  );
}
