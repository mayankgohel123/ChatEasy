// Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize the app and the HTTP server
const app = express();
const server = http.createServer(app);

// Set up socket.io
const io = socketIo(server);

// Middleware setup (if needed)
app.use(cors());
app.use(express.json());

// Example API route
app.get('/', (req, res) => {
  res.send('Hello, welcome to the ChatEasy server!');
});

// Set up socket.io for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages
  socket.on('message', (msg) => {
    console.log('Received message:', msg);
    io.emit('message', msg); // Broadcast message to all connected clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Use the PORT environment variable (Render provides this for you)
const port = process.env.PORT || 10000; // Default to 10000 if no PORT is set
const host = '0.0.0.0'; // Bind to all network interfaces

// Start the server
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
