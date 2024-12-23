const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store messages in memory (for now) with group name as the key
let chatHistory = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for users joining a group
  socket.on('join group', ({ username, group }) => {
    socket.join(group);
    console.log(`${username} joined group: ${group}`);

    // Send the chat history for that group to the user joining
    if (chatHistory[group]) {
      socket.emit('chat history', chatHistory[group]);
    }
  });

  // Listen for chat messages
  socket.on('chat message', (data) => {
    const { group, username, message } = data;

    // If chat history doesn't exist for the group, initialize it
    if (!chatHistory[group]) {
      chatHistory[group] = [];
    }

    // Add the new message to the chat history
    chatHistory[group].push({ sender: username, text: message });

    // Emit the message to all users in the group (including the sender)
    io.to(group).emit('chat message', { sender: username, text: message });
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
