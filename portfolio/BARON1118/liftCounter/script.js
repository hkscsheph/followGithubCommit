// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 提供 HTML 檔案給用戶端
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 處理即時連線
io.on('connection', (socket) => {
  console.log('有用戶連線了 (A user connected)');

  // 取得目前連線的 Socket 數量
  const count = io.engine.clientsCount;
  
  // 廣播新的數量給所有人
  io.emit('userCountUpdate', count);

  socket.on('disconnect', () => {
    console.log('有用戶斷線了 (A user disconnected)');
    
    // 用戶離開後，廣播更新後的數量
    // 我們重新計算，因為該 Socket 已經斷線
    io.emit('userCountUpdate', io.engine.clientsCount);
  });
});

server.listen(3000, () => {
  console.log('伺服器正在執行中： http://localhost:3000');
});
