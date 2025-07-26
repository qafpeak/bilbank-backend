const fs = require("fs");
const path = require("path");
const sorular = require("./questions"); // ham verilerde "answer" alanı var

// Bugünün tarihi setId için
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
const today = `${year}${month}${day}`; // Örn: 20250725

// Geçerli cevaplara göre filtreleme + dönüştürme
const formattedQuestions = sorular
  .filter(q => q.answer && ["evet", "hayır"].includes(q.answer.toLowerCase()))
  .map((q, index) => ({
    text: q.text,
    correctAnswer: q.answer.toLowerCase(),
    setId: today,
    order: index + 1
  }));

// JSON olarak diske yaz
const outputPath = path.join(__dirname, "questions_formatted.json");
fs.writeFileSync(outputPath, JSON.stringify(formattedQuestions, null, 2), "utf-8");

console.log(`✅ Sorular başarıyla dönüştürüldü → ${outputPath}`);

module.exports = formattedQuestions;
