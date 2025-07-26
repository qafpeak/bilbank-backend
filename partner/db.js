// db.js
const mongoose = require('mongoose');

const quizConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/quiz', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bilbankConnection = mongoose.createConnection('mongodb://127.0.0.1:27017/bilbank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  quizConnection,
  bilbankConnection,
};
