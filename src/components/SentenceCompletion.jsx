import { useState } from "react";
import "../styles/SentenceCompletion.css";

export default function SentenceCompletion({ text, options, answer }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleSelect = (option) => {
    setSelected(option);
    setIsCorrect(option === answer);
  };

  return (
    <div className="sentence-completion">
      <p className="sentence">{text}</p>
      <div className="options">
        {options.map((option, i) => (
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
            : `❌ תשובה שגויה. התשובה היא: ${answer}`}
        </p>
      )}
    </div>
  );
}
