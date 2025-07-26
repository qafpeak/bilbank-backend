// utils/timeUtils.js
const moment = require('moment');
const schedule = require('../config/roomSchedule');

function isRoomActive(room) {
  const now = moment();
  const { start, end } = schedule[room];

  let todayStart = moment(start, 'HH:mm');
  let todayEnd = moment(end, 'HH:mm');

  // Eğer end < start ise, gece yarısını geçiyor demektir
  if (todayEnd.isBefore(todayStart)) {
    todayEnd.add(1, 'day');
  }

  return now.isBetween(todayStart, todayEnd);
}


module.exports = { isRoomActive };
