const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000; canvas.height = 500;

const GROUND_Y = 450;
let frame = 0;

// 玩家與 Boss 的基礎數據
const player = {
  x: 200, y: GROUND_Y, hp: 100, vx: 0,
  isAttacking: false, isInvinc: 0,
  dir: 1, // 1: 右, -1: 左
  skills: { dashCD: 0 }
};

const boss = {
  x: 800, y: GROUND_Y, hp: 100, 
  phase: 1, state: 'idle', timer: 0,
  dir: -1
};

// --- 繪圖工具：帶裝甲的騎士火柴人 ---
function drawKnight(x, y, color, dir, isBoss = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 10; ctx.shadowColor = color;

  // 1. 骨架與身體
  ctx.beginPath();
  ctx.moveTo(0, -40); ctx.lineTo(0, -10); // 軀幹
  
  // 2. 頭盔與護甲 (視覺豐富化)
  ctx.strokeRect(-8, -55, 16, 16); // 頭盔
  ctx.fillStyle = color;
  ctx.fillRect(-10, -40, 20, 15); // 胸甲
  
  // 3. 手持長劍
  ctx.beginPath();
  ctx.strokeStyle = '#fff';
  ctx.moveTo(10, -25); ctx.lineTo(35, -25); // 劍身
  ctx.moveTo(10, -32); ctx.lineTo(10, -18); // 護手
  ctx.stroke();

  // 4. 動態手腳 (隨時間微動)
  let move = Math.sin(frame * 0.1) * 5;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(0, -35); ctx.lineTo(15, -25 + move); // 手
  ctx.moveTo(0, -10); ctx.lineTo(-10, 0); // 腳1
  ctx.moveTo(0, -10); ctx.lineTo(10, 0);  // 腳2
  ctx.stroke();
  ctx.restore();
}

// --- 技能邏輯 ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'q' && player.skills.dashCD <= 0) { // 衝刺斬
    player.vx = player.dir * 15;
    player.skills.dashCD = 60;
    checkHit(60); 
  }
});

function checkHit(range) {
  if (Math.abs(player.x - boss.x) < range) {
    boss.hp -= 5;
    if (boss.hp < 50) boss.phase = 2;
  }
}

// --- 遊戲循環 ---
function update() {
  frame++;
  
  // 玩家物理
  player.x += player.vx;
  player.vx *= 0.9; // 摩擦力
  if (player.x < 50) player.x = 50;
  if (player.x > 950) player.x = 950;
  if (player.skills.dashCD > 0) player.skills.dashCD--;

  // Boss AI (二階段更激進)
  boss.timer++;
  const speed = boss.phase === 2 ? 4 : 2;
  if (boss.x > player.x + 50) { boss.x -= speed; boss.dir = -1; }
  else if (boss.x < player.x - 50) { boss.x += speed; boss.dir = 1; }

  // Boss 技能：黑影閃現
  if (boss.timer % 120 === 0) {
    if (Math.abs(boss.x - player.x) < 100) {
      player.hp -= 10;
      player.isInvinc = 30;
    }
  }

  // 更新 UI
  document.getElementById('boss-hp').style.width = boss.hp + '%';
  document.getElementById('player-hp').style.width = player.hp + '%';
}

function draw() {
  ctx.fillStyle = 'rgba(10, 10, 20, 0.4)'; // 殘影
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫地面
  ctx.strokeStyle = '#333';
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(canvas.width, GROUND_Y); ctx.stroke();

  // 畫騎士與 Boss
  drawKnight(player.x, player.y, '#00d4ff', player.dir);
  drawKnight(boss.x, boss.y, boss.phase === 2 ? '#fff' : '#ff4444', boss.dir, true);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();