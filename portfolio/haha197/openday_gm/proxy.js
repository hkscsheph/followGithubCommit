const express = require('express');
const axios = require('axios');
const app = express();

const camConfig = {
  url: "http://192.168.120.4/Streaming/channels/101/preview",
  auth: {
    username: 'admin',
    password: 'ictipcam1'
  }
};

app.get('/video_feed', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const response = await axios({
      method: 'get',
      url: camConfig.url,
      responseType: 'stream',
      auth: camConfig.auth, // 使用 axios 的內建驗證
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    res.setHeader('Content-Type', response.headers["content-type"]);

    // 將 Ipcam 的串流直接導向給瀏覽器
    response.data.pipe(res);

    // 當前端關閉網頁時，中斷與 Ipcam 的連線
    req.on('close', () => {
      console.log('前端已斷開連線，中止攝影機串流。');
      response.data.destroy();
    });

  } catch (err) {
    console.error('連線攝影機失敗:', err.message);
    res.status(500).send('攝影機連線錯誤');
  }
});

app.listen(3000, () => {
  console.log('穩定版 Proxy 運行於 http://localhost:3000/video_feed');
});