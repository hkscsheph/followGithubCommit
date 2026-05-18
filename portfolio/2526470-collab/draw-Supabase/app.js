// 1. 初始化 Supabase
const SUPABASE_URL = 'https://hkqgnylrdgppazjecswz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CkBdfHDrHvytlqoRx81rMg_mBx8j3m8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const clearBtn = document.getElementById('clearBtn');

let isDrawing = false;
let lastPos = { x: 0, y: 0 };

// 2. 建立 Broadcast 頻道
const channel = supabaseClient.channel('drawing-room', {
  config: { broadcast: { self: false } }, // self: false 表示不接收自己發出的消息
});

channel
  .on('broadcast', { event: 'draw' }, (payload) => {
    const { from, to, color } = payload.payload;
    drawLine(from, to, color, false);
  })
  .on('broadcast', { event: 'clear' }, () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  })
  .subscribe((statusText) => {
    if (statusText === 'SUBSCRIBED') {
      status.innerText = '已連線 (多人同步中)';
    }
  });

// 3. 繪圖函數
function drawLine(from, to, color = 'black', shouldBroadcast = true) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.closePath();

  // 如果是本地繪製，則廣播給其他用戶
  if (shouldBroadcast) {
    channel.send({
      type: 'broadcast',
      event: 'draw',
      payload: { from, to, color },
    });
  }
}

// 4. 滑鼠事件監聽
canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  lastPos = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const currentPos = { x: e.offsetX, y: e.offsetY };
  drawLine(lastPos, currentPos, 'black', true);
  lastPos = currentPos;
});

canvas.addEventListener('mouseup', () => (isDrawing = false));
canvas.addEventListener('mouseout', () => (isDrawing = false));

// 5. 清除畫板
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  channel.send({
    type: 'broadcast',
    event: 'clear',
  });
});
