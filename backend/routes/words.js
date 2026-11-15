import express from "express";
import {
  validateId,
  validateWord,
  validateDifficulty,
  validatePagination,
} from "../middleware/validation.js";

const router = express.Router();

router.get("/", validatePagination, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const from = (page - 1) * limit;

  const { data, error, count } = await req.supabase
    .from("user_words")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: true })
    .range(from, from + limit - 1);

  if (error) {
    throw error;
  }

  res.json({
    data: data,
    page: page,
    limit: limit,
    total: count,
    hasMore: count > from + limit,
  });
});

router.get("/:id", validateId, async (req, res) => {
  const wordId = req.params.id;

  const { data, error } = await req.supabase
    .from("user_words")
    .select("*")
    .eq("id", wordId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (data == null) {
    return res.status(404).json({ error: "word not found" });
  }

  res.json({ data: data });
});

router.post("/", validateWord, async (req, res) => {
  const { hebrew, persian, example_sentence, category } = req.body;

  const { data, error } = await req.supabase
    .from("user_words")
    .insert({
      hebrew,
      persian,
      example_sentence,
      category,
      user_id: req.user.id,
    })
    .select()
    .single();

  if (error) throw error;

  res.status(201).json({ data });
});

router.put("/:id", validateId, validateWord, async (req, res) => {
  const { hebrew, persian, example_sentence, category } = req.body;
  const wordId = req.params.id;

  const { data, error } = await req.supabase
    .from("user_words")
    .update({
      hebrew,
      persian,
      example_sentence,
      category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wordId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ error: "word not found" });
  }

  res.json({ data });
});

router.patch("/:id", validateId, validateDifficulty, async (req, res) => {
  const { difficulty } = req.body;
  const wordId = req.params.id;

  const { data, error } = await req.supabase
    .from("user_words")
    .update({
      difficulty,
      updated_at: new Date().toISOString(),
    })
    .eq("id", wordId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return res.status(404).json({ error: "word not found" });
  }

  res.json({ data });
});

router.delete("/:id", validateId, async (req, res) => {
  const wordId = req.params.id;
  const { data, error } = await req.supabase
    .from("user_words")
    .delete()
    .eq("id", wordId)
    .select();

  if (error) throw error;
  if (data.length === 0) {
    return res.status(404).json({ error: "word not found" });
  }

  return res.sendStatus(204);
});

export default router;
