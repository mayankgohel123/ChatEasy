const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;  // Use PORT provided by Render or fallback to 3000 locally

// Middleware to serve static files (optional, in case you want to serve HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Basic route to serve the index.html file from the 'public' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serving the index.html file
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
