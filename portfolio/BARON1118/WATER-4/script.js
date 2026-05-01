// --- Replace this section in your update() function ---

// Define the hitbox size of the fish
const fishWidth = 0.3;  // Adjust based on visible width
const fishLength = 1.0; // Adjust based on visible length

obstacles.forEach((rock, i) => {
  rock.position.z += currentSpeed * 2.5;

  // Calculate distances
  const dx = Math.abs(player.position.x - rock.position.x);
  const dz = Math.abs(player.position.z - rock.position.z);

  // AABB Collision: Check if the rock's center overlaps with the fish's box
  // We use (rock.hitRadius * 0.8) to allow for minor visual overlaps
  const collisionThreshold = rock.hitRadius * 0.8;
  
  if (dx < (collisionThreshold + fishWidth) && dz < (collisionThreshold + fishLength)) {
    gameOver('撞到岩石了！');
  }

  // --- End of replacement ---