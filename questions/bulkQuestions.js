
const mongoose = require("mongoose");
const Question = require("../models/Question");
const sorular = require("./generateFormattedQuestions"); // doğru import

mongoose.connect("mongodb://localhost:27017/quiz", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedQuestions() {
  try {
    await Question.deleteMany();
    await Question.insertMany(sorular);
    console.log("✅ Sorular başarıyla eklendi.");
  } catch (err) {
    console.error("❌ Soru ekleme hatası:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedQuestions();
