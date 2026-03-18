// --- Add to your global variables ---
let bubbleParticles;
const BUBBLE_COUNT = 200;

// --- Add this function to create the system ---
function createBubbles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(BUBBLE_COUNT * 3);
    const velocities = new Float32Array(BUBBLE_COUNT);

    for (let i = 0; i < BUBBLE_COUNT; i++) {
        // Random spread: X (-15 to 15), Y (-5 to 5), Z (-50 to 10)
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = Math.random() * -60;
        velocities[i] = Math.random() * 0.2 + 0.1;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });

    bubbleParticles = new THREE.Points(geo, mat);
    bubbleParticles.userData.velocities = velocities;
    scene.add(bubbleParticles);
}

// --- Add this logic inside your update() function ---
function updateBubbles() {
    const positions = bubbleParticles.geometry.attributes.position.array;
    const vels = bubbleParticles.userData.velocities;

    for (let i = 0; i < BUBBLE_COUNT; i++) {
        // Move bubbles toward camera based on current game speed
        positions[i * 3 + 2] += currentSpeed * 0.8 + vels[i];
        
        // Slight upward float
        positions[i * 3 + 1] += 0.02;

        // Reset bubble if it goes behind camera
        if (positions[i * 3 + 2] > 10) {
            positions[i * 3 + 2] = -50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        }
    }
    bubbleParticles.geometry.attributes.position.needsUpdate = true;
}

// ... [Keep previous init, createPlayer, and createShark functions] ...

function update() {
  if (!gameActive) return;
  const time = clock.getElapsedTime();

  // 1. Input with tilt realism
  if (keys['ArrowLeft'] && player.position.x > -8) {
      player.position.x -= 0.2;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, 0.4, 0.1);
  } else if (keys['ArrowRight'] && player.position.x < 8) {
      player.position.x += 0.2;
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -0.4, 0.1);
  } else {
      player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, 0, 0.1);
  }

  // 2. Realistic Swimming Animation
  player.rotation.y = Math.sin(time * 10) * 0.15;
  player.tail.rotation.z = Math.sin(time * 10) * 0.8;

  // 3. Game Progression
  distance += currentSpeed * 0.2;
  document.getElementById('dist').innerText = Math.floor(distance);

  if (distance < 150) {
      currentSpeed = SPEEDS.RIVER;
      scene.background.set(0x001e0f);
  } else if (distance < 300) {
      currentSpeed = SPEEDS.RAPIDS;
      document.getElementById('stageInfo').innerText = "STAGE: RAPIDS (Fast)";
      scene.background.set(0x002b36);
  } else {
      currentSpeed = SPEEDS.OCEAN;
      document.getElementById('stageInfo').innerText = "STAGE: THE SEA (Extreme)";
      document.getElementById('sharkWarning').style.display = 'block';
      scene.background.set(0x000d1a);

      shark.position.z = THREE.MathUtils.lerp(shark.position.z, 4, 0.01);
      shark.position.x = THREE.MathUtils.lerp(shark.position.x, player.position.x, 0.03);
      shark.rotation.y = Math.sin(time * 8) * 0.1;
      
      if (shark.position.distanceTo(player.position) < 2) gameOver();
  }

  // --- REDUCED OBSTACLE LOGIC ---
  // Changed from 0.1 (10%) to 0.03 (3%) for fewer stones
  if (Math.random() < 0.03) spawnRock(); 

  obstacles.forEach((rock, i) => {
      rock.position.z += currentSpeed;
      
      // Collision check remains the same
      if (rock.position.distanceTo(player.position) < 1.2) gameOver();
      
      // Cleanup
      if (rock.position.z > 20) {
          scene.remove(rock);
          obstacles.splice(i, 1);
      }
  });
}
// ... [Keep remaining functions] ...