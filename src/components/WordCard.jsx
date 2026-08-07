import { useDraggable } from "@dnd-kit/core";

const DIFFICULTY_CLASSES = {
  easy: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500", text: "text-emerald-800 dark:text-emerald-300" },
  medium: { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-500", text: "text-orange-800 dark:text-orange-300" },
  hard: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-500", text: "text-red-800 dark:text-red-300" },
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
    opacity: isDragging ? 0.6 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
    touchAction: "none",
  };

  const currentDiff = word.difficulty ? DIFFICULTY_CLASSES[word.difficulty] : { bg: "bg-white dark:bg-dark-surface", border: "border-slate-200 dark:border-slate-700", text: "text-slate-800 dark:text-slate-100" };

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
        } "${word.hebrew}"?`
      )
    ) {
      onDelete(word.id);
    }
  };
  
  const sharedBtnClasses =
    "text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 opacity-70 hover:opacity-100 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const sharedDifficultyBtnClasses =
    "px-3 py-2 border-2 border-transparent rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1 hover:-translate-y-0.5 hover:text-white";

  return (
    <div
      className={`relative border-2 rounded-2xl p-5 mb-4 
        shadow-sm transition-all duration-300
        ${isDragging ? "scale-105 shadow-2xl rotate-2" : "hover:-translate-y-1 hover:shadow-md"}
        ${isUpdating ? "opacity-70 pointer-events-none" : ""}
        ${currentDiff.bg} ${currentDiff.border}`}
      ref={setNodeRef}
      style={dragStyle}
      {...attributes}
      {...listeners}
    >
      <div
        className="absolute top-2 left-2 cursor-grab active:cursor-grabbing
          p-1 rounded opacity-40 hover:opacity-80 transition-opacity
          text-slate-500 dark:text-slate-400 select-none z-10 flex flex-col gap-1"
        title="גרור לשינוי רמת הקושי"
      >
        {onEdit && (
          <button
            className={`${sharedBtnClasses} bg-blue-500 hover:bg-blue-600`}
            onClick={handleEdit}
            title={translate?.wordCard?.edit}
            disabled={isUpdating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        )}
        {onDelete && (
          <button
            className={`${sharedBtnClasses} bg-red-500 hover:bg-red-600`}
            onClick={handleDelete}
            title={translate?.wordCard?.delete}
            disabled={isUpdating}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      <div className={`text-2xl font-bold mb-2 text-center ${currentDiff.text}`}>
        {word.hebrew}
      </div>
      <div className="text-xl mb-3 text-slate-600 dark:text-slate-400 text-center italic font-medium">
        {word.persian}
      </div>
      {word.example_sentence && (
        <div className={`text-sm text-center mb-4 px-3 py-2 bg-white/50 dark:bg-black/20 rounded-xl border-r-4 ${currentDiff.border} text-slate-700 dark:text-slate-300`}>
          {word.example_sentence}
        </div>
      )}

      {showDifficultyButtons && !isUpdating && (
        <div className="grid grid-cols-3 gap-2 mt-4 relative z-20">
          <button
            className={`${sharedDifficultyBtnClasses} bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-500 dark:hover:bg-emerald-600`}
            onClick={(e) => handleDifficultyClick(e, "easy")}
          >
            {translate.wordCard.difficultyLabels.easy}
          </button>
          <button
            className={`${sharedDifficultyBtnClasses} bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50 hover:bg-orange-500 dark:hover:bg-orange-600`}
            onClick={(e) => handleDifficultyClick(e, "medium")}
          >
            {translate.wordCard.difficultyLabels.medium}
          </button>
          <button
            className={`${sharedDifficultyBtnClasses} bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-500 dark:hover:bg-red-600`}
            onClick={(e) => handleDifficultyClick(e, "hard")}
          >
            {translate.wordCard.difficultyLabels.hard}
          </button>
        </div>
      )}

      {isUpdating && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-white/95 dark:bg-slate-800/95 px-5 py-4 rounded-xl shadow-lg font-semibold text-brand-600 dark:text-brand-400 z-30 backdrop-blur-sm">
          <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
          {translate.wordCard.updating}
        </div>
      )}
    </div>
  );
};

export default WordCard;
