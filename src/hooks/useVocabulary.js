import { useState, useEffect } from "react";
import { vocabularyAPI } from "../lib/supabaseClient";

export function useVocabulary() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    classified: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    unclassified: 0,
  });

  // טעינת מילים ראשונית
  useEffect(() => {
    fetchWords();
  }, []);

  // פונקציה לטעינת כל המילים
  const fetchWords = async () => {
    setLoading(true);
    try {
      const { data: wordsData, error: wordsError } =
        await vocabularyAPI.getAll();
      const { data: statsData, error: statsError } =
        await vocabularyAPI.getStats();

      if (wordsError) {
        console.error("Error fetching words:", wordsError);
      } else {
        setWords(wordsData);
      }

      if (statsError) {
        console.error("Error fetching stats:", statsError);
      } else if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error in fetchWords:", error);
    } finally {
      setLoading(false);
    }
  };

  // עדכון רמת קושי של מילה
  const updateWordDifficulty = async (wordId, difficulty) => {
    setUpdating(wordId);
    try {
      const { error } = await vocabularyAPI.updateDifficulty(
        wordId,
        difficulty
      );

      if (error) {
        console.error("Error updating word difficulty:", error);
        return false;
      }

      // עדכון מקומי
      setWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, difficulty } : word
        )
      );

      // עדכון סטטיסטיקות
      await updateStats();
      return true;
    } catch (error) {
      console.error("Error updating word difficulty:", error);
      return false;
    } finally {
      setUpdating(null);
    }
  };

  // הוספת מילה חדשה
  const addWord = async (wordData) => {
    try {
      const { data, error } = await vocabularyAPI.add(wordData);

      if (error) {
        console.error("Error adding word:", error);
        return false;
      }

      if (data && data.length > 0) {
        setWords((prevWords) => [...prevWords, ...data]);
        await updateStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding word:", error);
      return false;
    }
  };
  // עדכון מילה
  const updateWord = async (wordId, wordData) => {
    try {
      const { error } = await vocabularyAPI.update(wordId, wordData);

      if (error) {
        console.error("Error updating word:", error);
        return false;
      }

      // עדכון מקומי
      setWords((prevWords) =>
        prevWords.map((word) =>
          word.id === wordId ? { ...word, ...wordData } : word
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating word:", error);
      return false;
    }
  };

  // מחיקת מילה
  const deleteWord = async (wordId) => {
    try {
      const { error } = await vocabularyAPI.delete(wordId);

      if (error) {
        console.error("Error deleting word:", error);
        return false;
      }

      setWords((prevWords) => prevWords.filter((word) => word.id !== wordId));
      await updateStats();
      return true;
    } catch (error) {
      console.error("Error deleting word:", error);
      return false;
    }
  };

  // עדכון סטטיסטיקות
  const updateStats = async () => {
    try {
      const { data, error } = await vocabularyAPI.getStats();
      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };

  // פונקציות עזר לסינון מילים
  const getWordsByDifficulty = (difficulty) => {
    return words.filter((word) => word.difficulty === difficulty);
  };

  const getUnclassifiedWords = () => {
    return words.filter((word) => word.difficulty === null);
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.classified / stats.total) * 100);
  };

  return {
    // State
    words,
    loading,
    updating,
    stats,

    // Actions
    fetchWords,
    updateWordDifficulty,
    addWord,
    deleteWord,
    updateWord,
    // Computed values
    getWordsByDifficulty,
    getUnclassifiedWords,
    getProgressPercentage,
  };
}
