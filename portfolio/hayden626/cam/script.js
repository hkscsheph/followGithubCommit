const videoElement = document.getElementById('webcam');
const container = document.getElementById('canvas-container');

// --- 1. 初始化 Three.js 場景 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// 創建一個有色彩漸變的方塊
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// --- 2. 初始化 MediaPipe Hands ---
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// 當偵測到手部動作時執行的回調函數
hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 使用手掌中心點 (Landmark 9) 來控制旋轉
        const handX = landmarks[9].x;
        const handY = landmarks[9].y;

        // 將手部坐標 (0~1) 映射到旋轉角度
        cube.rotation.y = (handX - 0.5) * 8;
        cube.rotation.x = (handY - 0.5) * 8;

        // 偵測「捏合」動作 (大拇指尖 4 與 食指尖 8 的距離)
        const thumb = landmarks[4];
        const index = landmarks[8];
        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) + 
            Math.pow(thumb.y - index.y, 2)
        );

        // 如果手指捏合，縮小方塊；放開則還原
        const scale = distance < 0.05 ? 0.5 : 1.0;
        cube.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.2);
    }
});

// --- 3. 啟動攝像頭 ---
const cameraFeed = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
cameraFeed.start();

// --- 4. 渲染循環 ---
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// 監聽視窗大小變化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});