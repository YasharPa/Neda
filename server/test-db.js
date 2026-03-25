const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("starting connection to db... 🌱");

  try {
    const newWord = await prisma.vocabulary.create({
      data: {
        hebrew: "שלום",
        persian: "Salam",
        difficulty: "easy",
        example: "שלום חבר",
      },
    });
    console.log("added new word:", newWord);

    // 2. שליפת כל המילים (Read)
    const allWords = await prisma.vocabulary.findMany();
    console.log("all the words in th vocabulary:", allWords);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
