const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = []; // Store users as an array (this should be a database in a real app)

// Middleware to parse JSON requests
app.use(express.json());

// Serve the static files (HTML, CSS, etc.)
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

  // Check if the username is taken
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.json({ success: false, message: 'Username already exists' });
  }

  // Add the new user to the users array
  users.push({ username, password, displayName });
  res.json({ success: true });
});

// Handle user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists and password matches
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid username or password' });
  }

  res.json({ success: true, displayName: user.displayName });
});

// Initialize Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Handle user messaging and group chat logic
  // (This part remains the same as your original socket handling logic)
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
