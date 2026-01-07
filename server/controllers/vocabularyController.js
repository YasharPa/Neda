const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getWords = async (req, res) => {
  try {
    const words = await prisma.vocabulary.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(words);
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json({ error: "can't get the words" });
  }
};

exports.createWord = async (req, res) => {
  try {
    const { hebrew, persian, example, difficulty } = req.body;
    if (!hebrew || !persian) {
      return res
        .status(400)
        .json({ error: "Please add your herbrew and persian fileds" });
    }

    const newWord = await prisma.vocabulary.create({
      data: { hebrew, persian, example, difficulty },
    });
    res.status(201).json({ newWord });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.status(500).json({ error: "can't create the word." });
  }
};
