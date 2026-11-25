import express from "express";
import {
  validateId,
  validateWord,
  validateDifficulty,
  validatePagination,
} from "../middleware/validation.js";
import {
  addWord,
  changeDifficulty,
  editWord,
  getWord,
  listWords,
  removeWord,
} from "../controllers/wordsController.js";

const router = express.Router();

router.get("/", validatePagination, listWords);

router.get("/:id", validateId, getWord);

router.post("/", validateWord, addWord);

router.put("/:id", validateId, validateWord, editWord);

router.patch("/:id", validateId, validateDifficulty, changeDifficulty);

router.delete("/:id", validateId, removeWord);

export default router;
