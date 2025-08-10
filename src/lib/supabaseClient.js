import { createClient } from "@supabase/supabase-js";

// החלף בנתונים מהפרויקט שלך
const supabaseUrl =
  import.meta.process.env.REACT_APP_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey =
  import.meta.process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// פונקציות עזר לעבודה עם מילים
export const vocabularyAPI = {
  // קבלת כל המילים
  async getAll() {
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      return { data: [], error };
    }
  },

  // עדכון רמת קושי של מילה
  async updateDifficulty(id, difficulty) {
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .update({
          difficulty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating difficulty:", error);
      return { data: null, error };
    }
  },

  // הוספת מילה חדשה
  async add(wordData) {
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .insert([
          {
            ...wordData,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error adding word:", error);
      return { data: null, error };
    }
  },

  // מחיקת מילה
  async delete(id) {
    try {
      const { error } = await supabase.from("vocabulary").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting word:", error);
      return { error };
    }
  },

  // קבלת סטטיסטיקות
  async getStats() {
    try {
      const { data: allWords, error: allError } = await supabase
        .from("vocabulary")
        .select("id, difficulty");

      if (allError) throw allError;

      const stats = {
        total: allWords.length,
        classified: allWords.filter((word) => word.difficulty !== null).length,
        easy: allWords.filter((word) => word.difficulty === "easy").length,
        medium: allWords.filter((word) => word.difficulty === "medium").length,
        hard: allWords.filter((word) => word.difficulty === "hard").length,
        unclassified: allWords.filter((word) => word.difficulty === null)
          .length,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return { data: null, error };
    }
  },
};
