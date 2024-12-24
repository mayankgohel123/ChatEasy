const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Mock chat history (replace with actual data from a database in real-world scenarios)
let chatHistory = [];
let users = []; // Store users as an array (this should be a database in a real app)

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the sign-up page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the chat page (requires login)
app.get('/chat', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login'); // Redirect if user is not logged in
  }
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Handle user sign-up
app.post('/signup', (req, res) => {
  const { username, password, displayName } = req.body;
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.json({ success: false, message: 'Username already exists' });
  }
  users.push({ username, password, displayName });
  res.json({ success: true });
});

// Handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }
  res.json({ success: true, displayName: user.displayName });
});

// Initialize Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');
  let username; // Declare variable to store username per session

  socket.on('join group', ({ username, group }) => {
    this.username = username; // Set the username when joining a group
    console.log(`${username} joined ${group}`);
    socket.emit('chat history', chatHistory); // Send chat history when user joins the group
  });

  // Handle new messages
  socket.on('chat message', (data) => {
    console.log('Received message:', data);
    chatHistory.push({ sender: data.username, text: data.message });
    io.emit('chat message', { sender: data.username, text: data.message });
  });

  // Handle message deletion (if needed)
  socket.on('delete message', (data) => {
    chatHistory = chatHistory.filter(msg => msg.id !== data.messageId);
    io.emit('chat history', chatHistory); // Update all clients with the new history
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
