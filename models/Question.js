// models/Question.js
const { quizConnection } = require('../partner/db');
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },           // Soru metni
  correctAnswer: { type: String, required: true },  // Doğru cevap: "evet" veya "hayır"
  setId: { type: String, required: true },          // Soru seti ID'si
  order: { type: Number, required: true },          // Sorunun sıradaki yeri
});

module.exports = quizConnection.model('Question', questionSchema);
