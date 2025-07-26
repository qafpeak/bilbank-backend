const redisClient = require('../redis/redisClient');
const { getDailyQuestions } = require('../utils/questionCache');
const roomSchedule = require('../config/roomSchedule');

const rooms = ['room1', 'room2', 'room3', 'room4'];
const questionIndexes = {
  room1: 0,
  room2: 0,
  room3: 0,
  room4: 0,
};

// Her gün için setId (örnek: '20250724')
function getTodaySetId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// ⏰ Oda yayında mı?
function isRoomActive(room) {
  const schedule = roomSchedule[room];
  if (!schedule) return false;

  const now = new Date();

  const [startHour, startMinute] = schedule.start.split(':').map(Number);
  const [endHour, endMinute] = schedule.end.split(':').map(Number);

  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
  const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute);

  return now >= startTime && now < endTime;
}

async function publishNextQuestionForRoom(room) {
  try {
    const setId = getTodaySetId();
    const questions = await getDailyQuestions(setId);

    console.log(`[${room}] ${setId} için ${questions.length} soru bulundu`);

    const index = questionIndexes[room];
    if (index >= questions.length) {
      console.log(`❗ [${room}] Yayınlanacak başka soru kalmadı.`);
      return;
    }

    const question = questions[index];

    const payload = {
      room,
      question: {
        text: question.text,
        answer: question.answer, // yayında istemiyorsan silebilirsin
        order: question.order,
      }
    };

    await redisClient.publish('question-broadcast', JSON.stringify(payload));
    await redisClient.set(`current-question-${room}`, JSON.stringify(payload.question));

    console.log(`📤 [${room}] Soru ${question.order + 1} yayınlandı`);

    questionIndexes[room]++;
  } catch (err) {
    console.error(`❌ [${room}] Soru yayınlama hatası:`, err);
  }
}

function startQuestionBroadcast() {
  setInterval(() => {
    rooms.forEach((room) => {
      if (isRoomActive(room)) {
        publishNextQuestionForRoom(room);
      } else {
        console.log(`⏳ [${room}] Şu an aktif değil (yayın saati dışında).`);
      }
    });
  }, 15000); // 15 saniyede bir
}

module.exports = startQuestionBroadcast;
