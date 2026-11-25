import { saveQuizResult } from "../services/drivingService.js";

export const saveResults = async (req, res) => {
  const { sessionId, questionId, selectedAnswer, responseTime } = req.body;
  const data = await saveQuizResult(req.supabase, req.user.id, {
    selectedAnswer,
    responseTime,
    questionId,
    sessionId,
  });

  res.status(201).json({ data });
};
