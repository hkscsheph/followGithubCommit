const canvas = document.getElementById('bhCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bhX = canvas.width * 0.48;
let bhY = canvas.height * 0.52;
const eventHorizonRadius = 60; // 絕對黑暗核心

let accretionDisk = [];
let spaceMotes = [];
let isMousedown = false;

// 狀態控制
let globalSpeedFactor = 0.012;
// 米勒星球配置 (加入藍色海洋色調)
let planetConfig = { r: 270, angle: 3.4, speed: 0.002, size: 11 };
let gameState = 'STABLE'; 
let detonateTimer = 0;
let bhMass = 16;

function initDisk() {
    accretionDisk = [];
    for (let i = 0; i < 2600; i++) {
        let r = Math.random() * 340 + 70;
        accretionDisk.push({
            r: r,
            angle: Math.random() * Math.PI * 2,
            speed: (150 / r),
            baseSize: r < 110 ? Math.random() * 2 + 0.8 : Math.random() * 1.0 + 0.3,
            isInner: r < 110,
            vx: 0, vy: 0,
            originalR: r
        });
    }
}

// 物理多普勒光度渲染 (左亮右暗)
function getDopplerColor(p, isLens) {
    if (gameState === 'IMPLODING') return '#ffffff';
    let movementFactor = Math.sin(p.angle); // -1 到 1 
    
    if (movementFactor < -0.1) {
        let intensity = Math.min(1, 0.4 + Math.abs(movementFactor) * 0.6);
        return p.isInner ? `rgba(255, 255, 255, ${intensity * (isLens ? 0.6 : 0.95)})` : `rgba(255, 190, 80, ${intensity * (isLens ? 0.35 : 0.75)})`;
    } else {
        let intensity = Math.max(0.15, 0.4 - movementFactor * 0.3);
        return `rgba(220, 90, 20, ${intensity * (isLens ? 0.2 : 0.55)})`;
    }
}

// 核心渲染器
function drawCinematicGargantua() {
    ctx.save();
    
    // 處理引力震盪
    if (gameState === 'IMPLODING') {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    } else if (gameState === 'EXPLODING' && detonateTimer < 20) {
        ctx.translate((Math.random() - 0.5) * 25, (Math.random() - 0.5) * 25);
    }

    // 更新米勒星球位置與傾斜軌道
    planetConfig.angle += planetConfig.speed;
    let planetR = (gameState === 'IMPLODING') ? planetConfig.r * 0.5 : planetConfig.r;
    let pX = bhX + Math.cos(planetConfig.angle) * planetR;
    let pY = bhY + Math.sin(planetConfig.angle) * planetR * 0.11 + (Math.cos(planetConfig.angle) * planetR * 0.28);

    // 更新吸積盤
    accretionDisk.forEach(p => {
        if (gameState !== 'EXPLODING') {
            p.angle += p.speed * globalSpeedFactor;
            if (gameState === 'IMPLODING') p.r -= (p.r - eventHorizonRadius) * 0.06;
            else if (gameState === 'RECOVERING') p.r += (p.originalR - p.r) * 0.01;
        } else {
            p.x += p.vx; p.y += p.vy;
        }
    });

    if (gameState !== 'EXPLODING') {
        // 1. 【第一層：先畫黑洞後方的折射吸積盤】
        accretionDisk.forEach(p => {
            if (Math.sin(p.angle) < 0) {
                let origX = Math.cos(p.angle) * p.r;
                let skewY = origX * 0.28; 
                let origZ = Math.sin(p.angle) * p.r * 0.11;
                let screenX = bhX + origX;
                let screenY = bhY + origZ + skewY;

                let dist = Math.abs(origX);
                let lensOffsetY = (eventHorizonRadius * eventHorizonRadius) / (dist + 15) * 1.9;

                ctx.fillStyle = getDopplerColor(p, true);
                ctx.fillRect(screenX, screenY - lensOffsetY, p.baseSize * 2.2, p.baseSize);
                ctx.fillRect(screenX, screenY + lensOffsetY, p.baseSize * 2.2, p.baseSize);
            }
        });

        // NASA 數據：黑洞邊緣的多層引力界線環
        // 第一層：最內側光子球細環
        ctx.strokeStyle = 'rgba(255, 240, 200, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(bhX, bhY, eventHorizonRadius * 1.15, 0, Math.PI * 2); ctx.stroke();

        // 第二層：二階引力透鏡折射薄暈
        ctx.strokeStyle = 'rgba(255, 140, 30, 0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bhX, bhY, eventHorizonRadius * 1.3, 0, Math.PI * 2); ctx.stroke();

        // 第三層：最外圍不穩定軌道交界界線
        ctx.strokeStyle = 'rgba(200, 70, 10, 0.15)';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(bhX, bhY, eventHorizonRadius * 1.45, 0, Math.PI * 2); ctx.stroke();

        // 2. 【第二層：中間層 - 繪製米勒星球與黑洞核心】
        if (Math.sin(planetConfig.angle) < 0) drawCinematicPlanet(pX, pY);

        // 絕對漆黑的事件視界核心球體
        ctx.fillStyle = gameState === 'IMPLODING' ? '#ffffff' : '#000001';
        ctx.shadowBlur = gameState === 'IMPLODING' ? 80 : 35; 
        ctx.shadowColor = 'rgba(255, 120, 20, 0.8)';
        ctx.beginPath(); ctx.arc(bhX, bhY, eventHorizonRadius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        if (Math.sin(planetConfig.angle) >= 0) drawCinematicPlanet(pX, pY);

        // 3. 【第三層：最後畫黑洞前方的吸積盤粒子】
        accretionDisk.forEach(p => {
            if (Math.sin(p.angle) >= 0) {
                let origX = Math.cos(p.angle) * p.r;
                let skewY = origX * 0.28; 
                let origZ = Math.sin(p.angle) * p.r * 0.11;
                let screenX = bhX + origX;
                let screenY = bhY + origZ + skewY;

                ctx.fillStyle = getDopplerColor(p, false);
                ctx.fillRect(screenX, screenY, p.baseSize * 2.5, p.baseSize);
            }
        });

    } else {
        // 大爆炸模式
        accretionDisk.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            let alpha = Math.max(0, 1 - (detonateTimer / 90));
            ctx.fillStyle = p.isInner ? `rgba(255, 255, 255, ${alpha})` : `rgba(240, 80, 20, ${alpha})`;
            ctx.fillRect(p.x, p.y, p.baseSize * 3, p.baseSize * 3);
        });
    }

    // 爆炸狀態流轉
    if (gameState === 'IMPLODING') {
        detonateTimer++;
        if (detonateTimer > 60) {
            gameState = 'EXPLODING'; detonateTimer = 0;
            document.getElementById('status-display').innerText = "STATUS: EXPLODING";
            document.getElementById('status-display').style.color = "#ff3333";
            accretionDisk.forEach(p => {
                let blastAngle = Math.random() * Math.PI * 2;
                let blastSpeed = Math.random() * 16 + 4;
                let origX = Math.cos(p.angle) * p.r;
                p.x = bhX + origX; p.y = bhY + (origX * 0.28);
                p.vx = Math.cos(blastAngle) * blastSpeed; p.vy = Math.sin(blastAngle) * blastSpeed;
            });
        }
    } else if (gameState === 'EXPLODING') {
        detonateTimer++;
        if (detonateTimer > 90) {
            gameState = 'RECOVERING'; detonateTimer = 0;
            document.getElementById('status-display').innerText = "STATUS: RECOVERING";
            document.getElementById('status-display').style.color = "#ffaa44";
        }
    } else if (gameState === 'RECOVERING') {
        if (Math.abs(accretionDisk[1200].originalR - accretionDisk[1200].r) < 2) {
            gameState = 'STABLE';
            document.getElementById('status-display').innerText = "STATUS: STABLE";
            document.getElementById('status-display').style.color = "#ffffff";
        }
    }

    ctx.restore();
}

// 彩色水之星球加上面向黑洞的反光
function drawCinematicPlanet(x, y) {
    ctx.save();
    let gradient = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, planetConfig.size);
    gradient.addColorStop(0, '#3a7bd5'); 
    gradient.addColorStop(0.6, '#0f2027'); 
    gradient.addColorStop(1, '#050c1a'); 

    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(x, y, planetConfig.size, 0, Math.PI * 2); ctx.fill();

    let angleToCenter = Math.atan2(bhY - y, bhX - x);
    ctx.fillStyle = 'rgba(255, 150, 30, 0.45)'; 
    ctx.globalCompositeOperation = 'source-atop'; 
    ctx.beginPath();
    ctx.arc(x + Math.cos(angleToCenter) * (planetConfig.size * 0.4), y + Math.sin(angleToCenter) * (planetConfig.size * 0.4), planetConfig.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function updateSpaceMotes() {
    spaceMotes.forEach((m, idx) => {
        let dx = bhX - m.x; let dy = bhY - m.y; let dist = Math.hypot(dx, dy);
        if (dist < eventHorizonRadius + 3 || gameState === 'EXPLODING') {
            spaceMotes.splice(idx, 1); return;
        }
        let gravityForce = (eventHorizonRadius * bhMass) / (dist * dist);
        if (gameState === 'IMPLODING') gravityForce *= 3;
        m.vx += (dx / dist) * gravityForce; m.vy += (dy / dist) * gravityForce;
        m.x += m.vx; m.y += m.vy;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(m.x, m.y, 2, 2);
    });
}

function updateLog(text) {
    const log = document.querySelector('.hacker-log');
    log.innerText += `\n\n> ${text}`;
    log.scrollTop = log.scrollHeight;
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 1, 0.28)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCinematicGargantua();
    updateSpaceMotes();
    requestAnimationFrame(animate);
}

document.getElementById('btn-detonate').addEventListener('click', () => {
    if (gameState === 'STABLE') {
        gameState = 'IMPLODING'; detonateTimer = 0;
        document.getElementById('status-display').innerText = "STATUS: IMPLODING";
        updateLog("【引力臨界點】過載引爆指令下達，核心開始向內坍塌！");
    }
});

document.getElementById('planet-radius').addEventListener('input', (e) => planetConfig.r = parseInt(e.target.value));
document.getElementById('disk-speed').addEventListener('input', (e) => globalSpeedFactor = parseInt(e.target.value) * 0.001);

window.addEventListener('mousedown', () => isMousedown = true);
window.addEventListener('mouseup', () => isMousedown = false);
window.addEventListener('mousemove', (e) => {
    if (isMousedown && Math.random() > 0.4 && gameState !== 'EXPLODING') {
        spaceMotes.push({ x: e.clientX, y: e.clientY, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3 });
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('boot-overlay').classList.add('hide');
    initDisk();
    animate();
});