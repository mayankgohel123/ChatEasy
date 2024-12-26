const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store chat history in memory (You can replace this with a database in production)
let chatHistory = {}; // Stores chat history for each group
let users = []; // In-memory user store (use a real database for production)

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

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
  if (!req.session.user) {
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

  // Set the session user data
  req.session.user = { username, displayName: user.displayName };
  res.json({ success: true, displayName: user.displayName });
});

// Initialize Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a group
  socket.on('join group', ({ username, group }) => {
    console.log(`${username} joined ${group}`);

    // Join the user to the specified group (Socket.IO room)
    socket.join(group);

    // If the group does not exist in chatHistory, initialize it
    if (!chatHistory[group]) {
      chatHistory[group] = [];
    }

    // Send the chat history to the user
    socket.emit('chat history', chatHistory[group]);
  });

  // Handle sending a message
  socket.on('chat message', (data) => {
    console.log('Received message:', data);

    // Ensure the group exists in chatHistory
    if (!chatHistory[data.group]) {
      chatHistory[data.group] = [];
    }

    // Create the new message object
    const newMessage = { sender: data.username, text: data.text };

    // Save the new message to the group's history
    chatHistory[data.group].push(newMessage);

    // Emit the new message to all members of the group
    io.to(data.group).emit('chat message', newMessage);
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
