import { supabase, createUserClient } from "../lib/supabase.js";

const requireAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authorization.slice(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (!user || error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = user;
  req.supabase = createUserClient(token);

  next();
};

export default requireAuth;
