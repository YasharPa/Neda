import { supabase } from "../lib/supabase.js";

export const getSignsPage = async (page, limit) => {
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("road_signs")
    .select("*", { count: "exact" })
    .order("sign_code", { ascending: true })
    .range(from, from + limit - 1);
  if (error) {
    throw error;
  }

  return { data, count, hasMore: count > from + limit };
};

export const getSignByCode = async (code) => {
  const { data, error } = await supabase
    .from("road_signs")
    .select("*")
    .eq("sign_code", code)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
};
