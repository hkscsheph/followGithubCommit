console.log('進階遊戲 loaded!');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
    scoreEl: document.getElementById('score'),
    livesEl: document.getElementById('lives'),
    timerEl: document.getElementById('timer'),
    finalScoreEl: document.getElementById('finalScore'),
    gameOverEl: document.getElementById('gameOver')
};

// Game state
let gameState = {
    score: 0,
    lives: 3,
    startTime: Date.now(),
    gameOver: false
};

// Player
const player = {
    x: 256,
    y: 400,
    width: 32,
    height: 32,
    speed: 250
};

// Arrays
let bullets = [];
let enemies = [];

// Input
const keys = {};
window.addEventListener('keydown', e => keys[e.keyCode] = true);
window.addEventListener('keyup', e => keys[e.keyCode] = false);

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 16;
        this.speed = 400;
    }
    update(dt) {
        this.y -= this.speed * dt;
        return this.y > -this.height; // Still on screen
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.x = 32 + Math.random() * (canvas.width - 64);
        this.y = -32;
        this.width = 28;
        this.height = 28;
        this.speed = 100 + Math.random() * 50;
    }
    update(dt, playerX, playerY) {
        // Chase player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }
        return this.y < canvas.height + this.height;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.shadowColor = 'darkred';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x + 14, this.y + 14, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Spawn enemy
function spawnEnemy() {
    if (!gameState.gameOver) {
        enemies.push(new Enemy());
    }
}

// Shoot
function shoot() {
    bullets.push(new Bullet(player.x + 12, player.y));
    gameState.score += 10;
}

// Collision
function checkCollisions() {
    // Bullet vs Enemy
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (b.x < e.x + e.width &&
                b.x + b.width > e.x &&
                b.y < e.y + e.height &&
                b.y + b.height > e.y) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                gameState.score += 100;
                return;
            }
        }
    }
    // Enemy vs Player
    for (let e of enemies) {
        if (player.x < e.x + e.width &&
            player.x + player.width > e.x &&
            player.y < e.y + e.height &&
            player.y + player.height > e.y) {
            gameState.lives--;
            enemies = enemies.filter(enemy => enemy !== e);
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    }
}

function gameOver() {
    gameState.gameOver = true;
    ui.finalScoreEl.textContent = gameState.score;
    ui.gameOverEl.style.display = 'block';
}

// Update
function update(dt) {
    if (gameState.gameOver) return;

    // Player movement
    if (keys[37]) player.x = Math.max(0, player.x - player.speed * dt);
    if (keys[39]) player.x = Math.min(canvas.width - player.width, player.x + player.speed * dt);
    if (keys[38]) player.y = Math.max(0, player.y - player.speed * dt);
    if (keys[40]) player.y = Math.min(canvas.height - player.height, player.y + player.speed * dt);

    // Shoot (spacebar)
    if (keys[32]) {
        shoot();
        delete keys[32]; // Prevent rapid fire
    }

    // Update bullets
    bullets = bullets.filter(b => b.update(dt));

    // Update enemies
    enemies = enemies.filter(e => e.update(dt, player.x, player.y));

    // Spawn enemies
    if (Math.random() < 0.02) spawnEnemy();

    checkCollisions();

    // Timer
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    ui.timerEl.textContent = elapsed;

    // Update UI
    ui.scoreEl.textContent = gameState.score;
    ui.livesEl.textContent = gameState.lives;
}

// Draw
function draw() {
    // Background stars
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const x = (Date.now() * 0.01 + i * 100) % canvas.width;
        ctx.fillRect(x, (i * 20) % canvas.height, 2, 2);
    }

    // Draw player (cyan glow)
    ctx.fillStyle = 'cyan';
    ctx.shadowColor = 'cyan';
    ctx.shadowBlur = 20;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Draw bullets
    bullets.forEach(b => b.draw());

    // Draw enemies
    enemies.forEach(e => e.draw());
}

// Game loop
let lastTime = 0;
function loop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

loop(0);D