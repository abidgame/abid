module.exports = (io) => {
  // Game events
  const gameNamespace = io.of('/games');
  
  gameNamespace.on('connection', (socket) => {
    console.log('User connected to games namespace');
    
    // Handle game score updates
    socket.on('game_score_update', (data) => {
      const { gameId, userId, score } = data;
      // Broadcast to all players in the game room
      socket.to(`game:${gameId}`).emit('score_updated', {
        userId,
        score,
        timestamp: new Date()
      });
    });
    
    // Handle game chat messages
    socket.on('game_chat', (data) => {
      const { gameId, userId, username, message } = data;
      // Broadcast to all players in the game room
      socket.to(`game:${gameId}`).emit('chat_message', {
        userId,
        username,
        message,
        timestamp: new Date()
      });
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected from games namespace');
    });
  });
  
  // User events
  const userNamespace = io.of('/users');
  
  userNamespace.on('connection', (socket) => {
    console.log('User connected to users namespace');
    
    // Handle friend requests
    socket.on('friend_request', (data) => {
      const { to, from } = data;
      // Emit to specific user
      userNamespace.to(`user:${to}`).emit('new_friend_request', {
        from,
        timestamp: new Date()
      });
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected from users namespace');
    });
  });
  
  // Admin events
  const adminNamespace = io.of('/admin');
  
  adminNamespace.on('connection', (socket) => {
    console.log('Admin connected to admin namespace');
    
    // Handle new game published
    socket.on('game_published', (data) => {
      // Broadcast to all connected clients
      io.emit('new_game', data);
    });
    
    socket.on('disconnect', () => {
      console.log('Admin disconnected from admin namespace');
    });
  });
}; 