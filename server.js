// server.js
const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable detailed logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// SSL certificate options
const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem')
};

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));
console.log('Serving static files from:', path.join(__dirname, 'build'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
console.log('Serving static files from:', path.join(__dirname, 'public'));

// Handle all routes with index.html (SPA behavior)
app.get('/app', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
  console.log('Current working directory:', process.cwd());
  console.log('Directory contents:', fs.readdirSync(__dirname));
});
