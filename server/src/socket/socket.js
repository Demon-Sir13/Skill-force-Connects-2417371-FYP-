const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

let io;
// Map userId (string) -> socketId
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware — verify JWT from handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    // Join personal room so others can target this user
    socket.join(userId);

    // Broadcast online status
    socket.broadcast.emit('userOnline', userId);

    socket.on('sendMessage', async ({ receiverId, message, jobId }) => {
      try {
        const msg = await Message.create({
          senderId: userId,
          receiverId,
          jobId: jobId || null,
          message,
        });

        // Increment message count for sender
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, { $inc: { messageCount: 1 } });

        io.to(receiverId).emit('newMessage', msg);
        socket.emit('newMessage', msg);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('userOffline', userId);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO, onlineUsers };
