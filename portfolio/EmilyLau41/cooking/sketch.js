<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>AI 手勢神廚 - 追蹤模式</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
    <style>
        body { margin: 0; background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; }
        canvas { border: 2px solid #00ffcc; box-shadow: 0 0 15px #00ffcc; }
    </style>
</head>
<body>
<script>
let video;
let hands;
let predictions = [];
let foods = [];
let effects = [];
let score = 0;
let lastX = 0, lastY = 0;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(onResults);

  const camera = new Camera(video.elt, {
    onFrame: async () => { await hands.send({image: video.elt}); },
    width: 640, height: 480
  });
  camera.start();
}

function onResults(results) {
  predictions = results.multiHandLandmarks;
}

function draw() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (frameCount % 40 === 0) foods.push(new Food());

  // --- 繪製 Trace 與 邏輯處理 ---
  if (predictions && predictions.length > 0) {
    let hand = predictions[0];
    
    // 取得關鍵點座標
    let ix = (1 - hand[8].x) * width; // 食指尖
    let iy = hand[8].y * height;
    let tx = (1 - hand[4].x) * width; // 拇指尖
    let ty = hand[4].y * height;

    let centerX = (ix + tx) / 2;
    let centerY = (iy + ty) / 2;
    let handSpeed = dist(centerX, centerY, lastX, lastY);
    let pinchDist = dist(ix, iy, tx, ty);

    // 繪製手部 Trace (視覺痕跡)
    stroke(0, 255, 204);
    strokeWeight(2);
    line(ix, iy, tx, ty); // 兩指連線
    
    noStroke();
    fill(255, 0, 255); 
    ellipse(ix, iy, 12, 12); // 食指點
    fill(0, 255, 255); 
    ellipse(tx, ty, 12, 12); // 拇指點
    
    // 如果捏合，顯示強化效果
    if (pinchDist < 40) {
      fill(255, 255, 255, 150);
      ellipse(centerX, centerY, 30, 30);
    }

    // 碰撞偵測
    for (let i = foods.length - 1; i >= 0; i--) {
      if (handSpeed > 15 && dist(centerX, centerY, foods[i].x, foods[i].y) < 60) {
        score += 10;
        effects.push(new CutEffect(foods[i].x, foods[i].y));
        foods.splice(i, 1);
      }
    }
    lastX = centerX;
    lastY = centerY;
  }

  // 更新食物與特效
  for (let f of foods) { f.update(); f.display(); }
  for (let i = effects.length - 1; i >= 0; i--) {
    effects[i].display();
    if (effects[i].alpha <= 0) effects.splice(i, 1);
  }
  foods = foods.filter(f => f.y < height + 50);

  drawUI();
}

class Food {
  constructor() {
    this.x = random(50, width - 50);
    this.y = -50;
    this.speed = random(3, 7);
    this.type = random(['🍎', '🍋', '🍉', '🥦', '🥩', '🍞']);
  }
  update() { this.y += this.speed; }
  display() {
    textSize(50);
    textAlign(CENTER, CENTER);
    text(this.type, this.x, this.y);
  }
}

class CutEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 255;
  }
  display() {
    stroke(255, 255, 255, this.alpha);
    strokeWeight(4);
    line(this.x - 20, this.y - 20, this.x + 20, this.y + 20);
    line(this.x + 20, this.y - 20, this.x - 20, this.y + 20);
    this.alpha -= 20;
  }
}

function drawUI() {
  fill(0, 200);
  noStroke();
  rect(10, 10, 140, 45, 10);
  fill(255);
  textSize(22);
  text(`得分: ${score}`, 25, 40);
}
</script>
</body>
</html>