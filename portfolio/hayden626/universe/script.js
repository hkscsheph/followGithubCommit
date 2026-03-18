const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
const sprite = document.getElementById('observer');
const bubble = document.getElementById('bubble');
const nameLabel = document.getElementById('nameLabel');

let particles = [], stars = [], planets = [];
let mouse = { x: window.innerWidth/2, y: window.innerHeight/2, down: false };
let pos = { x: mouse.x, y: mouse.y };
let sceneIdx = 0;
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

const themes = [
    { 
        color: '120, 100%, 75%', 
        quotes: ["星光雖然遠，但總有一束係為你而亮。", "攰就休息下，宇宙等緊你叉好電。", "你唔使每一秒都發光，平凡已經好靚。"] 
    },
    { 
        color: '15, 100%, 65%', 
        quotes: ["每一次嘅破碎，都係超新星爆發前嘅重組。", "黑暗只係為咗令你呢粒星鑽更顯眼。", "你有重塑未來嘅力量，加油！"] 
    },
    { 
        color: '200, 100%, 70%', 
        quotes: ["流淚唔係軟弱，係靈魂喺度排毒。", "迷失其實係喺度探索新嘅星系。", "世界好嘈，但你可以喺自己軌道安靜運行。"] 
    }
];

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = []; stars = []; planets = [];
    
    for(let i=0; i<3000; i++) {
        particles.push({ 
            x: Math.random()*canvas.width, y: Math.random()*canvas.height, 
            vx: (Math.random()-0.5), vy: (Math.random()-0.5), size: Math.random()*1.2 
        });
    }

    const solar = document.getElementById('solar-system');
    solar.innerHTML = '';
    const config = [
        { type: 'type-forest', d: 220, s: 50, sp: 0.01, name: '🌲 森林之源' },
        { type: 'type-ocean',  d: 380, s: 75, sp: 0.007, name: '🌊 蔚藍深海' },
        { type: 'type-lava',   d: 550, s: 65, sp: 0.004, name: '🔥 熾熱熔岩' }
    ];

    config.forEach(c => {
        const p = document.createElement('div');
        p.className = `orbit-planet ${c.type}`;
        p.style.width = p.style.height = c.s + 'px';
        const tag = document.createElement('div');
        tag.className = 'planet-tag'; tag.innerText = c.name;
        p.appendChild(tag);
        solar.appendChild(p);
        planets.push({ el: p, dist: c.d, speed: c.sp, angle: Math.random()*Math.PI*2 });
    });
}

function say(txt) {
    bubble.innerText = txt; bubble.style.opacity = 1;
    clearTimeout(window.bt); window.bt = setTimeout(()=> bubble.style.opacity = 0, 5000);
}

function switchScene(idx) {
    sceneIdx = idx;
    sprite.style.setProperty('--glow', `hsl(${themes[idx].color.split(',')[0]}, 100%, 70%)`);
    say(themes[idx].quotes[Math.floor(Math.random()*themes[idx].quotes.length)]);
}

window.onmousemove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
window.onmousedown = () => mouse.down = true;
window.onmouseup = () => {
    mouse.down = false;
    particles.forEach(p => {
        let dx = p.x - pos.x, dy = p.y - pos.y;
        let d = Math.sqrt(dx*dx + dy*dy);
        if(d < 300) { p.vx += dx/d * 25; p.vy += dy/d * 25; }
    });
};

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `hsl(${themes[sceneIdx].color})`;
    particles.forEach(p => {
        if(mouse.down) {
            let dx = pos.x - p.x, dy = pos.y - p.y;
            let d = Math.sqrt(dx*dx + dy*dy);
            p.vx += dx/d * 0.8; p.vy += dy/d * 0.8;
            p.vx *= 0.92; p.vy *= 0.92;
        } else {
            p.vx *= 0.99; p.vy *= 0.99;
        }
        p.x += p.vx; p.y += p.vy;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    planets.forEach(p => {
        p.angle += p.speed;
        p.el.style.left = centerX + Math.cos(p.angle) * p.dist + 'px';
        p.el.style.top = centerY + Math.sin(p.angle) * p.dist * 0.6 + 'px';
    });

    pos.x += (mouse.x - pos.x) * 0.1;
    pos.y += (mouse.y - pos.y) * 0.1;
    sprite.style.left = pos.x + 'px'; sprite.style.top = pos.y + 'px';
    sprite.style.transform = `translate(-50%, -50%) rotateX(${(mouse.y - pos.y)*0.12}deg) rotateY(${(mouse.x - pos.x)*-0.12}deg)`;

    requestAnimationFrame(animate);
}

document.getElementById('nameInput').onkeydown = (e) => {
    if(e.key==='Enter') { nameLabel.innerText = e.target.value; e.target.blur(); say("你好，" + nameLabel.innerText + "。我會陪住你。"); }
};

init(); animate(); switchScene(0);
window.onresize = init;
// 每 20 秒自動講一句安慰話
setInterval(() => { if(bubble.style.opacity == 0) say(themes[sceneIdx].quotes[Math.floor(Math.random()*3)]); }, 20000);