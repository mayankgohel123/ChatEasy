const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 3000;  // Use PORT provided by Render or fallback to 3000 locally

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

let groups = {}; // Store messages per group

// Middleware to serve static files (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Basic route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serving the index.html file
});

// Listen for user joining a group
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle join group event
  socket.on('join group', (data) => {
    const { username, group } = data;

    // Add user to the group
    socket.join(group);

    // Send the chat history of the group
    if (groups[group]) {
      socket.emit('chat history', groups[group]);
    } else {
      socket.emit('chat history', []); // No history if group doesn't exist
    }

    console.log(`${username} joined group ${group}`);
  });

  // Listen for new messages from users
  socket.on('chat message', (data) => {
    const { group, username, message } = data;

    // Store the new message in the group
    if (!groups[group]) {
      groups[group] = [];  // Create group if it doesn't exist
    }

    // Add the new message to the group's chat history
    groups[group].push({ sender: username, text: message });

    // Emit the new message to the group
    io.to(group).emit('chat message', { sender: username, text: message });
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
