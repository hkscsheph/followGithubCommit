let lastTime = 0;
function animate(currentTime) {
    // 計算兩幀之間的時間差
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // 只有在遊戲進行中才計算
    if (gameState === 'PLAYING') {
        // 傳入 deltaTime 讓物理運動變平滑
        update(deltaTime); 
        draw();
    }
    
    requestAnimationFrame(animate);
}