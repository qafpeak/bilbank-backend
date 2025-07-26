// redis/redisClient.js
const { createClient } = require('redis');

const redis = createClient();
redis.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redis.connect();
})();

module.exports = redis;
