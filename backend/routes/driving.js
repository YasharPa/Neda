import express from "express";
import { validateQuestionResult } from "../middleware/validation.js";

const router = express.Router();

router.post("/results", validateQuestionResult, async (req, res) => {
  const { sessionId, questionId, selectedAnswer, responseTime } = req.body;
  const { data: question, error } = await req.supabase
    .from("driving_questions")
    .select("correct_answer, category")
    .eq("id", questionId)
    .maybeSingle();
  if (error) throw error;
  if (question === null) {
    return res.status(404).json({ error: "question not found" });
  }
  const isCorrect = question.correct_answer === selectedAnswer;

  const { error: insertError } = await req.supabase
    .from("user_quiz_results")
    .insert({
      user_id: req.user.id,
      session_id: sessionId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      response_time_ms: responseTime ?? null,
    });
  if (insertError) throw insertError;

  const { error: statsError } = await req.supabase.rpc(
    "update_category_stats",
    {
      cat: question.category,
      is_correct: isCorrect,
    },
  );
  if (statsError) throw statsError;

  res
    .status(201)
    .json({ data: { isCorrect, correctAnswer: question.correct_answer } });
});

export default router;
