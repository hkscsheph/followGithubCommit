const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let heartScale = 1;
let particles = [];
let mouse = { x: -100, y: -100 };

// 1. 初始化背景星塵
function createDust() {
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2
        });
    }
}

// 2. 核心噴發脈衝
function emitPulse() {
    heartScale = 1.8;
    document.querySelector('.left-panel').classList.add('shake');
    document.querySelector('.right-panel').classList.add('shake');
    
    // 清理畫面上靠近滑鼠的粒子並得分
    particles.forEach(p => {
        const d = Math.hypot(p.x - canvas.width/2, p.y - canvas.height/2);
        if (d < 300) {
            p.vx *= 10; p.vy *= 10; // 向外散射
            score += 1;
        }
    });
    document.getElementById('score').innerText = score;
    setTimeout(() => {
        document.querySelectorAll('.glass-panel').forEach(p => p.classList.remove('shake'));
    }, 200);
}

// 3. 繪製引擎
function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // 心跳算法：模擬雙重跳動
    const time = Date.now() * 0.005;
    const beat = Math.pow(Math.sin(time), 10) * 0.2 + 1; // 主要跳動
    const currentScale = (heartScale > 1) ? heartScale : beat;
    if (heartScale > 1) heartScale -= 0.05;

    // 繪製 NASA 風格星雲擴散
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150 * currentScale);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.2, 'rgba(0, 242, 255, 0.3)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 200 * currentScale, 0, Math.PI * 2);
    ctx.fill();

    // 繪製核心實體
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 30 * currentScale;
    ctx.shadowColor = '#00f2ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 40 * currentScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 繪製粒子
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    requestAnimationFrame(draw);
}

// 4. 啟動與交互
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('boot-overlay').classList.add('hide');
    createDust();
    draw();
});

setInterval(() => {
    document.getElementById('clock').innerText = new Date().toTimeString().split(' ')[0];
    document.getElementById('load').innerText = Math.floor(Math.random() * 20 + 5) + "%";
}, 1000);