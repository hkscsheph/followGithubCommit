const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1000; canvas.height = 500;

const GRAVITY = 0.65;
const GROUND_Y = 440;
let frame = 0, gameState = 'playing', phase = 1, projectiles = [];
let fKeyPressTime = 0;
const bgm = document.getElementById('bgm');

const input = { a: false, d: false, w: false, f: false };

// 音樂控制
function playMusic() {
    bgm.volume = 0.4;
    bgm.play().catch(() => console.log("等待用戶點擊以播放音樂"));
}

window.addEventListener('keydown', e => {
    if (gameState !== 'playing') return;
    playMusic(); // 玩家第一次按鍵時啟動音樂
    const k = e.key.toLowerCase();
    if (k === 'a') input.a = true;
    if (k === 'd') input.d = true;
    if (k === 'w' || e.key === ' ') input.w = true;
    if (k === 'f') { if (!input.f) fKeyPressTime = Date.now(); input.f = true; }
});

window.addEventListener('keyup', e => {
    const k = e.key.toLowerCase();
    if (k === 'a') input.a = false;
    if (k === 'd') input.d = false;
    if (k === 'w' || e.key === ' ') input.w = false;
    if (k === 'f') input.f = false;
});

document.getElementById('retry-btn').onclick = () => { location.reload(); };

class Knight {
    constructor(x, y, color, scale, isBoss = false) {
        this.x = x; this.y = y; this.vx = 0; this.vy = 0;
        this.color = color; this.scale = scale;
        this.hp = isBoss ? 150 : 100;
        this.stamina = 100;
        this.dir = isBoss ? -1 : 1;
        this.onGround = false; this.isBoss = isBoss;
        this.atkFrame = 0; this.invinc = 0; this.walkCycle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.dir * this.scale, this.scale);
        ctx.rotate(this.vx * 0.04);
        if (this.invinc > 0 && frame % 4 < 2) ctx.globalAlpha = 0.3;
        ctx.strokeStyle = this.color; ctx.lineWidth = 2.5;
        ctx.strokeRect(-7, -55, 14, 15);
        ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -10);
        let leg = Math.sin(this.walkCycle) * 12;
        ctx.moveTo(0, -10); ctx.lineTo(-8 + leg, 0); ctx.moveTo(0, -10); ctx.lineTo(8 - leg, 0);
        ctx.stroke();
        ctx.strokeStyle = "#fff"; ctx.beginPath();
        let ang = this.atkFrame > 0 ? -2.4 : (input.f && !this.isBoss ? 0.6 : 0.2);
        ctx.rotate(ang); ctx.moveTo(5, -35); ctx.lineTo(this.isBoss ? 85 : 50, -35);
        ctx.stroke(); ctx.restore();
    }

    update() {
        if (gameState !== 'playing' && phase !== 'transition') return;
        this.vy += GRAVITY; this.x += this.vx; this.y += this.vy;
        if (this.y >= GROUND_Y) { this.y = GROUND_Y; this.vy = 0; this.onGround = true; }
        if (Math.abs(this.vx) > 0.1) this.walkCycle += 0.25;
        if (!input.f && this.stamina < 100) this.stamina += 0.25;
        if (this.atkFrame > 0) this.atkFrame--;
        if (this.invinc > 0) this.invinc--;
        this.x = Math.max(30, Math.min(970, this.x));
    }

    attack() {
        if (this.atkFrame > 0 || (input.f && !this.isBoss)) return;
        this.atkFrame = 25;
        const r = this.isBoss ? (phase === 2 ? 220 : 120) : 110;
        if (Math.abs(this.x - (this.isBoss ? player.x : boss.x)) < r) {
            this.isBoss ? playerHit() : bossHit(10);
        }
    }
}

let player = new Knight(150, GROUND_Y, '#8899aa', 1.1);
let boss = new Knight(850, GROUND_Y, '#550000', 1.6, true);

function triggerParryEffect() {
    const container = document.getElementById('game-container');
    container.classList.add('shake-effect');
    setTimeout(() => container.classList.remove('shake-effect'), 200);
}

function playerHit() {
    if (player.invinc > 0 || gameState !== 'playing') return;
    let parryTime = Date.now() - fKeyPressTime;
    if (input.f && parryTime < 180) {
        boss.stamina -= 15; boss.vx = player.dir * -12;
        triggerParryEffect();
        return;
    }
    if (input.f && player.stamina > 0) {
        player.stamina -= 15; player.hp -= 2; player.vx = boss.dir * 5;
    } else {
        player.hp -= 15; player.invinc = 40; player.vx = boss.dir * 12;
    }
    if (player.hp <= 0) {
        gameState = 'death';
        document.getElementById('death-screen').style.display = 'flex';
        input.a = input.d = input.w = input.f = false;
    }
}

function bossHit(amt) {
    if (boss.hp <= 0 || phase === 'transition' || gameState !== 'playing') return;
    boss.hp -= amt; boss.stamina -= 5;
    if (boss.stamina <= 0) { boss.hp -= 25; boss.stamina = 100; }
    if (boss.hp <= 0 && phase === 1) triggerPhase2();
    if (boss.hp <= 0 && phase === 2) {
        gameState = 'win';
        document.getElementById('win-screen').style.display = 'flex';
        input.a = input.d = input.w = input.f = false;
    }
}

function triggerPhase2() {
    phase = 'transition';
    document.getElementById('msg').style.opacity = 1;
    document.getElementById('boss-name').innerText = "ASHINA VENGEANCE - 無盡 (覺醒)";
    
    // 修正 Bug：確保變身期間物理依然運作但 AI 暫停
    let upCount = 0;
    let transitionInterval = setInterval(() => {
        boss.y -= 4;
        upCount++;
        if (upCount > 60) {
            clearInterval(transitionInterval);
            setTimeout(() => {
                boss.y = GROUND_Y;
                boss.scale = 2.8;
                boss.hp = 150;
                boss.color = '#ff4444';
                phase = 2; // 重新啟動 AI
                document.getElementById('msg').style.opacity = 0;
                document.getElementById('game-container').classList.add('phase2-bg');
            }, 1000);
        }
    }, 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, 1000, 500);
    frame++;

    if (gameState === 'playing' && phase !== 'transition') {
        if (input.a && !input.d) { player.vx -= 0.6; player.dir = -1; }
        else if (input.d && !input.a) { player.vx += 0.6; player.dir = 1; }
        else { player.vx *= 0.82; }
        player.vx = Math.max(-7, Math.min(7, player.vx));
        if (input.w && player.onGround) { player.vy = -14; player.onGround = false; }

        // Boss AI
        let d = player.x - boss.x; 
        boss.dir = d > 0 ? 1 : -1;
        boss.vx = Math.abs(d) > (phase === 2 ? 180 : 130) ? boss.dir * (phase === 2 ? 5 : 2.5) : 0;
        
        // 攻擊頻率：二階段變快
        let atkChance = phase === 2 ? 60 : 85;
        if (frame % atkChance === 0) boss.attack();
    }

    player.update(); boss.update(); player.draw(); boss.draw();
    
    // UI
    document.getElementById('player-hp').style.width = Math.max(0, player.hp) + '%';
    document.getElementById('player-stamina').style.width = Math.max(0, player.stamina) + '%';
    document.getElementById('boss-hp').style.width = (Math.max(0, boss.hp) / 150 * 100) + '%';
    document.getElementById('boss-stamina').style.width = Math.max(0, boss.stamina) + '%';
    document.getElementById('hp-text').innerText = Math.max(0, Math.floor(player.hp));
    
    requestAnimationFrame(gameLoop);
}

window.onmousedown = (e) => {
    if (gameState !== 'playing') return;
    playMusic();
    if (e.button === 0) player.attack();
};
window.oncontextmenu = (e) => e.preventDefault();

gameLoop();