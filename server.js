// server.js
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// SSL certificate options
const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem')
};

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes with index.html (SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running at https://0.0.0.0:${PORT}`);
});
