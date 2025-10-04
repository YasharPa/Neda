import { useCallback, useEffect, useState } from "react";
import { sentenceCompletionAPI } from "../lib/supabaseClient";

export function useSentceCompleation() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [questions, setQuestions] = useState([]);

  const mapRowToQuestion = useCallback((row) => {
    const options = [
      { key: "a", answer: row.answer_a },
      { key: "b", answer: row.answer_b },
      { key: "c", answer: row.answer_c },
      { key: "d", answer: row.answer_d },
    ];

    return {
      id: row.id,
      question: row.question,
      correctAnswer: row.correct_answer,
      options: options,
      explanationInFA: row.explanation_fa,
      explanationInHE: row.explanation_he,
      difificulty: row.difficulty,
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data, error } = await sentenceCompletionAPI.getData();

    const mappedData = data.map(mapRowToQuestion);

    setQuestions(mappedData);
    setError(error);
    if (error) {
      console.error("Error fetching sentence completion questions:", error);
      return;
    }
    setLoading(false);
  }

  return {
    questions,
    loading,
    error,
    fetchData,
  };
}
