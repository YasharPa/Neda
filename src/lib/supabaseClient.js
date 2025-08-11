import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const vocabularyAPI = {
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

// API לבחינות נהיגה
export const drivingAPI = {
  // קבלת כל השאלות
  async getAllQuestions() {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching driving questions:", error);
      return { data: [], error };
    }
  },

  // קבלת שאלות לפי קטגוריה
  async getQuestionsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("*")
        .eq("category", category)
        .order("id", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching questions by category:", error);
      return { data: [], error };
    }
  },

  // שמירת תוצאת תשובה
  async saveQuizResult(
    sessionId,
    questionId,
    selectedAnswer,
    isCorrect,
    responseTime = null
  ) {
    try {
      const { data, error } = await supabase
        .from("user_quiz_results")
        .insert([
          {
            session_id: sessionId,
            question_id: questionId,
            selected_answer: selectedAnswer,
            is_correct: isCorrect,
            response_time_ms: responseTime,
          },
        ])
        .select();

      if (error) throw error;

      // עדכון סטטיסטיקות קטגוריה
      const { data: questionData } = await this.getQuestionById(questionId);
      if (questionData) {
        await this.updateCategoryStats(questionData.category, isCorrect);
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error saving quiz result:", error);
      return { data: null, error };
    }
  },

  // קבלת שאלה לפי ID
  async getQuestionById(questionId) {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching question by ID:", error);
      return { data: null, error };
    }
  },

  // עדכון סטטיסטיקות קטגוריה
  async updateCategoryStats(category, isCorrect) {
    try {
      // ניסיון להשתמש בפונקציה המותאמת אישית
      const { error: rpcError } = await supabase.rpc("update_category_stats", {
        cat: category,
        is_correct: isCorrect,
      });

      if (rpcError) {
        // fallback - עדכון ידני
        const { data: existing, error: selectError } = await supabase
          .from("user_category_stats")
          .select("*")
          .eq("category", category)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          throw selectError;
        }

        if (existing) {
          // עדכון רשומה קיימת
          const { error: updateError } = await supabase
            .from("user_category_stats")
            .update({
              total_questions: existing.total_questions + 1,
              correct_answers: existing.correct_answers + (isCorrect ? 1 : 0),
              last_updated: new Date().toISOString(),
            })
            .eq("category", category);

          if (updateError) throw updateError;
        } else {
          // יצירת רשומה חדשה
          const { error: insertError } = await supabase
            .from("user_category_stats")
            .insert([
              {
                category,
                total_questions: 1,
                correct_answers: isCorrect ? 1 : 0,
              },
            ]);

          if (insertError) throw insertError;
        }
      }

      return { error: null };
    } catch (error) {
      console.error("Error updating category stats:", error);
      return { error };
    }
  },

  // קבלת סטטיסטיקות לפי קטגוריה
  async getCategoryStats() {
    try {
      const { data, error } = await supabase
        .from("user_category_stats")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching category stats:", error);
      return { data: [], error };
    }
  },

  // אלגוריתם חכם לקבלת השאלה הבאה
  async getSmartNextQuestion(excludeIds = []) {
    try {
      // קבלת סטטיסטיקות קטגוריות
      const { data: categoryStats } = await this.getCategoryStats();

      // מציאת הקטגוריה הכי חלשה
      let weakestCategory = null;
      let lowestSuccessRate = 1;

      if (categoryStats && categoryStats.length > 0) {
        categoryStats.forEach((stat) => {
          if (stat.total_questions > 0) {
            const successRate = stat.correct_answers / stat.total_questions;
            if (successRate < lowestSuccessRate) {
              lowestSuccessRate = successRate;
              weakestCategory = stat.category;
            }
          }
        });
      }

      // בניית שאילתה חכמה
      let query = supabase.from("driving_questions").select("*");

      // הוצאת שאלות שכבר נענו
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      // התמקדות בקטגוריה החלשה אם קיימת
      if (weakestCategory) {
        query = query.eq("category", weakestCategory);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      // אם אין שאלות בקטגוריה החלשה, קח שאלה רנדומלית
      if (!data || data.length === 0) {
        const { data: allQuestions, error: allError } = await supabase
          .from("driving_questions")
          .select("*")
          .not(
            "id",
            "in",
            excludeIds.length > 0 ? `(${excludeIds.join(",")})` : "(0)"
          )
          .limit(10);

        if (allError) throw allError;
        return {
          data:
            allQuestions && allQuestions.length > 0
              ? allQuestions[Math.floor(Math.random() * allQuestions.length)]
              : null,
          error: null,
        };
      }

      // בחירה רנדומלית מהקטגוריה החלשה
      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      return { data: randomQuestion, error: null };
    } catch (error) {
      console.error("Error getting smart next question:", error);
      return { data: null, error };
    }
  },

  // קבלת תוצאות המשתמש האחרונות
  async getRecentResults(limit = 50) {
    try {
      const { data, error } = await supabase
        .from("user_quiz_results")
        .select(
          `
          *,
          driving_questions (
            category,
            question_he,
            question_fa
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching recent results:", error);
      return { data: [], error };
    }
  },

  // קבלת כל הקטגוריות הזמינות
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("category")
        .order("category", { ascending: true });

      if (error) throw error;

      // הסרת כפילויות
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      return { data: uniqueCategories, error: null };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { data: [], error };
    }
  },
};
