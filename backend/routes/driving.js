import express from "express";
import { validateQuestionResult } from "../middleware/validation.js";
import { saveResults } from "../controllers/drivingController.js";
const router = express.Router();

router.post("/results", validateQuestionResult, saveResults);

export default router;
