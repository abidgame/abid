const socketIo = require('socket.io');

exports.initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Not authenticated'));
    }
    socket.userId = userId;
    socket.join(`user:${userId}`);
    next();
  });

  // Handle connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Listen for join game event
    socket.on('join_game', (gameId) => {
      socket.join(`game:${gameId}`);
      console.log(`User ${socket.userId} joined game ${gameId}`);
    });

    // Listen for leave game event
    socket.on('leave_game', (gameId) => {
      socket.leave(`game:${gameId}`);
      console.log(`User ${socket.userId} left game ${gameId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};