import {
  createWord,
  getWordById,
  getWordsPage,
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

  if (word == null) {
    return res.status(404).json({ error: "word not found" });
  }

  res.json({ data: word });
};

export const addWord = async (req, res) => {
  const { hebrew, persian, example_sentence, category } = req.body;
  // console.log(req.user);
  const data = await createWord(req.supabase, req.user.id, {
    hebrew,
    persian,
    example_sentence,
    category,
  });
  res.status(201).json({ data: data });
};
