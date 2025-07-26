// models/Answer.js (mongoose şeması örneği)
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: String,
  roomId: String,
  setId: String,
  questionOrder: Number,
  userAnswer: String,
  isCorrect: Boolean,
  points: Number,
  answeredAt: Date,
});

module.exports = mongoose.model('Answer', answerSchema);

// controllers/answerController.js
const Answer = require('../models/Answer');
const Question = require('../models/Question'); // soru modeli, doğru cevabı içerir
const User = require('../models/User');

exports.submitAnswer = async (req, res) => {
  const { userId, roomId, setId, questionOrder, userAnswer } = req.body;

  try {
    // 1. Soru doğru cevabı al
    const question = await Question.findOne({ setId, order: questionOrder });
    if (!question) return res.status(404).json({ error: "Soru bulunamadı" });

    // 2. Kullanıcının bu soruya daha önce cevap verip vermediğini kontrol et
    const existingAnswer = await Answer.findOne({ userId, roomId, setId, questionOrder });
    if (existingAnswer) {
      return res.status(400).json({ error: "Zaten cevap verildi" });
    }

    // 3. Cevabın doğruluğunu kontrol et
    const isCorrect = question.correctAnswer === userAnswer.toLowerCase();

    // 4. Puan hesapla (doğru ise 10 puan)
    const points = isCorrect ? 10 : 0;

    // 5. Cevabı kaydet
    const answer = new Answer({
      userId,
      roomId,
      setId,
      questionOrder,
      userAnswer,
      isCorrect,
      points,
      answeredAt: new Date(),
    });
    await answer.save();

    // 6. Kullanıcının toplam puanını güncelle
    await User.updateOne(
      { _id: userId },
      { $inc: { totalPoints: points } }
    );

    // 7. Geri dönüş
    res.json({ isCorrect, points });

    // 8. (Opsiyonel) Burada WebSocket ile liderlik tablosunu tüm odadaki kullanıcılara yayınla

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
