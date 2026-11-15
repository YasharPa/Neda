import express from "express";
import { supabase } from "../lib/supabase.js";
import { validatePagination } from "../middleware/validation.js";

const router = express.Router();

router.get("/", validatePagination, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("road_signs")
    .select("*", { count: "exact" })
    .order("sign_code", { ascending: true })
    .range(from, from + limit - 1);
  if (error) {
    throw error;
  }

  if (data === null) {
    return res.json({ error: "sign not found" });
  }
  res.json({
    data: data,
    page: page,
    limit: limit,
    total: count,
    hasMore: count > from + limit,
  });
});

router.get("/:code", async (req, res) => {
  const signId = req.params.code;
  const { data, error } = await supabase
    .from("road_signs")
    .select("*")
    .eq("sign_code", signId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data === null) {
    return res.status(404).json({ error: "sign not found" });
  }
  res.json({ data: data });
});

export default router;
