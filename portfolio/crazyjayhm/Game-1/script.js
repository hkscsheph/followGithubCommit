console.log('向上跑酷 start!');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let score = 0;
let lives = 3;
let gameOver = false;
let gameSpeed = 200;  // 向上速度

const player = {
    x: 380,
    y: 450,
    width: 40,
    height: 50,
    speed: 400,
    vy: 0,  // 垂直速度
    jumping: false,
    jumpPower: -400,
    grounded: true
};

let obstacles = [];  // 前面黃障礙
let chasers = [];    // 後面紅怪物

const keys = {};
window.addEventListener('keydown', e => keys[e.keyCode] = true);
window.addEventListener('keyup', e => delete keys[e.keyCode]);

// Spawn obstacle (前面)
function spawnObstacle() {
    if (!gameOver && Math.random() < 0.015) {
        obstacles.push({
            x: Math.random() * (canvas.width - 60),
            y: -60,
            width: 60,
            height: 60,
            speed: gameSpeed * 0.8
        });
    }
}

// Spawn chaser (後面追)
function spawnChaser() {
    if (!gameOver && Math.random() < 0.008) {
        chasers.push({
            x: Math.random() * (canvas.width - 40),
            y: canvas.height + 40,
            width: 40,
            height: 40,
            speed: gameSpeed * 0.6
        });
    }
}

// Jump
function jump() {
    if (player.grounded && !gameOver) {
        player.vy = player.jumpPower;
        player.grounded = false;
        player.jumping = true;
    }
}

// Update
function update(dt) {
    if (gameOver) return;

    score += dt * 100;
    scoreEl.textContent = Math.floor(score);
    gameSpeed += dt * 10;  // 漸快

    // Player horizontal
    if (keys[37]) player.x = Math.max(0, player.x - player.speed * dt);
    if (keys[39]) player.x = Math.min(canvas.width - player.width, player.x + player.speed * dt);
    if (keys[38]) jump();

    // Player vertical (gravity)
    player.vy += 800 * dt;  // gravity
    player.y += player.vy * dt;
    if (player.y >= 450) {  // ground level
        player.y = 450;
        player.vy = 0;
        player.grounded = true;
        player.jumping = false;
    }

    // Move world up (simulate running up)
    obstacles.forEach(o => o.y += gameSpeed * dt);
    chasers.forEach(c => {
        c.y -= c.speed * dt;  // 追上來
        // Chase horizontally
        if (c.x < player.x) c.x += 100 * dt;
        if (c.x > player.x) c.x -= 100 * dt;
    });

    // Remove offscreen
    obstacles = obstacles.filter(o => o.y < canvas.height + 60);
    chasers = chasers.filter(c => c.y > -60);

    spawnObstacle();
    spawnChaser();

    // Collisions
    // Obstacles (front)
    obstacles.forEach(o => {
        if (player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y < o.y + o.height &&
            player.y + player.height > o.y) {
            lives--;
            livesEl.textContent = lives;
            obstacles = obstacles.filter(obs => obs !== o);
            if (lives <= 0) gameOver = true;
        }
    });

    // Chasers (behind)
    chasers.forEach(c => {
        if (player.x < c.x + c.width &&
            player.x + player.width > c.x &&
            player.y < c.y + c.height &&
            player.y + player.height > c.y) {
            lives--;
            livesEl.textContent = lives;
            chasers = chasers.filter(ch => ch !== c);
            if (lives <= 0) gameOver = true;
        }
    });
}

// Draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    for (let i = 0; i < canvas.width; i += 100) {
        ctx.beginPath();
        ctx.moveTo(i, 500);
        ctx.lineTo(i + 50, 500);
        ctx.stroke();
    }

    // Player blue
    ctx.fillStyle = '#0066FF';
    ctx.shadowColor = '#00AAFF';
    ctx.shadowBlur = 15;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Obstacles yellow (front)
    ctx.fillStyle = 'orange';
    obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.width, o.height));

    // Chasers red (behind)
    ctx.fillStyle = 'red';
    chasers.forEach(c => ctx.fillRect(c.x, c.y, c.width, c.height));

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('最終分數: ' + Math.floor(score), canvas.width/2, canvas.height/2 + 60);
        ctx.fillText('F5 重玩', canvas.width/2, canvas.height/2 + 100);
    }
}

// Loop
let lastTime = 0;
function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.016);
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

loop(0);d