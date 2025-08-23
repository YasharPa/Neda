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

  async update(id, wordData) {
    try {
      const { data, error } = await supabase
        .from("vocabulary")
        .update({
          ...wordData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating word:", error);
      return { data: null, error };
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
export const drivingAPI = {
  // העלאת תמונה
  async uploadImage(file, questionId = null) {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${questionId || Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      const { error } = await supabase.storage
        .from("question-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // קבלת URL ציבורי
      const {
        data: { publicUrl },
      } = supabase.storage.from("question-images").getPublicUrl(filePath);

      return { data: { path: filePath, url: publicUrl }, error: null };
    } catch (error) {
      console.error("Error uploading image:", error);
      return { data: null, error };
    }
  },

  // מחיקת תמונה
  async deleteImage(imagePath) {
    try {
      const { error } = await supabase.storage
        .from("question-images")
        .remove([imagePath]);

      return { error };
    } catch (error) {
      console.error("Error deleting image:", error);
      return { error };
    }
  },

  // הוספת שאלה חדשה
  async addQuestion(questionData, imageFile = null) {
    try {
      let imageUrl = null;
      let imagePath = null;

      // העלאת תמונה אם קיימת
      if (imageFile) {
        const { data: imageData, error: imageError } = await this.uploadImage(
          imageFile
        );
        if (imageError) {
          console.error("Error uploading image:", imageError);
          return { data: null, error: imageError };
        }
        imageUrl = imageData.url;
        imagePath = imageData.path;
      }

      // הוספת השאלה עם URL התמונה
      const { data, error } = await supabase
        .from("driving_questions")
        .insert([
          {
            ...questionData,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        // מחיקת התמונה אם נכשלה הוספת השאלה
        if (imagePath) {
          await this.deleteImage(imagePath);
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error adding question:", error);
      return { data: null, error };
    }
  },

  // עדכון שאלה
  async updateQuestion(questionId, questionData, newImageFile = null) {
    try {
      let imageUrl = questionData.image_url;
      let imagePath = null;

      // טיפול בתמונה חדשה
      if (newImageFile) {
        // מחיקת תמונה ישנה אם קיימת
        if (questionData.image_url) {
          const oldImagePath = questionData.image_url.split("/").pop();
          await this.deleteImage(`questions/${oldImagePath}`);
        }

        // העלאת תמונה חדשה
        const { data: imageData, error: imageError } = await this.uploadImage(
          newImageFile,
          questionId
        );
        if (imageError) {
          console.error("Error uploading new image:", imageError);
          return { data: null, error: imageError };
        }
        imageUrl = imageData.url;
        imagePath = imageData.path;
      }

      // עדכון השאלה
      const { data, error } = await supabase
        .from("driving_questions")
        .update({
          ...questionData,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", questionId)
        .select();

      if (error) {
        // מחיקת התמונה החדשה אם נכשל העדכון
        if (imagePath) {
          await this.deleteImage(imagePath);
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error updating question:", error);
      return { data: null, error };
    }
  },

  // מחיקת שאלה
  async deleteQuestion(questionId) {
    try {
      // קבלת פרטי השאלה לפני מחיקה
      const { data: question } = await supabase
        .from("driving_questions")
        .select("image_url")
        .eq("id", questionId)
        .single();

      // מחיקת השאלה
      const { error } = await supabase
        .from("driving_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      // מחיקת התמונה אם קיימת
      if (question?.image_url) {
        const imagePath = question.image_url.split("/").pop();
        await this.deleteImage(`questions/${imagePath}`);
      }

      return { error: null };
    } catch (error) {
      console.error("Error deleting question:", error);
      return { error };
    }
  },

  // העלאה מרובה של שאלות מ-JSON
  async bulkImportQuestions(questionsArray) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < questionsArray.length; i++) {
        const question = questionsArray[i];

        try {
          const { data, error } = await this.addQuestion(question);

          if (error) {
            errors.push({ index: i, question: question.question_he, error });
          } else {
            results.push(data[0]);
          }
        } catch (error) {
          errors.push({ index: i, question: question.question_he, error });
        }

        // המתנה קצרה בין העלאות כדי לא להעמיס על השרת
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return {
        data: {
          imported: results.length,
          failed: errors.length,
          results,
          errors,
        },
        error: errors.length > 0 ? errors : null,
      };
    } catch (error) {
      console.error("Error in bulk import:", error);
      return { data: null, error };
    }
  },

  // קבלת כל השאלות (הפונקציות הקיימות נשארות)
  async getAllQuestions() {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("*")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error fetching driving questions:", error);
      return { data: [], error };
    }
  },

  // שאר הפונקציות הקיימות...
  async getQuestionsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
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

  // עדכון סטטיסטיקות קטגוריה (הפונקציה הקיימת)
  async updateCategoryStats(category, isCorrect) {
    try {
      const { error: rpcError } = await supabase.rpc("update_category_stats", {
        cat: category,
        is_correct: isCorrect,
      });

      if (rpcError) {
        const { data: existing, error: selectError } = await supabase
          .from("user_category_stats")
          .select("*")
          .eq("category", category)
          .single();

        if (selectError && selectError.code !== "PGRST116") {
          throw selectError;
        }

        if (existing) {
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

  async getSmartNextQuestion(excludeIds = []) {
    try {
      const { data: categoryStats } = await this.getCategoryStats();

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

      let query = supabase
        .from("driving_questions")
        .select("*")
        .eq("is_active", true);

      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      if (weakestCategory) {
        query = query.eq("category", weakestCategory);
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;

      if (!data || data.length === 0) {
        const { data: allQuestions, error: allError } = await supabase
          .from("driving_questions")
          .select("*")
          .eq("is_active", true)
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

      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      return { data: randomQuestion, error: null };
    } catch (error) {
      console.error("Error getting smart next question:", error);
      return { data: null, error };
    }
  },

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

  async getCategories() {
    try {
      const { data, error } = await supabase
        .from("driving_questions")
        .select("category")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;

      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      return { data: uniqueCategories, error: null };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { data: [], error };
    }
  },
};
