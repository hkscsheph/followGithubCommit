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

// --- 修改後的 game.js 部分片段 ---

async function init() {
  canvas.width = GS.W;
  canvas.height = GS.H;

  statusDiv.innerText = '正在連線 Proxy 串流...';

  // 1. 取得圖片元素 (原本是 video)
  const streamImg = document.getElementById('webcam');

  // 2. 初始化 MoveNet
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    { modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING }
  );

  // 3. 確保圖片加載後再啟動循環
  if (streamImg.complete) {
    startLoop();
  } else {
    streamImg.onload = startLoop;
  }
}

function startLoop() {
  statusDiv.innerText = '串流已連通，遊戲開始！';
  requestAnimationFrame(gameLoop);
}

async function gameLoop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  // 1. Get the current image
  const streamImg = document.getElementById('webcam');
  
  // 2. Perform Pose Detection on the image
  const poses = await detector.estimatePoses(streamImg);
  
  // 3. Process actions (no changes here)
  handlePose(poses);
  update(dt);
  
  // 4. Draw the game and THEN draw the debug info on top
  draw();
  drawDebugLayer(poses, streamImg); // Call the new debug function here

  requestAnimationFrame(gameLoop);
}
// --- 動作辨識邏輯 ---

function handlePose(poses) {
  // 取得影片原始寬度的中心點 (通常是 640/2 = 320)
  const videoCenterX = video.naturalWidth / 2;

  // 重置狀態
  players.left.isDefending = false;
  players.right.isDefending = false;

  // 遍歷所有偵測到的人
  poses.forEach((pose) => {
    if (pose.score < 0.2) return;

    const nose = pose.keypoints.find((k) => k.name === 'nose');
    if (!nose || nose.score < 0.3) return;

    // --- 關鍵邏輯：以畫面中線區分左右 ---
    // 因為有 CSS scaleX(-1) 鏡像，所以判斷邏輯要注意：
    // 如果你在鏡頭前站在左邊，你的 nose.x 會大於中線 (因為鏡像反轉)
    if (nose.x > videoCenterX) {
      updatePlayerAction(players.left, pose);
    } else {
      updatePlayerAction(players.right, pose);
    }
  });
}

// --- 修改後的動作判定片段 ---

function updatePlayerAction(player, pose) {
  const kp = pose.keypoints;
  const getKp = (name) => kp.find((k) => k.name === name);

  const nose = getKp('nose');
  const lWrist = getKp('left_wrist');
  const rWrist = getKp('right_wrist');
  const lShoulder = getKp('left_shoulder');
  const rShoulder = getKp('right_shoulder');

  // 確保關鍵點都有被偵測到且分數夠高
  if (!nose || !lWrist || !rWrist || !lShoulder || !rShoulder) return;
  if (lWrist.score < 0.3 || rWrist.score < 0.3) return;

  // 計算肩膀寬度作為基準 (基準尺)
  const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x);

  // 1. 充電：雙手高於鼻子
  if (lWrist.y < nose.y && rWrist.y < nose.y) {
    player.charge_val = Math.min((player.charge_val || 0) + 10, GS.MAX_DMG);
    player.isDefending = false; // 充電時不防禦
  }
  // 2. 防禦：兩手腕靠近 (距離小於 0.5 倍肩膀寬度) 且 位於鼻子下方
  else if (Math.abs(lWrist.x - rWrist.x) < shoulderWidth * 0.5) {
    player.isDefending = true;
  }
  // 3. 攻擊：兩手腕分開 (距離大於 1.5 倍肩膀寬度) 且 高度接近肩膀
  else if (Math.abs(lWrist.x - rWrist.x) > shoulderWidth * 1.5) {
    if (player.charge_val > 50) {
      fireProjectile(player);
      player.charge_val = 0;
    }
    player.isDefending = false;
  }
  else {
    player.isDefending = false;
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

  // 在 draw() 函式最後面加入這段測試代碼
// --- 除錯繪圖層 ---
  function drawDebugLayer(poses, videoSource) {

    
    // 1. 設定文字與線條樣式
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "cyan";
    ctx.textAlign = "left";

    // 2. 繪製 Proxy 解析度資訊
    ctx.fillText(`Raw Source: ${videoSource.naturalWidth}x${videoSource.naturalHeight}`, 20, 150);

    // 3. 處理每一個偵測到的姿勢
    poses.forEach((pose, index) => {
      const isPlayer1 = index === 0; // 排序後的第一個是左邊(Player 1)
      ctx.fillStyle = isPlayer1 ? "#00d4ff" : "#ff4136"; // 使用對應顏色

      if (pose.score > 0.2) {
        pose.keypoints.forEach((kp, kpIndex) => {
          // 只有信心分數大於 0.3 的點才畫出來
          if (kp.score > 0.3) {
            // --- 座標轉換 (關鍵部分) ---
            // 將原始影片座標 (kp.x) 縮放到遊戲畫布座標 (GS.W)
            const displayX = (kp.x / videoSource.naturalWidth) * GS.W;
            const displayY = (kp.y / videoSource.naturalHeight) * GS.H;

            // 繪製偵測點 (綠色圓點)
            ctx.beginPath();
            ctx.arc(displayX, displayY, 8, 0, Math.PI * 2);
            ctx.fillStyle = "lime";
            ctx.fill();

            // 可選：標註關鍵點序號
            ctx.fillStyle = "white";
            ctx.fillText(kpIndex, displayX + 10, displayY - 10);
          }
        });

        // 4. 繪製動作判定輔助線 (針對雙手舉高判定)
        const kp = pose.keypoints;
        const getKp = (name) => kp.find((k) => k.name === name);
        const nose = getKp('nose');
        const lWrist = getKp('left_wrist');
        const rWrist = getKp('right_wrist');

        if (nose && lWrist && rWrist) {
          ctx.strokeStyle = isPlayer1 ? "rgba(0, 212, 255, 0.5)" : "rgba(255, 65, 54, 0.5)";
          ctx.lineWidth = 4;
          
          // 座標轉換輔助函式
          const toUX = (rawX) => (rawX / videoSource.naturalWidth) * GS.W;
          const toUY = (rawY) => (rawY / videoSource.naturalHeight) * GS.H;

          // 畫鼻子到手腕的連線，看看有沒有舉高過鼻子
          if (nose.score > 0.3 && lWrist.score > 0.3) {
              ctx.beginPath();
              ctx.moveTo(toUX(nose.x), toUY(nose.y));
              ctx.lineTo(toUX(lWrist.x), toUY(lWrist.y));
              ctx.stroke();
          }
          if (nose.score > 0.3 && rWrist.score > 0.3) {
              ctx.beginPath();
              ctx.moveTo(toUX(nose.x), toUY(nose.y));
              ctx.lineTo(toUX(rWrist.x), toUY(rWrist.y));
              ctx.stroke();
          }
        }
      }
    });
  }
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
