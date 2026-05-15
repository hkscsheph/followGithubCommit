const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 1. 股市數據模擬
let stocks = [
    { symbol: 'VOID', price: 245.2, change: 1.2 },
    { symbol: 'NASA_G', price: 88.4, change: -0.5 },
    { symbol: 'STAR_L', price: 1024.0, change: 5.7 },
    { symbol: 'ORBT', price: 42.1, change: 0.1 }
];

function updateMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    stocks.forEach(s => {
        // 隨機波動
        const move = (Math.random() - 0.5) * 0.5;
        s.price += move;
        s.change = move > 0 ? `+${move.toFixed(2)}` : move.toFixed(2);
        
        const div = document.createElement('div');
        div.className = `stock-item ${move >= 0 ? 'up' : 'down'}`;
        div.innerHTML = `<span>${s.symbol}</span><span>${s.price.toFixed(2)}</span><span>${s.change}%</span>`;
        list.appendChild(div);
    });
}

// 2. NASA 風格太陽系數據 (相對地球的軌道週期)
const planets = [
    { name: 'Mercury', dist: 100, size: 3, speed: 0.047, color: '#A5A5A5', angle: 0 },
    { name: 'Venus', dist: 140, size: 5, speed: 0.035, color: '#E3BB76', angle: 0 },
    { name: 'Earth', dist: 190, size: 6, speed: 0.029, color: '#2271B3', angle: 0 },
    { name: 'Mars', dist: 240, size: 4, speed: 0.024, color: '#E27B58', angle: 0 },
    { name: 'Jupiter', dist: 310, size: 12, speed: 0.013, color: '#D39C7E', angle: 0 }
];

// 3. 繪製引擎
function animate() {
    // 渲染星空背景
    ctx.fillStyle = '#000005';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // 繪製太陽 (核心)
    const sunGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 60);
    sunGlow.addColorStop(0, '#FFF5F2');
    sunGlow.addColorStop(0.2, '#FFD200');
    sunGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGlow;
    ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.fill();

    // 繪製行星軌道與行星
    planets.forEach(p => {
        // 繪製軌道線
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath(); ctx.arc(cx, cy, p.dist, 0, Math.PI*2); ctx.stroke();

        // 更新位置
        p.angle += p.speed * 0.5;
        const x = cx + Math.cos(p.angle) * p.dist;
        const y = cy + Math.sin(p.angle) * p.dist;

        // 繪製行星
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        
        // 標註名稱
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px Arial';
        ctx.fillText(p.name.toUpperCase(), x + 10, y + 5);
    });

    updateMarket();
    simulateMusic();
    requestAnimationFrame(animate);
}

// 4. 音樂視覺化模擬
function simulateMusic() {
    const visualizer = document.getElementById('visualizer');
    if (visualizer.children.length === 0) {
        for(let i=0; i<15; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            visualizer.appendChild(bar);
        }
    }
    Array.from(visualizer.children).forEach(bar => {
        bar.style.height = Math.random() * 100 + "%";
    });
}

// 5. 啟動
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('boot-overlay').classList.add('hidden');
    animate();
});

function randomizeMarket() {
    stocks.forEach(s => s.price += (Math.random() - 0.5) * 50);
}

// 更新時鐘
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toTimeString().split(' ')[0];
}, 1000);