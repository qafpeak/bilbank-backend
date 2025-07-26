// socketHandlers/joinRoom.js
const { isRoomActive } = require('../utils/timeUtils');

function handleJoinRoom(socket, room) {
  if (!isRoomActive(room)) {
    socket.emit('error', { message: 'Bu oda şu anda aktif değil. Lütfen yayın saatini bekleyin.' });
    return;
  }

  socket.join(room);
  socket.emit('joined-room', room);
}
