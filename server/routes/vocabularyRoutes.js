const express = require("express");
const router = express.Router();

const vocabularyController = require("../controllers/vocabularyController");

router.get("/", vocabularyController.getWords);
router.post("/", vocabularyController.createWord);

module.exports = router;
