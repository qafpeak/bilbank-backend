const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const redis = require('../redis/redisClient');

// Schemas
const AnswerSchema = new mongoose.Schema({
  roomId: String,
  setId: String,
  questionOrder: Number,
  trueOfUser: [String],
});

const PointSchema = new mongoose.Schema({
  roomId: String,
  userId: String,
  point: Number,
});

const QuestionSchema = new mongoose.Schema({
  roomId: String,
  setId: String,
  order: Number,
  text: String,
  correctAnswer: String,
});

// Modeller
const Answer = mongoose.model('Answer', AnswerSchema);
const Point = mongoose.model('Point', PointSchema);
const Question = mongoose.model('Question', QuestionSchema);

// Cevap gönderme endpoint'i
router.post('/submit', async (req, res) => {
  try {
    const { userId, roomId, setId, questionOrder, userAnswer } = req.body;
    if (!userId || !roomId || !setId || questionOrder === undefined || !userAnswer) {
      return res.status(400).json({ error: 'Eksik parametre' });
    }

    // Soruyu veritabanından bul
    const question = await Question.findOne({ roomId, setId, order: questionOrder });
    if (!question) return res.status(404).json({ error: 'Soru bulunamadı' });

    const isCorrect = (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase());
    if (!isCorrect) {
      return res.json({ isCorrect: false, points: 0 });
    }

    // Doğru cevap verenler listesine ekle
    let answerDoc = await Answer.findOne({ roomId, setId, questionOrder });
    if (!answerDoc) {
      answerDoc = new Answer({ roomId, setId, questionOrder, trueOfUser: [userId] });
      await answerDoc.save();
    } else if (!answerDoc.trueOfUser.includes(userId)) {
      answerDoc.trueOfUser.push(userId);
      await answerDoc.save();
    } else {
      return res.json({ isCorrect: true, points: 0, message: 'Zaten doğru cevap verdiniz' });
    }

    // Puan güncelle
    let pointDoc = await Point.findOne({ roomId, userId });
    if (!pointDoc) {
      pointDoc = new Point({ roomId, userId, point: 10 });
    } else {
      pointDoc.point += 10;
    }
    await pointDoc.save();

    // ✅ Liderlik sıralamasını güncelle ve yayınla
    await publishLeaderboard(roomId);

    return res.json({ isCorrect: true, points: 10 });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Liderlik tablosu HTTP endpoint (opsiyonel, WebSocket harici kullanım için)
router.get('/leaderboard', async (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.status(400).json({ error: 'Eksik roomId' });

  try {
    const topUsers = await Point.find({ roomId }).sort({ point: -1 }).limit(20);
    res.json(topUsers);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 🔁 Gerçek zamanlı liderlik tablosu yayını
async function publishLeaderboard(roomId) {
  try {
    const topUsers = await Point.find({ roomId }).sort({ point: -1 }).limit(10);

    const payload = {
      type: 'leaderboard-update',
      roomId,
      leaderboard: topUsers.map((u, i) => ({
        rank: i + 1,
        userId: u.userId,
        point: u.point,
      })),
    };

    await redis.publish('leaderboard-broadcast', JSON.stringify(payload));
  } catch (err) {
    console.error('Leaderboard publish error:', err);
  }
}

module.exports = router;
