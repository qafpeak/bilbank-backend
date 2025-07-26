// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomSchedule = require('../config/roomSchedule');

// GET /api/rooms/schedule
router.get('/schedule', (req, res) => {
  const rooms = Object.entries(roomSchedule).map(([roomId, times]) => ({
    roomId,
    startTime: times.start,
    endTime: times.end,
  }));

  res.json({ rooms });
});

module.exports = router;
