import express from "express";
import { validatePagination } from "../middleware/validation.js";
import { getSign, listSigns } from "../controllers/signsController.js";

const router = express.Router();

router.get("/", validatePagination, listSigns);

router.get("/:code", getSign);

export default router;
