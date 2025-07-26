// index.js
require('dotenv').config(); // .env dosyasını yükle

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');

const setupWebSocket = require('./websocket/socketServer');
const startQuestionBroadcast = require('./websocket/questionPublisher');
const answersRoutes = require('./routes/answers');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

const { quizConnection, bilbankConection} = require('./partner/db');
// Routes
app.use('/users', userRoutes);
app.use('/api/rooms', roomRoutes); 
app.use('/answers', answersRoutes);

// HTTP sunucusu oluştur
const server = http.createServer(app);

// WebSocket başlat
setupWebSocket(server);

// Soru yayınını başlat
startQuestionBroadcast();

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`🚀 API + WebSocket çalışıyor: http://localhost:${PORT}`);
});
