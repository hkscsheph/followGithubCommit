const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('webcam');
const statusDiv = document.getElementById('status');
let isGameOver = false;

// 1. 遊戲參數設定 (邏輯座標 3200 x 900)
const GS = {
  W: 3200,
  H: 900,
  INITIAL_HP: 1500,
  BASE_DMG: 30,
  DMG_PER_SEC: 50,
  MAX_DMG: 1400,
  BALL_SPEED_BASE: 40,
};

let detector;
let lastTime = 0;

// 玩家資料結構
const players = {
  left: {
    id: 'blue',
    color: '#0074D9',
    x: 400,
    y: 450,
    hp: GS.INITIAL_HP,
    charge: 0,
    isDefending: false,
    projectiles: [],
    side: 'left',
  },
  right: {
    id: 'red',
    color: '#FF4136',
    x: 2800,
    y: 450,
    hp: GS.INITIAL_HP,
    charge: 0,
    isDefending: false,
    projectiles: [],
    side: 'right',
  },
};

// --- 初始化區 ---

async function init() {
    // 1. 設定畫布解析度
    canvas.width = GS.W;
    canvas.height = GS.H;
  
    statusDiv.innerText = '正在連接 IP Cam 並加載模型...';
  
    // 2. 設定 IP Cam 來源
    // 注意：必須設定 crossorigin 否則 MoveNet 無法讀取像素資料
    video.crossOrigin = "anonymous"; 
    video.src = "http://localhost:3000/video_feed";
  
    // 3. 等待影片數據加載完成
    await new Promise((resolve) => {
      video.onloadeddata = () => {
        video.play();
        resolve();
      };
    });
  
    // 4. 初始化 MoveNet MultiPose
    try {
      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { 
          modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
          enableSmoothing: true 
        }
      );
      
      statusDiv.innerText = '連線成功，遊戲開始！';
      requestAnimationFrame(gameLoop);
    } catch (err) {
      statusDiv.innerText = '模型載入失敗: ' + err;
      console.error(err);
    }
  }

// --- 動作辨識邏輯 ---

function handlePose(poses) {
  // 依據 X 座標排序，確保左邊的人控制藍魚，右邊控制紅魚
  const sortedPoses = poses
    .filter((p) => p.score > 0.2)
    .sort((a, b) => a.keypoints[0].x - b.keypoints[0].x);

  // 重置狀態（每一幀重新判斷）
  players.left.isDefending = false;
  players.right.isDefending = false;

  if (sortedPoses.length >= 1) updatePlayerAction(players.left, sortedPoses[0]);
  if (sortedPoses.length >= 2)
    updatePlayerAction(players.right, sortedPoses[1]);
}

function updatePlayerAction(player, pose) {
  const kp = pose.keypoints;
  const getKp = (name) => kp.find((k) => k.name === name);

  const nose = getKp('nose');
  const lWrist = getKp('left_wrist');
  const rWrist = getKp('right_wrist');
  const lShoulder = getKp('left_shoulder');
  const rShoulder = getKp('right_shoulder');

  if (!nose || !lWrist || !rWrist) return;

  // 1. 雙手高舉過頭 (充電)
  if (lWrist.y < nose.y && rWrist.y < nose.y) {
    player.charge = Math.min(
      player.charge + GS.DMG_PER_SEC / 60,
      (GS.MAX_DMG / GS.DMG_PER_SEC) * (GS.DMG_PER_SEC / 60) + 1
    );
    // 簡化計算：每幀增加一點
    player.charge_val = (player.charge_val || 0) + GS.DMG_PER_SEC / 60;
    if (player.charge_val > GS.MAX_DMG) player.charge_val = GS.MAX_DMG;
  }
  // 2. 雙手向兩側伸直 (發動攻擊)
  else if (
    Math.abs(lWrist.y - lShoulder.y) < 50 &&
    Math.abs(rWrist.y - rShoulder.y) < 50 &&
    Math.abs(lWrist.x - rWrist.x) > 200
  ) {
    if (player.charge_val > 0) {
      fireProjectile(player);
      player.charge_val = 0;
    }
  }
  // 3. 雙手放在胸前 (防禦)
  else if (
    Math.abs(lWrist.x - rWrist.x) < 40 &&
    Math.abs(lWrist.y - nose.y) > 20
  ) {
    player.isDefending = true;
    if (player.charge_val > 0) player.charge_val -= 2; // 格擋時能量減少
  }
}

function fireProjectile(player) {
  const damage = GS.BASE_DMG + (player.charge_val || 0);
  const size = 30 + damage / 20;
  const speed = Math.max(8, GS.BALL_SPEED_BASE - size / 2);

  player.projectiles.push({
    x: player.x,
    y: player.y,
    size: size,
    damage: damage,
    speed: player.side === 'left' ? speed : -speed,
  });
}

// --- 遊戲主循環 ---

function update(dt) {
  if (isGameOver) return; // 如果遊戲結束，停止邏輯運算

  [players.left, players.right].forEach((p) => {
    const opponent = p.side === 'left' ? players.right : players.left;

    p.projectiles.forEach((proj, index) => {
      proj.x += proj.speed;

      const dist = Math.abs(proj.x - opponent.x);
      if (dist < 100) {
        let finalDmg = proj.damage;
        if (opponent.isDefending) finalDmg *= 0.1;

        opponent.hp -= finalDmg;
        opponent.charge_val = 0;
        p.projectiles.splice(index, 1);

        // --- 檢查勝負 ---
        if (opponent.hp <= 0) {
          opponent.hp = 0; // 確保血量不為負
          endGame(p.color); // 贏家是攻擊的那方
        }
      }

      if (proj.x < 0 || proj.x > GS.W) p.projectiles.splice(index, 1);
    });
  });
}

// 結束遊戲函式
function endGame(winnerColor) {
  isGameOver = true;
  const screen = document.getElementById('game-over-screen');
  const square = document.getElementById('winner-square');

  square.style.backgroundColor = winnerColor; // 設置正方形為贏家顏色
  screen.style.display = 'flex'; // 顯示結束畫面
}

// 重新開始函式
function resetGame() {
  // 重置所有玩家狀態
  players.left.hp = GS.INITIAL_HP;
  players.right.hp = GS.INITIAL_HP;
  players.left.charge_val = 0;
  players.right.charge_val = 0;
  players.left.projectiles = [];
  players.right.projectiles = [];
  players.left.isDefending = false;
  players.right.isDefending = false;

  isGameOver = false;
  document.getElementById('game-over-screen').style.display = 'none'; // 隱藏結束畫面
}

function draw() {
  ctx.clearRect(0, 0, GS.W, GS.H);

  [players.left, players.right].forEach((p) => {
    const isLeft = p.side === 'left';

    // --- 繪製魚的外型 ---
    ctx.fillStyle = p.color;

    // 1. 繪製身體 (橫向橢圓)
    // ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 繪製尾巴 (三角形)
    ctx.beginPath();
    if (isLeft) {
      // 藍魚：尾巴在左邊，三個點分別是：身體左側中心、左後上方、左後下方
      ctx.moveTo(p.x - 60, p.y); // 連結身體處
      ctx.lineTo(p.x - 120, p.y - 40); // 尾巴上角
      ctx.lineTo(p.x - 120, p.y + 40); // 尾巴下角
    } else {
      // 紅魚：尾巴在右邊
      ctx.moveTo(p.x + 60, p.y); // 連結身體處
      ctx.lineTo(p.x + 120, p.y - 40); // 尾巴上角
      ctx.lineTo(p.x + 120, p.y + 40); // 尾巴下角
    }
    ctx.closePath();
    ctx.fill();

    // 3. 繪製眼睛 (讓魚看起來有方向感)
    ctx.fillStyle = 'white';
    const eyeX = isLeft ? p.x + 40 : p.x - 40;
    ctx.beginPath();
    ctx.arc(eyeX, p.y - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(eyeX, p.y - 15, 4, 0, Math.PI * 3);
    ctx.fill();

    // 2. 繪製血量條背景 (深灰色)
    ctx.fillStyle = '#333';
    ctx.fillRect(p.x - 150, p.y + 100, 300, 30);

    // 3. 繪製血量條 (綠色)
    const currentHpWidth = (Math.max(0, p.hp) / GS.INITIAL_HP) * 300;
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(p.x - 150, p.y + 100, currentHpWidth, 30);

    // --- 新增：百分比數字顯示 ---
    const hpPercent = Math.max(0, Math.floor((p.hp / GS.INITIAL_HP) * 100));

    ctx.font = "bold 32px 'Segoe UI', Arial"; // 設定字體大小與樣式
    ctx.fillStyle = 'white'; // 文字顏色
    ctx.textAlign = 'center'; // 置中對齊

    // 將文字放在血量條下方約 40 像素處
    ctx.fillText(`${hpPercent}%`, p.x, p.y + 170);

    if (hpPercent < 30) {
      ctx.fillStyle = '#FF4136'; // 警告紅
    } else {
      ctx.fillStyle = '#2ECC40'; // 健康綠
    }

    // 繪製充電圓球 (深藍色)
    if (p.charge_val > 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y - 150, 20 + p.charge_val / 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 139, 0.8)';
      ctx.fill();
    }

    // 繪製防禦罩
    if (p.isDefending) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 130, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(173, 216, 230, 0.4)';
      ctx.strokeStyle = 'rgba(0, 116, 217, 0.6)';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fill();
    }

    // 繪製彈幕
    p.projectiles.forEach((proj) => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 139, 0.9)';
      ctx.fill();
    });
  });
}

async function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  const poses = await detector.estimatePoses(video);
  handlePose(poses);

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);
}

init();
