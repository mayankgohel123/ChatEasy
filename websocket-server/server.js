const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');  // Import the fs module to read and write files
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Path for storing chat history
const chatHistoryFilePath = path.join(__dirname, 'chatHistory.json');

// Read chat history from file (if it exists)
function loadChatHistory() {
  if (fs.existsSync(chatHistoryFilePath)) {
    const rawData = fs.readFileSync(chatHistoryFilePath);
    return JSON.parse(rawData);
  }
  return {}; // Return an empty object if the file does not exist
}

// Write chat history to file
function saveChatHistory(groups) {
  fs.writeFileSync(chatHistoryFilePath, JSON.stringify(groups, null, 2));
}

// Store messages per group in memory (it will be saved in the file)
let groups = loadChatHistory();

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serving the index.html file
});

// Serve the chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));  // Serving the chat.html file
});

// Handle socket events for the chat app
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for user joining a group
  socket.on('join group', (data) => {
    const { username, group } = data;

    // Add user to the group
    socket.join(group);

    // Send the chat history of the group (from file)
    if (groups[group]) {
      socket.emit('chat history', groups[group]);
    } else {
      socket.emit('chat history', []);  // No history if group doesn't exist
    }

    console.log(`${username} joined group ${group}`);
  });

  // Listen for new messages
  socket.on('chat message', (data) => {
    const { group, username, message } = data;

    // Store the new message in the group
    if (!groups[group]) {
      groups[group] = [];  // Create group if it doesn't exist
    }

    // Add the new message to the group's chat history
    groups[group].push({ sender: username, text: message });

    // Save updated chat history to file
    saveChatHistory(groups);

    // Emit the new message to the group
    io.to(group).emit('chat message', { sender: username, text: message });
  });

  // Handle delete message event
  socket.on('delete message', (data) => {
    const { group, messageIndex } = data;

    // Check if the group exists and if the message index is valid
    if (groups[group] && groups[group][messageIndex]) {
      // Remove the message from the group's chat history
      groups[group].splice(messageIndex, 1);

      // Save updated chat history to file
      saveChatHistory(groups);

      // Emit the updated chat history to the group
      io.to(group).emit('chat history updated', groups[group]);
    }
  });

  // Handle disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
