export const getWordsPage = async (supabase, page, limit) => {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("user_words")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: true })
    .range(from, from + limit - 1);

  if (error) {
    throw error;
  }

  return { data: data, count: count, hasMore: count > from + limit };
};

export const getWordById = async (supabase, id) => {
  const { data, error } = await supabase
    .from("user_words")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw error;
  }

  return data;
};

export const createWord = async (supabase, userId, word) => {
  const { data, error } = await supabase
    .from("user_words")
    .insert({
      ...word,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};
