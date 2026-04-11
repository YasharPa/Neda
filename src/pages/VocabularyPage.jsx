import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useVocabulary } from "../hooks/useVocabulary";
import ProgressBar from "../components/ProgressBar";
import WordCard from "../components/WordCard";
import AddWordForm from "../components/AddWordForm";
import EditWordForm from "../components/EditWordForm";
import FilterBar from "../components/FilterBar";
import "../styles/VocabularyPage.css";

// ─── DroppableZone ────────────────────────────────────────────────────────────

/**
 * DroppableZone component creates a designated area where draggable items (WordCards) can be dropped.
 * It handles its own styling based on whether an item is currently being dragged over it.
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the drop zone (e.g., "easy", "medium", "hard", "unclassified").
 * @param {string} props.title - The visible title of the zone.
 * @param {React.ReactNode} props.children - The WordCard components rendered inside this zone.
 * @param {Object} props.translate - Translation object for localization (UI texts).
 */

const DroppableZone = ({
  id,
  title,
  className,
  emptyMessage,
  children,
  translate,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="mb-[30px]">
      <div
        className={`text-[1.2em] md:text-[1.4em] font-semibold py-3 px-4 md:py-[15px] md:px-[20px] rounded-lg mb-[15px] flex items-center gap-2.5 ${className}`}
      >
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={`
          min-h-[120px] rounded-xl transition-all duration-200 p-1
          ${
            isOver
              ? "ring-2 ring-[#2a7ae4] ring-offset-2 bg-blue-50/40 scale-[1.005]"
              : ""
          }
        `}
      >
        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[15px] md:gap-[20px] px-1">
            {children}
          </div>
        ) : (
          <div
            className={`bg-white border-2 border-dashed rounded-xl p-[40px] text-center text-[1.1em] leading-[1.5] transition-all duration-150 ${
              isOver
                ? "border-[#2a7ae4] border-solid text-[#2a7ae4] bg-blue-50/60"
                : ""
            }`}
          >
            {isOver ? translate.dropZone.message : emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── VocabularyPage ───────────────────────────────────────────────────────────
/**
 * VocabularyPage is the main container component for the vocabulary learning section.
 * It orchestrates the Drag-and-Drop context, word filtering, progress tracking,
 * and handles interactions for adding, editing, and categorizing words.
 *
 * @param {Object} props
 * @param {Object} props.translate - Translation object for UI localization across the page.
 * @returns {JSX.Element} The fully composed vocabulary page.
 */

const VocabularyPage = ({ translate }) => {
  const {
    words,
    updating,
    stats,
    updateWordDifficulty,
    addWord,
    updateWord,
    deleteWord,
    getWordsByDifficulty,
    getUnclassifiedWords,
    getProgressPercentage,
  } = useVocabulary();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [activeWord, setActiveWord] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | null | "easy" | "medium" | "hard"

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
  );

  // ─── Drag handlers ──────────────────────────────────────────────────────────

  /** Stores the currently dragged word in state for the DragOverlay */
  const handleDragStart = ({ active }) => {
    const dragged = words.find((w) => w.id === active.id);
    setActiveWord(dragged ?? null);
  };

  /** Handles the logic when a word is dropped into a specific DroppableZone */
  const handleDragEnd = async ({ active, over }) => {
    setActiveWord(null);
    if (!over) return;

    const wordId = active.id;
    const newDifficulty = over.id; // "easy" | "medium" | "hard" | "unclassified"
    const currentWord = words.find((w) => w.id === wordId);

    if (currentWord?.difficulty === newDifficulty) return;
    const difficultyValue =
      newDifficulty === "unclassified" ? null : newDifficulty;
    await updateWordDifficulty(wordId, difficultyValue);
  };

  // ─── Word actions ────────────────────────────────────────────────────────────
  const handleAddWord = async (d) => {
    const ok = await addWord(d);
    if (ok) setShowAddForm(false);
    return ok;
  };
  const handleUpdateDifficulty = (id, diff) => updateWordDifficulty(id, diff);
  const handleEditWord = (word) => setEditingWord(word);
  const handleUpdateWord = async (id, d) => {
    const ok = await updateWord(id, d);
    if (ok) setEditingWord(null);
    return ok;
  };
  const handleDeleteWord = (id) => deleteWord(id);

  // ─── Filtered word lists ─────────────────────────────────────────────────────
  const filteredUnclassified =
    filter === "all" || filter === null ? getUnclassifiedWords() : [];

  const filteredEasy =
    filter === "all" || filter === "easy" ? getWordsByDifficulty("easy") : [];

  const filteredMedium =
    filter === "all" || filter === "medium"
      ? getWordsByDifficulty("medium")
      : [];

  const filteredHard =
    filter === "all" || filter === "hard" ? getWordsByDifficulty("hard") : [];

  const counts = {
    total: words.length,
    unclassified: getUnclassifiedWords().length,
    easy: getWordsByDifficulty("easy").length,
    medium: getWordsByDifficulty("medium").length,
    hard: getWordsByDifficulty("hard").length,
  };

  // ─── Word card renderer (שימוש חוזר) ────────────────────────────────────────

  const renderCard = (word, showButtons = false) => (
    <WordCard
      key={word.id}
      word={word}
      showDifficultyButtons={showButtons}
      isUpdating={updating === word.id}
      onUpdateDifficulty={handleUpdateDifficulty}
      onEdit={handleEditWord}
      onDelete={handleDeleteWord}
      translate={translate}
    />
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-7xl mx-auto p-[20px] bg-[#f8f9fa] min-h-screen md:p-5">
        {/* ── header ── */}
        <div className="bg-white rounded-xl p-[25px] mb-[25px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex flex-col md:flex-row justify-center md:justify-between items-center flex-wrap gap-[20px] text-center md:text-right">
          <div className="header-content">
            <h1 className="m-0 mb-2 text-[#2c3e50] font-bold text-[1.6em] sm:text-[1.8em] md:text-[2.2em]">
              {translate.vocabulary.learningWords}
            </h1>
          </div>
          <div className="flex gap-[12px]">
            <button
              className="bg-[#2a7ae4] text-white border-none rounded-lg py-3 px-5 text-[1em] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-[#164a9e]  hover:shadow-[0_4px_12px_rgba(42,122,228,0.3)]"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm
                ? ` ${translate?.vocabulary.close}`
                : ` ${translate?.vocabulary.addWord}`}
            </button>
          </div>
        </div>

        {showAddForm && (
          <AddWordForm
            onAddWord={handleAddWord}
            onClose={() => setShowAddForm(false)}
          />
        )}

        {editingWord && (
          <EditWordForm
            word={editingWord}
            onUpdateWord={handleUpdateWord}
            onClose={() => setEditingWord(null)}
            translate={translate}
          />
        )}

        {/* ── פס התקדמות ── */}
        <ProgressBar
          translate={translate}
          stats={stats}
          percentage={getProgressPercentage()}
        />

        {/* ── פילטר ── */}
        <FilterBar
          activeFilter={filter}
          onChange={setFilter}
          counts={counts}
          translate={translate}
        />

        {/* ── אזורי Drop ── */}

        {/* לא מסווג */}
        {(filter === "all" || filter === null) && (
          <DroppableZone
            id="unclassified"
            title={`${translate.vocabulary.wordClassificationTitle} (${counts.unclassified})`}
            className="unclassified"
            emptyMessage={`${translate.vocabulary.emptyMessage}`}
            translate={translate}
          >
            {filteredUnclassified.map((w) => renderCard(w, true))}
          </DroppableZone>
        )}

        {/* easy */}
        {(filter === "all" || filter === "easy") && (
          <DroppableZone
            id="easy"
            title={`${translate?.vocabulary.easyWords} (${counts.easy})`}
            className="bg-[linear-gradient(135deg,#27ae60,#229954)] text-white"
            emptyMessage={`${translate.vocabulary.emptyWordsOfEasyWords}`}
            translate={translate}
          >
            {filteredEasy.map((w) => renderCard(w))}
          </DroppableZone>
        )}

        {/* medium */}
        {(filter === "all" || filter === "medium") && (
          <DroppableZone
            id="medium"
            title={`${translate?.vocabulary.mediumWords} (${counts.medium})`}
            className="bg-[linear-gradient(135deg,#f39c12,#e67e22)] text-white"
            emptyMessage={` ${translate?.vocabulary.emptyWordsOfMediumWords}`}
            translate={translate}
          >
            {filteredMedium.map((w) => renderCard(w))}
          </DroppableZone>
        )}

        {/* hard */}
        {(filter === "all" || filter === "hard") && (
          <DroppableZone
            id="hard"
            title={`${translate?.vocabulary.hardWords} (${counts.hard})`}
            className="bg-[linear-gradient(135deg,#e74c3c,#c0392b)] text-white"
            emptyMessage={`${translate.vocabulary.emptyWordsOfHardWords}`}
            translate={translate}
          >
            {filteredHard.map((w) => renderCard(w))}
          </DroppableZone>
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeWord ? (
          <div className="rotate-[1deg] scale-[1.04] opacity-95 shadow-2xl pointer-events-none">
            <WordCard word={activeWord} translate={translate} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VocabularyPage;
