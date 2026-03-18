let crystals = 0;
let cps = 0;

const upgrades = {
    miner: { cost: 15, power: 1, count: 0 },
    drill: { cost: 100, power: 5, count: 0 },
    station: { cost: 500, power: 25, count: 0 }
};

const crystalEl = document.getElementById('main-crystal');
const crystalCountEl = document.getElementById('crystal-count');
const cpsCountEl = document.getElementById('cps-count');

// 手動點擊
crystalEl.addEventListener('click', () => {
    crystals += 1;
    updateUI();
    createParticle();
});

// 購買升級
function buyUpgrade(type) {
    const item = upgrades[type];
    if (crystals >= item.cost) {
        crystals -= item.cost;
        item.count++;
        item.cost = Math.floor(item.cost * 1.15); // 價格倍率增加
        cps += item.power;
        
        document.getElementById(`${type}-cost`).innerText = item.cost;
        updateUI();
    }
}

function updateUI() {
    crystalCountEl.innerText = Math.floor(crystals);
    cpsCountEl.innerText = cps.toFixed(1);
}

// 每秒自動產出循環 (100ms 執行一次讓數值變動更平滑)
setInterval(() => {
    crystals += cps / 10;
    updateUI();
}, 100);

// 簡單的點擊特效
function createParticle() {
    const p = document.createElement('div');
    p.innerText = '+1';
    p.style.position = 'absolute';
    p.style.left = '50%';
    p.style.top = '50%';
    p.style.color = '#00d4ff';
    p.style.fontWeight = 'bold';
    p.style.pointerEvents = 'none';
    p.style.animation = 'floatUp 1s forwards';
    document.querySelector('.crystal-wrapper').appendChild(p);
    setTimeout(() => p.remove(), 1000);
}