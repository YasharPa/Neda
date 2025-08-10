import React, { useState } from "react";
import { useVocabulary } from "../hooks/useVocabulary";
import ProgressBar from "../components/ProgressBar";
import WordCard from "../components/WordCard";
import AddWordForm from "../components/AddWordForm";
import LoadingSpinner from "../components/LoadingSpinner";
import "./VocabularyPage.css";

const VocabularyPage = () => {
  const {
    loading,
    updating,
    stats,
    updateWordDifficulty,
    addWord,
    deleteWord,
    getWordsByDifficulty,
    getUnclassifiedWords,
    getProgressPercentage,
  } = useVocabulary();

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddWord = async (wordData) => {
    const success = await addWord(wordData);
    if (success) {
      setShowAddForm(false);
    }
    return success;
  };

  const handleUpdateDifficulty = async (wordId, difficulty) => {
    return await updateWordDifficulty(wordId, difficulty);
  };

  const handleDeleteWord = async (wordId) => {
    return await deleteWord(wordId);
  };

  if (loading) {
    return <LoadingSpinner message="טוען מילים מ-Supabase..." />;
  }

  const WordSection = ({
    title,
    words,
    className,
    showButtons = false,
    emptyMessage,
  }) => (
    <div className="section">
      <div className={`section-title ${className}`}>
        {title} ({words.length})
      </div>
      {words.length > 0 ? (
        <div className="words-grid">
          {words.map((word) => (
            <WordCard
              key={word.id}
              word={word}
              showDifficultyButtons={showButtons}
              isUpdating={updating === word.id}
              onUpdateDifficulty={handleUpdateDifficulty}
              onDelete={handleDeleteWord}
            />
          ))}
        </div>
      ) : (
        <div className="empty-section">{emptyMessage}</div>
      )}
    </div>
  );

  return (
    <div className="vocabulary-page">
      {/* כותרת ופעולות */}
      <div className="page-header">
        <div className="header-content">
          <h1>🔤 לימוד מילים</h1>
          <p>סווג את המילים לפי רמת הקושי האישית שלך</p>
        </div>
        <div className="header-actions">
          <button
            className="add-word-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "❌ סגור" : "➕ הוסף מילה"}
          </button>
        </div>
      </div>

      {/* טופס הוספת מילה */}
      {showAddForm && (
        <AddWordForm
          onAddWord={handleAddWord}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* פס התקדמות */}
      <ProgressBar stats={stats} percentage={getProgressPercentage()} />

      {/* מילים לסיווג */}
      <WordSection
        title="📝 מילים לסיווג"
        words={getUnclassifiedWords()}
        className="unclassified"
        showButtons={true}
        emptyMessage="🎉 כל הכבוד! סיווגת את כל המילים"
      />

      {/* מילים קלות */}
      <WordSection
        title="✅ מילים קלות"
        words={getWordsByDifficulty("easy")}
        className="easy"
        emptyMessage="🎯 עדיין לא סווגת מילים כקלות. התחל לסווג מילים כדי לראות אותן כאן"
      />

      {/* מילים בינוניות */}
      <WordSection
        title="⚠️ מילים בינוניות"
        words={getWordsByDifficulty("medium")}
        className="medium"
        emptyMessage="📚 עדיין לא סווגת מילים כבינוניות. המילים הבינוניות יופיעו כאן"
      />

      {/* מילים קשות */}
      <WordSection
        title="🔥 מילים קשות"
        words={getWordsByDifficulty("hard")}
        className="hard"
        emptyMessage="💪 עדיין לא סווגת מילים כקשות. המילים המאתגרות יופיעו כאן"
      />

      {/* סטטיסטיקות תחתונות */}
      {stats.total > 0 && (
        <div className="bottom-stats">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">סה"כ מילים</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{stats.classified}</span>
            <span className="stat-label">מילים סווגו</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <span className="stat-value">{stats.unclassified}</span>
            <span className="stat-label">נותרו לסיווג</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
