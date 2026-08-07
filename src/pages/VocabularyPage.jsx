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

// ─── DroppableZone ────────────────────────────────────────────────────────────

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
    <div className="mb-8">
      <div
        className={`text-lg md:text-xl font-bold py-4 px-6 rounded-2xl mb-4 flex items-center gap-3 shadow-sm ${className}`}
      >
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={`
          min-h-[120px] rounded-2xl transition-all duration-300 p-2
          ${
            isOver
              ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-dark-bg bg-brand-50/50 dark:bg-brand-900/20 scale-[1.01]"
              : ""
          }
        `}
      >
        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-5">
            {children}
          </div>
        ) : (
          <div
            className={`glass-card border-2 border-dashed rounded-2xl p-10 text-center text-lg leading-relaxed transition-all duration-300 ${
              isOver
                ? "border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30"
                : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
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
  const [filter, setFilter] = useState("all"); 

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    })
  );

  const handleDragStart = ({ active }) => {
    const dragged = words.find((w) => w.id === active.id);
    setActiveWord(dragged ?? null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveWord(null);
    if (!over) return;

    const wordId = active.id;
    const newDifficulty = over.id; 
    const currentWord = words.find((w) => w.id === wordId);

    if (currentWord?.difficulty === newDifficulty) return;
    const difficultyValue =
      newDifficulty === "unclassified" ? null : newDifficulty;
    await updateWordDifficulty(wordId, difficultyValue);
  };

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

  const filteredUnclassified = filter === "all" || filter === null ? getUnclassifiedWords() : [];
  const filteredEasy = filter === "all" || filter === "easy" ? getWordsByDifficulty("easy") : [];
  const filteredMedium = filter === "all" || filter === "medium" ? getWordsByDifficulty("medium") : [];
  const filteredHard = filter === "all" || filter === "hard" ? getWordsByDifficulty("hard") : [];

  const counts = {
    total: words.length,
    unclassified: getUnclassifiedWords().length,
    easy: getWordsByDifficulty("easy").length,
    medium: getWordsByDifficulty("medium").length,
    hard: getWordsByDifficulty("hard").length,
  };

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
      <div className="w-full flex flex-col gap-6 animate-slide-up pb-10">
        
        {/* ── header ── */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-right border-brand-200 dark:border-brand-900/50">
          <div>
            <h1 className="m-0 text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <span className="text-brand-500">📖</span> {translate.vocabulary.learningWords}
            </h1>
          </div>
          <button
            className="bg-brand-600 text-white rounded-xl py-3 px-6 font-bold transition-all duration-300 hover:bg-brand-500 shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 w-full md:w-auto"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? translate?.vocabulary.close : translate?.vocabulary.addWord}
          </button>
        </div>

        {showAddForm && (
          <div className="animate-formSlideIn">
            <AddWordForm
              onAddWord={handleAddWord}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        )}

        {editingWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-overlayFadeIn p-4">
            <div className="w-full max-w-2xl animate-formSlideIn">
              <EditWordForm
                word={editingWord}
                onUpdateWord={handleUpdateWord}
                onClose={() => setEditingWord(null)}
                translate={translate}
              />
            </div>
          </div>
        )}

        {/* ── פס התקדמות ── */}
        <div className="glass-card p-6">
          <ProgressBar
            translate={translate}
            stats={stats}
            percentage={getProgressPercentage()}
          />
        </div>

        {/* ── פילטר ── */}
        <FilterBar
          activeFilter={filter}
          onChange={setFilter}
          counts={counts}
          translate={translate}
        />

        {/* ── אזורי Drop ── */}
        <div className="mt-4 flex flex-col gap-8">
          {/* לא מסווג */}
          {(filter === "all" || filter === null) && (
            <DroppableZone
              id="unclassified"
              title={`${translate.vocabulary.wordClassificationTitle} (${counts.unclassified})`}
              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
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
              className="bg-emerald-500 dark:bg-emerald-600 text-white"
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
              className="bg-orange-500 dark:bg-orange-600 text-white"
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
              className="bg-red-500 dark:bg-red-600 text-white"
              emptyMessage={`${translate.vocabulary.emptyWordsOfHardWords}`}
              translate={translate}
            >
              {filteredHard.map((w) => renderCard(w))}
            </DroppableZone>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeWord ? (
          <div className="rotate-[2deg] scale-[1.05] opacity-95 shadow-2xl pointer-events-none">
            <WordCard word={activeWord} translate={translate} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VocabularyPage;
