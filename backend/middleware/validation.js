const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIFFICULTIES = ["easy", "medium", "hard"];
const REQUIRED = ["hebrew", "persian", "example_sentence"];

export const validateId = (req, res, next) => {
  const id = req.params.id;
  if (!UUID_RE.test(id)) {
    return res.status(404).json({ error: "unavailable id" });
  }

  next();
};

export const validateWord = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "request body is missing" });
  }

  for (const field of REQUIRED) {
    const value = req.body[field];
    if (typeof value !== "string" || value.trim() === "") {
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  const { category } = req.body;
  if (
    category !== undefined &&
    category !== null &&
    typeof category !== "string"
  ) {
    return res.status(400).json({ error: "category must be a string" });
  }

  next();
};

export const validateDifficulty = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "request body is missing" });
  }

  const { difficulty } = req.body;

  if (difficulty === null) {
    return next();
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({
      error: "your value is not valid (only easy, medium, hard or null)",
    });
  }
  next();
};

export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const n = Number(page);
    if (!Number.isInteger(n) || n < 1) {
      return res
        .status(400)
        .json({ error: "page must be a whole number, 1 or more" });
    }
  }

  if (limit !== undefined) {
    const n = Number(limit);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return res
        .status(400)
        .json({ error: "limit must be a whole number between 1 and 100" });
    }
  }

  next();
};

export const validateQuestionResult = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "request body is missing" });
  }
  const { sessionId, questionId, selectedAnswer, responseTime } = req.body;
  if (typeof sessionId !== "string" || !UUID_RE.test(sessionId)) {
    return res.status(400).json({ error: "sessionId must be uuid" });
  }

  if (!Number.isInteger(questionId) || questionId < 1) {
    return res
      .status(400)
      .json({ error: "question id must be positive whole number" });
  }

  if (
    !Number.isInteger(selectedAnswer) ||
    selectedAnswer < 0 ||
    selectedAnswer > 3
  ) {
    return res
      .status(400)
      .json({ error: "selected Number must be between 0 to 3" });
  }
  if (responseTime !== undefined && responseTime !== null) {
    if (!Number.isInteger(responseTime) || responseTime < 0) {
      return res
        .status(400)
        .json({ error: "responseTime must be a whole number, 0 or more" });
    }
  }

  next();
};
