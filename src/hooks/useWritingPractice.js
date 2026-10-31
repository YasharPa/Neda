import { useCallback, useEffect, useState } from "react";
import { writingAPI, vocabularyAPI } from "../lib/supabaseClient";
import { shuffleArray } from "../lib/shuffle";

// source: "phrases" (משפטי הודעות) או "myWords" (המילים של המשתמש)
export function useWritingPractice(source, category, enabled = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let mapped = [];
      if (source === "myWords") {
        const { data } = await vocabularyAPI.getAll();
        mapped = data
          .filter((w) => w.hebrew?.trim())
          .map((w) => ({ id: w.id, hebrew: w.hebrew, persian: w.persian }));
      } else {
        const { data, error } = await writingAPI.getPhrases(category);
        if (error) throw error;
        mapped = data.map((p) => ({
          id: p.id,
          hebrew: p.text_he,
          persian: p.text_fa,
        }));
      }
      setItems(shuffleArray(mapped));
    } catch (err) {
      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [source, category, enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, reload };
}
