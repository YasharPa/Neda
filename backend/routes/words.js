import express from "express";
import {
  validateId,
  validateWord,
  validateDifficulty,
  validatePagination,
} from "../middleware/validation.js";
import { addWord, getWord, listWords } from "../controllers/wordsController.js";

const router = express.Router();

router.get("/", validatePagination, listWords);

router.get("/:id", validateId, getWord);

router.post("/", validateWord, addWord);

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
