const express = require('express');
const app = express();
const port = 3000;

// Middleware to serve static files (optional, in case you want to serve HTML, CSS, JS files)
app.use(express.static('public'));

// Basic route to respond to requests at the root
app.get('/', (req, res) => {
  res.send('Hello, welcome to the ChatEasy server!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
