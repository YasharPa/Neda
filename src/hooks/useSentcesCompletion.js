import { useCallback, useEffect, useState } from "react";
import { sentenceCompletionAPI } from "../lib/supabaseClient";

const mapRowToQuestion = (row) => ({
  id: row.id,
  question: row.question,
  correctAnswer: row.correct_answer,
  options: [
    { key: "a", answer: row.answer_a },
    { key: "b", answer: row.answer_b },
    { key: "c", answer: row.answer_c },
    { key: "d", answer: row.answer_d },
  ],
  explanationInFA: row.explanation_fa,
  explanationInHE: row.explanation_he,
  translationFA: row.translation_fa,
  difficulty: row.difficulty,
  topic: row.topic,
});

export function useSentceCompleation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await sentenceCompletionAPI.getData();

    setError(error);
    setQuestions(data.map(mapRowToQuestion));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    questions,
    loading,
    error,
    fetchData,
  };
}
