import { useState } from "react";
import { useVocabulary } from "../hooks/useVocabulary";
import ProgressBar from "../components/ProgressBar";
import WordCard from "../components/WordCard";
import AddWordForm from "../components/AddWordForm";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/VocabularyPage.css";

const VocabularyPage = ({ translate }) => {
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
    return <LoadingSpinner message={translate.vocabulary.message} />;
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
      <div className="page-header">
        <div className="header-content">
          <h1>🔤 {translate.vocabulary.learningWords}</h1>
          <p>{}</p>
        </div>
        <div className="header-actions">
          <button
            className="add-word-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm
              ? `❌ ${translate.vocabulary.close}`
              : `➕ ${translate.vocabulary.addWord}`}
          </button>
        </div>
      </div>

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
        title={`📝 ${translate.vocabulary.wordClassificationTitle}`}
        words={getUnclassifiedWords()}
        className="unclassified"
        showButtons={true}
        emptyMessage={`🎉 ${translate.vocabulary.emptyMessage}`}
      />

      {/* מילים קלות */}
      <WordSection
        title={`✅ ${translate.vocabulary.easyWords}`}
        words={getWordsByDifficulty("easy")}
        className="easy"
        emptyMessage={`🎯${translate.vocabulary.emptyWordsOfEasyWords}`}
      />

      {/* מילים בינוניות */}
      <WordSection
        title={`⚠️${translate.vocabulary.mediumWords}`}
        words={getWordsByDifficulty("medium")}
        className="medium"
        emptyMessage={`📚${translate.vocabulary.emptyWordsOfMediumWords}`}
      />

      {/* מילים קשות */}
      <WordSection
        title={`🔥${translate.vocabulary.mediumWords}`}
        words={getWordsByDifficulty("hard")}
        className="hard"
        emptyMessage={`💪${translate.vocabulary.emptyWordsOfHardWords}`}
      />

      {/* סטטיסטיקות תחתונות */}
      {stats.total > 0 && (
        <div className="bottom-stats">
          <div className="stat-card">
            <span className="stat-icon">📚</span>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">
              {translate.vocabulary.totalWords}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-value">{stats.classified}</span>
            <span className="stat-label">
              {translate.vocabulary.totalClassifiedWords}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <span className="stat-value">{stats.unclassified}</span>
            <span className="stat-label">
              {translate.vocabulary.remainedClassification}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyPage;
