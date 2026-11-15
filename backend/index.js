import express from "express";
import cors from "cors";
import greet, { APP_NAME } from "./greet.js";
import signsRouter from "./routes/signs.js";
import wordsRouter from "./routes/words.js";
import logger from "./middleware/logger.js";
import error from "./middleware/error.js";
import requireAuth from "./middleware/requireAuth.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(logger);
app.use(express.json());

app.get("/api/time", (req, res) => {
  const now = new Date();
  res.json({ time: now.toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/signs", signsRouter);
app.use("/api/words", requireAuth, wordsRouter);

app.get("/api/boom", (req, res) => {
  throw new Error("bad");
});

app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use(error);

app.listen(3000, () => {
  console.log(`connected!  http://localhost:3000`);
});
