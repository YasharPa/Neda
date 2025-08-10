import { useState } from "react";
import "../styles/Flashcard.css";

export default function Flashcard({ hebrew, persian, example }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flashcard ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="front">{hebrew}</div>
      <div className="back">
        <p>{persian}</p>
        <p>{example}</p>
      </div>
    </div>
  );
}
