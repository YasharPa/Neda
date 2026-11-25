import HttpError from "../lib/HttpError.js";

export const saveQuizResult = async (supabase, userId, answer) => {
  // fetch correct_answer and category of answer.questionId
  const { data: question, error } = await supabase
    .from("driving_questions")
    .select("correct_answer, category")
    .eq("id", answer.questionId)
    .maybeSingle();
  if (error) throw error;

  // throw on error; if no question -> HttpError 404 "question not found"
  if (question === null) {
    throw new HttpError(404, "question not found");
  }

  const isCorrect = question.correct_answer === answer.selectedAnswer;

  // insert into user_quiz_results (columns from answer + userId + isCorrect)
  const { error: insertError } = await supabase
    .from("user_quiz_results")
    .insert({
      user_id: userId,
      session_id: answer.sessionId,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer,
      is_correct: isCorrect,
      response_time_ms: answer.responseTime ?? null,
    });

  if (insertError) throw insertError;

  // call the update_category_stats rpc
  const { error: statsError } = await supabase.rpc("update_category_stats", {
    cat: question.category,
    is_correct: isCorrect,
  });
  if (statsError) throw statsError;

  return { isCorrect, correctAnswer: question.correct_answer };
};
