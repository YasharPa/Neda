import "../styles/WordCard.css";

const DIFFICULTY_COLORS = {
  easy: { bg: "#d4edda", border: "#28a745", text: "#155724", icon: "✅" },
  medium: { bg: "#fff3cd", border: "#ffc107", text: "#856404", icon: "⚠️" },
  hard: { bg: "#f8d7da", border: "#dc3545", text: "#721c24", icon: "🔥" },
};

const DIFFICULTY_LABELS = {
  easy: "קל",
  medium: "בינוני",
  hard: "קשה",
};

const WordCard = ({
  word,
  showDifficultyButtons = false,
  isUpdating = false,
  onUpdateDifficulty,
  onEdit, // הוספה חדשה
  onDelete,
  translate,
}) => {
  const colors = word.difficulty
    ? DIFFICULTY_COLORS[word.difficulty]
    : { bg: "#f8f9fa", border: "#dee2e6", text: "#495057" };

  const handleDifficultyClick = (difficulty) => {
    if (onUpdateDifficulty && !isUpdating) {
      onUpdateDifficulty(word.id, difficulty);
    }
  };

  const handleEdit = () => {
    if (onEdit && !isUpdating) {
      onEdit(word);
    }
  };

  const handleDelete = () => {
    if (
      onDelete &&
      window.confirm(
        `${
          translate?.wordCard?.confirmDelete ||
          "האם אתה בטוח שברצונך למחוק את המילה"
        } "${word.hebrew}"?`
      )
    ) {
      onDelete(word.id);
    }
  };

  return (
    <div
      className={`word-card ${isUpdating ? "updating" : ""}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <div className="card-actions">
        {onEdit && (
          <button
            className="edit-btn"
            onClick={handleEdit}
            title={translate?.wordCard?.edit || "ערוך מילה"}
            disabled={isUpdating}
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            className="delete-btn"
            onClick={handleDelete}
            title={translate?.wordCard?.delete || "מחק מילה"}
            disabled={isUpdating}
          >
            ❌
          </button>
        )}
      </div>

      <div className="word-hebrew">{word.hebrew}</div>
      <div className="word-persian">{word.persian}</div>
      {word.example && <div className="word-example">{word.example}</div>}

      {word.difficulty && (
        <div
          className="difficulty-badge"
          style={{ backgroundColor: colors.border, color: "white" }}
        >
          {DIFFICULTY_COLORS[word.difficulty].icon}{" "}
          {DIFFICULTY_LABELS[word.difficulty]}
        </div>
      )}

      {showDifficultyButtons && !isUpdating && (
        <div className="difficulty-buttons">
          <button
            className="difficulty-btn easy"
            onClick={() => handleDifficultyClick("easy")}
          >
            ✅ קל
          </button>
          <button
            className="difficulty-btn medium"
            onClick={() => handleDifficultyClick("medium")}
          >
            ⚠️ בינוני
          </button>
          <button
            className="difficulty-btn hard"
            onClick={() => handleDifficultyClick("hard")}
          >
            🔥 קשה
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="updating-indicator">
          <div className="spinner"></div>
          מעדכן...
        </div>
      )}
    </div>
  );
};

export default WordCard;
