// Backend server to serve GitHub token securely
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const githubToken = process.env.GITHUB_TOKEN;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoint to get token
  if (req.url === '/api/token' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ token: githubToken || '' }));
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  // Remove query string from URL
  filePath = filePath.split('?')[0];
  filePath = path.join(__dirname, filePath);
  
  console.log(`Requested: ${req.url}`);
  console.log(`Looking for: ${filePath}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`Error: ${err.message}`);
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GitHub token loaded: ${githubToken ? 'Yes' : 'No'}`);
});
