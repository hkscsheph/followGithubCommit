// ==========================================
// 1. THREE.JS SETUP (The 3D Cube)
// ==========================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Create a colorful cube
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial(); 
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

threeCamera.position.z = 5;

// Animation Loop for Three.js
function animate() {
    requestAnimationFrame(animate);
    // Add a slow idle rotation if no hand is detected
    if(!window.handDetected) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    renderer.render(scene, threeCamera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 2. MEDIAPIPE SETUP (The Hand Tracking)
// ==========================================
const videoElement = document.querySelector('.input_video');
const statusText = document.getElementById('status');
window.handDetected = false;

// Initialize MediaPipe Hands
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1, // Track one hand for simplicity
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

// What to do when a hand is found
hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        window.handDetected = true;
        statusText.innerText = "Hand Detected! Move your index finger.";
        
        // Get the first hand detected
        const landmarks = results.multiHandLandmarks[0];
        
        // Get the tip of the index finger (Landmark #8)
        const indexFingerTip = landmarks[8]; 
        
        // Note: We invert the X axis because the webcam is mirrored
        const targetRotationY = -(indexFingerTip.x - 0.5) * Math.PI * 2; 
        const targetRotationX = (indexFingerTip.y - 0.5) * Math.PI * 2;

        // Smoothly interpolate the cube's rotation toward the finger's position
        cube.rotation.y += (targetRotationY - cube.rotation.y) * 0.1;
        cube.rotation.x += (targetRotationX - cube.rotation.x) * 0.1;

    } else {
        window.handDetected = false;
        statusText.innerText = "Show your hand to the camera...";
    }
});

// Initialize WebCam and feed it to MediaPipe
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480
});

// Start the camera
camera.start()
    .then(() => { statusText.innerText = "Show your hand to the camera..."; })
    .catch((err) => { 
        statusText.innerText = "Error accessing webcam. Please grant permissions."; 
        console.error(err); 
    });