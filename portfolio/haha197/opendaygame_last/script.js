const items = document.querySelectorAll('.nav-item');
const video = document.getElementById('video-stream');
const canvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');

let currentIndex = 0;
let lastMoveTime = 0;
let handsUpStartTime = null;
const COOLDOWN = 1000; // 移動冷卻 1秒
const SELECT_DURATION = 2000; // 雙手高舉 2秒進入
const SWAP_LEFT_RIGHT = true; // 若模型左右判斷反向，可設定為 true

// 更新 UI 狀態
function updateSelection() {
    items.forEach((item, index) => {
        item.classList.toggle('active', index === currentIndex);
    });
}
updateSelection();

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    let leftHandUp = false;
    let rightHandUp = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
            
            const label = results.multiHandedness[index].label; // 'Left' or 'Right'
            const effectiveLabel = SWAP_LEFT_RIGHT
                ? (label === 'Left' ? 'Right' : label === 'Right' ? 'Left' : label)
                : label;
            const yCoord = landmarks[9].y; // 使用掌心位置 (Landmark 9)

            // 判斷手是否舉起 (y 座標越小代表越高)
            if (yCoord < 0.4) {
                if (effectiveLabel === 'Left') leftHandUp = true;
                if (effectiveLabel === 'Right') rightHandUp = true;
            }
        });

        const now = Date.now();

        // 邏輯 1: 只舉起右手 -> 向右選
        if (rightHandUp && !leftHandUp && now - lastMoveTime > COOLDOWN) {
            currentIndex = (currentIndex + 1) % items.length;
            lastMoveTime = now;
            updateSelection();
        } 
        // 邏輯 2: 只舉起左手 -> 向左選
        else if (leftHandUp && !rightHandUp && now - lastMoveTime > COOLDOWN) {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            lastMoveTime = now;
            updateSelection();
        }
        // 邏輯 3: 雙手同時高舉 -> 計時進入
        else if (leftHandUp && rightHandUp) {
            if (!handsUpStartTime) handsUpStartTime = now;
            
            const progress = now - handsUpStartTime;
            ctx.fillStyle = "#00ffcc";
            ctx.fillRect(0, 0, (progress / SELECT_DURATION) * canvas.width, 10); // 顯示進度條

            if (progress > SELECT_DURATION) {
                window.location.href = items[currentIndex].href;
            }
        } else {
            handsUpStartTime = null;
        }
    }
});

// 因為影像來自 proxy.js 的 <img> 標籤，我們需要循環抓取畫格
function processVideo() {
    hands.send({image: video});
    requestAnimationFrame(processVideo);
}

video.onload = () => {
    processVideo();
};