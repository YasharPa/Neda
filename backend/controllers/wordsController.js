import {
  createWord,
  getWordById,
  getWordsPage,
  updateWord,
  changeWordDifficulty,
  deleteWord,
} from "../services/wordsService.js";

export const listWords = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const { data, count, hasMore } = await getWordsPage(
    req.supabase,
    page,
    limit,
  );

  res.json({
    data: data,
    page: page,
    limit: limit,
    total: count,
    hasMore: hasMore,
  });
};

export const getWord = async (req, res) => {
  const word = await getWordById(req.supabase, req.params.id);

  res.json({ data: word });
};

export const addWord = async (req, res) => {
  const { hebrew, persian, example_sentence, category } = req.body;

  const data = await createWord(req.supabase, req.user.id, {
    hebrew,
    persian,
    example_sentence,
    category,
  });
  res.status(201).json({ data: data });
};

export const editWord = async (req, res) => {
  const { hebrew, persian, example_sentence, category } = req.body;
  const wordId = req.params.id;
  const data = await updateWord(req.supabase, wordId, {
    hebrew,
    persian,
    example_sentence,
    category,
  });

  if (!data) {
    return res.status(404).json({ error: "word not found" });
  }
  res.json({ data: data });
};

export const changeDifficulty = async (req, res) => {
  const { difficulty } = req.body;
  const wordId = req.params.id;

  const data = await changeWordDifficulty(req.supabase, wordId, difficulty);

  if (!data) {
    return res.status(404).json({ error: "word not found" });
  }

  res.json({ data: data });
};

export const removeWord = async (req, res) => {
  const wordId = req.params.id;

  const deleted = await deleteWord(req.supabase, wordId);

  if (deleted === false) {
    return res.status(404).json({ error: "word not found" });
  }

  return res.sendStatus(204);
};
