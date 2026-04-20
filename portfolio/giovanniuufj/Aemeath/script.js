const pet = document.getElementById('pet-container');
const petImg = document.getElementById('pet-img');
const bubble = document.getElementById('dialog-bubble');

let isDragging = false;
let offsetX, offsetY;

// --- 拖拽邏輯 ---
pet.addEventListener('mousedown', (e) => {
    isDragging = true;
    // 記錄點擊位置相對於寵物左上角的偏移
    offsetX = e.clientX - pet.offsetLeft;
    offsetY = e.clientY - pet.offsetTop;
    
    // 換成「被抓起」的圖片
    // petImg.src = 'drag.png'; 
    pet.style.animation = 'none'; // 停止漂浮動畫
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        
        pet.style.left = `${x}px`;
        pet.style.top = `${y}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        // 恢復「待機」圖片
        // petImg.src = 'https://fleet-snowfluff.makuraly.xyz/GIF/nothing.gif';
        pet.style.animation = 'float 3s ease-in-out infinite';
    }
});

// --- 隨機對話邏輯 ---
const quotes = ["肚子餓了...", "漂泊者，看這邊！", "愛彌斯今天也很有精神！"];

function showBubble() {
    if (!isDragging) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        bubble.innerText = randomQuote;
        bubble.classList.remove('hidden');
        
        setTimeout(() => {
            bubble.classList.add('hidden');
        }, 3000);
    }
}

// 每 10 秒嘗試觸發一次對話
setInterval(showBubble, 10000);

// 點擊愛彌斯時觸發特殊動作
pet.addEventListener('click', () => {
  if (!isDragging) {
      // 1. 播放音效 (如果有音頻文件)
      // new Audio('abby-voice.mp3').play();

      // 2. 切換成驚訝或開心的圖片
      petImg.src = 'https://aemeath.me/GIF/happy.gif'; 
      bubble.innerText = "喔喔！是吃的嗎？";
      bubble.classList.remove('hidden');

      // 3. 3秒後恢復原狀
      setTimeout(() => {
          petImg.src = 'https://fleet-snowfluff.makuraly.xyz/GIF/nothing.gif';
          bubble.classList.add('hidden');
      }, 3000);
  }
});