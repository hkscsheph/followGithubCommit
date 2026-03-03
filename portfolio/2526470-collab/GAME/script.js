const particles = [];

function createExplosion(x, y, color) {
    for(let i=0; i<8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 30,
            color: color
        });
    }
}

// 在 update 函式中循環更新並繪製 particles，生命值歸零則移除