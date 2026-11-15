import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (supabaseUrl === undefined) {
  throw new Error("url is missing");
}

if (supabaseAnonKey === undefined) {
  throw new Error("anon key is missing");
}

export const createUserClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
