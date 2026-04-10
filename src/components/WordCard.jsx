import { useDraggable } from "@dnd-kit/core";

const DIFFICULTY_COLORS = {
  easy: { bg: "#d4edda", border: "#28a745", text: "#155724", icon: "✅" },
  medium: { bg: "#fff3cd", border: "#ffc107", text: "#856404", icon: "⚠️" },
  hard: { bg: "#f8d7da", border: "#dc3545", text: "#721c24", icon: "🔥" },
};

const WordCard = ({
  word,
  showDifficultyButtons = false,
  isUpdating = false,
  onUpdateDifficulty,
  onEdit,
  onDelete,
  translate,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: word.id,
    data: { word },
  });

  const dragStyle = {
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
  };

  const colors = word.difficulty
    ? DIFFICULTY_COLORS[word.difficulty]
    : { bg: "#f8f9fa", border: "#dee2e6", text: "#495057" };

  const handleDifficultyClick = (e, difficulty) => {
    e.stopPropagation();
    if (onUpdateDifficulty && !isUpdating) {
      onUpdateDifficulty(word.id, difficulty);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit && !isUpdating) {
      onEdit(word);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (
      onDelete &&
      window.confirm(
        `${
          translate?.wordCard?.confirmDelete ||
          "האם אתה בטוח שברצונך למחוק את המילה"
        } "${word.hebrew}"?`,
      )
    ) {
      onDelete(word.id);
    }
  };
  const sharedBtnClasses =
    "text-white rounded-full w-[28px] h-[28px] text-[0.9em] flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const sharedDifficultyBtnClasses =
    "px-[12px] py-[10px] border-2 border-transparent rounded-[8px] text-[0.9em] font-semibold transition-all duration-200 flex items-center justify-center gap-[6px] hover:-translate-y-[2px] hover:text-white";

  return (
    <div
      className={`relative border-2 border-[#e9ecef] rounded-[12px] p-5 mb-4 
        shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-300
        ${isDragging ? "scale-105 shadow-2xl rotate-1" : "hover:-translate-y-[3px]"}
        ${isUpdating ? "opacity-70 pointer-events-none" : ""}`}
      ref={setNodeRef}
      style={{
        ...dragStyle,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
      {...attributes}
      {...listeners}
    >
      <div
        className="absolute top-[10px] left-[10px] cursor-grab active:cursor-grabbing
          p-1 rounded opacity-40 hover:opacity-80 transition-opacity
          text-gray-500 select-none"
        title="גרור לשינוי רמת הקושי"
      >
        {onEdit && (
          <button
            className={`${sharedBtnClasses} bg-[#3498db] hover:bg-[#2980b9] mb-1`}
            onClick={handleEdit}
            title={translate?.wordCard?.edit}
            disabled={isUpdating}
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            className={`${sharedBtnClasses} bg-[#e74c3c] hover:bg-[#c0392b] mb-1`}
            onClick={handleDelete}
            title={translate?.wordCard?.delete}
            disabled={isUpdating}
          >
            ❌
          </button>
        )}
      </div>

      <div className="text-[1.4em] font-bold mb-[10px] text-[#2c3e50] text-center">
        {word.hebrew}
      </div>
      <div className="text-[1.2em] mb-[12px] text-[#34495e] text-center italic">
        {word.persian}
      </div>
      {word.example_sentence && (
        <div
          className="text-[0.95em] text-[#7f8c8d] text-center mb-[15px] px-[12px] py-[8px] bg-[#f8f9fa] rounded-[6px] border-r-[3px]"
          style={{ borderColor: colors.border }}
        >
          {word.example_sentence}
        </div>
      )}

      {showDifficultyButtons && !isUpdating && (
        <div className="grid grid-cols-3 gap-[8px] mt-[15px]">
          <button
            className={`${sharedDifficultyBtnClasses} bg-[#d4edda] text-[#155724] border-[#c3e6cb] hover:bg-[#28a745]`}
            onClick={(e) => handleDifficultyClick(e, "easy")}
          >
            {translate.wordCard.difficultyLabels.easy}
          </button>
          <button
            className={`${sharedDifficultyBtnClasses} bg-[#fff3cd] text-[#856404] border-[#ffeaa7] hover:bg-[#ffc107]`}
            onClick={(e) => handleDifficultyClick(e, "medium")}
          >
            {translate.wordCard.difficultyLabels.medium}
          </button>
          <button
            className={`${sharedDifficultyBtnClasses} bg-[#f8d7da] text-[#721c24] border-[#f5c6cb] hover:bg-[#dc3545]`}
            onClick={(e) => handleDifficultyClick(e, "hard")}
          >
            {translate.wordCard.difficultyLabels.hard}
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-[10px] bg-white/95 px-[20px] py-[15px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] font-semibold text-[#2a7ae4] z-10">
          <div className="w-[20px] h-[20px] border-2 border-[#e9ecef] border-t-[#2a7ae4] rounded-full animate-spin"></div>
          {translate.wordCard.updating}
        </div>
      )}
    </div>
  );
};

export default WordCard;
