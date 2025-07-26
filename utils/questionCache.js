// utils/questionCache.js
const Question = require('../models/Question');

let cachedQuestionsBySetId = {};

async function getDailyQuestions(setId) {
  // Daha önce bu set için cache varsa onu döndür
  if (cachedQuestionsBySetId[setId]) {
    return cachedQuestionsBySetId[setId];
  }

  // DB'den çek ve sıraya göre sırala
  const questions = await Question.find({ setId }).sort({ order: 1 });

  // Cache'e yaz
  cachedQuestionsBySetId[setId] = questions;

  return questions;
}

// Cache'i manuel olarak temizlemek istersen
function clearQuestionCache() {
  cachedQuestionsBySetId = {};
}

module.exports = { getDailyQuestions, clearQuestionCache };
