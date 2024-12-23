const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (like HTML, CSS, and JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Route for the home page (login)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Change the path if needed
});

// Route for the chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html')); // Change the path if needed
});

// Handle socket events for the chat app
io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle joining a group
  socket.on('join group', (data) => {
    socket.join(data.group);
    console.log(`${data.username} joined group: ${data.group}`);
  });

  // Handle receiving and sending messages
  socket.on('chat message', (data) => {
    io.to(data.group).emit('chat message', { sender: data.username, text: data.message });
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
