// websocket/socketServer.js
const WebSocket = require('ws');
const redis = require('../redis/redisClient');

const rooms = {};

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const room = urlParams.get('room') || 'room1';

    if (!rooms[room]) rooms[room] = new Set();
    rooms[room].add(ws);

    console.log(`📡 Yeni kullanıcı bağlandı - Room: ${room}, Toplam: ${rooms[room].size}`);

    // Yeni katılan kullanıcıya mevcut soru gönder
    redis.get(`current-question-${room}`).then((data) => {
      if (data && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'new-question',
          question: JSON.parse(data)
        }));
      }
    });

    ws.on('close', () => {
      rooms[room].delete(ws);
      console.log(`❌ Kullanıcı ayrıldı - Room: ${room}, Kalan: ${rooms[room].size}`);
    });
  });

  // Redis aboneliği
  const subscriber = redis.duplicate();
  subscriber.connect().then(() => {
    subscriber.subscribe('question-broadcast', (msg) => {
      const { room, question } = JSON.parse(msg);
      if (!rooms[room]) return;

      rooms[room].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new-question',
            question
          }));
        }
      });
    });

    subscriber.subscribe('leaderboard-broadcast', (msg) => {
      const { roomId, leaderboard } = JSON.parse(msg);
      if (!rooms[roomId]) return;

      rooms[roomId].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'leaderboard-update',
            leaderboard
          }));
        }
      });
    });
  });
}

module.exports = setupWebSocket;
