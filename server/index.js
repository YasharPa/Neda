require("dotenv").config();
const express = require("express");
const cors = require("cors");
const vocabularyRoutes = require("./routes/vocabularyRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running perfectly!");
});
app.use("/api/vocabulary", vocabularyRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
