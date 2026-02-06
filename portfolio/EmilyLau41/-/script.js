const grid = document.getElementById('calendarGrid');
const monthDisplay = document.getElementById('monthDisplay');

// 初始化日期
let currentDate = new Date();

function renderCalendar() {
    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthDisplay.innerText = `${year}年 ${month + 1}月`;

    // 獲取該月第一天與天數
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 填充空白日期
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    // 生成日期格子
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.innerText = day;
        
        // 點擊事件
        cell.onclick = () => openGraffitiBoard(year, month + 1, day);
        
        grid.appendChild(cell);
    }
}

function openGraffitiBoard(y, m, d) {
    const modal = document.getElementById('graffitiModal');
    document.getElementById('modalDate').innerText = `${y}年${m}月${d}日的作品`;
    modal.style.display = 'block';
    
    // 這裡之後可以串接資料庫讀取該日期的圖片與留言
    loadContent(y, m, d);
}
// 1. 初始化當前日期
let currentViewDate = new Date(); 

function renderCalendar() {

    const grid = document.getElementById('calendarGrid');
    const display = document.getElementById('monthDisplay');
    
    if (!grid || !display) return; // 安全檢查

    grid.innerHTML = '';
    
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    // 顯示標題
    display.innerText = `${year}年 ${month + 1}月`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();


    // 填充月初空白
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day-empty';
        grid.appendChild(emptyDiv);
    }

    // 生成日期
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        // 檢查是否為今天
        if (day === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear()) {
            cell.classList.add('today');
        }

        cell.innerHTML = `<span class="day-number">${day}</span>`;
        cell.onclick = () => alert(`你點擊了 ${year}/${month+1}/${day}`);
        
        grid.appendChild(cell);
    }
}

// 2. 修正月份切換函數
window.changeMonth = function(offset) {
    // 取得當前顯示月份的第一天，避免月底日期溢位（例如從 1/31 跳到 2/31 會出錯）
    currentViewDate.setDate(1); 
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    renderCalendar();
};

// 3. 頁面載入後立即執行一次
document.addEventListener('DOMContentLoaded', renderCalendar);
renderCalendar();

// 處理圖片預覽
window.previewImage = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
      const display = document.getElementById('photoDisplay');
      display.innerHTML = `<img src="${reader.result}" id="tempImage" style="width:100%; border-radius:8px; opacity:0.7;">`;
  };
  reader.readAsDataURL(file);
};

// 儲存圖片
window.saveGraffiti = function() {
  const tempImg = document.getElementById('tempImage');
  if (!tempImg) {
      alert("請先選擇一張照片喔！");
      return;
  }
  
  // 儲存到 LocalStorage
  localStorage.setItem(selectedDateKey, tempImg.src);
  
  alert("塗鴉照片已成功儲存！");
  renderCalendar(); // 刷新日曆
};
// 關閉視窗的函數
window.closeModal = function() {
    const modal = document.getElementById('graffitiModal');
    if (modal) {
        modal.style.display = 'none';
        
        // 清除檔案選取器的暫存，避免下次打開時還留著舊檔案名稱
        document.getElementById('fileInput').value = "";
    }
};

// 加強功能：點擊視窗背景（黑影處）也能關閉
window.onclick = function(event) {
    const modal = document.getElementById('graffitiModal');
    if (event.target == modal) {
        closeModal();
    }
};

// 加強功能：按下 Esc 鍵也能關閉
document.onkeydown = function(evt) {
    if (evt.key === "Escape") {
        closeModal();
    }
};
let currentUserId = "me"; // 預設是看自己的作品
let friends = [];

// 新增好友
window.addFriend = function() {
    const id = document.getElementById('friendIdInput').value;
    if (id && !friends.includes(id)) {
        friends.push(id);
        updateFriendsList();
        document.getElementById('friendIdInput').value = "";
    }
};

// 更新好友列表 UI
function updateFriendsList() {
    const list = document.getElementById('friendsList');
    list.innerHTML = `<li onclick="viewCalendar('me')" class="${currentUserId==='me'?'active':''}">我的日曆</li>`;
    
    friends.forEach(f => {
        list.innerHTML += `<li onclick="viewCalendar('${f}')" class="${currentUserId===f?'active':''}">👤 ${f}</li>`;
    });
}

// 切換日曆視角
window.viewCalendar = function(userId) {
    currentUserId = userId;
    updateFriendsList();
    renderCalendar(); // 重新渲染日曆，載入不同人的資料
};

// 修改後的資料讀取邏輯
function loadSavedData(key) {
    // 實際開發時，這裡會變成從伺服器抓取 userId 的資料
    // 目前我們先用 LocalStorage 模擬：key = "me-2026-1-27" 或 "friend-2026-1-27"
    const storageKey = `${currentUserId}-${key}`;
    const saved = localStorage.getItem(storageKey);
    
    const display = document.getElementById('photoDisplay');
    const uploadBtn = document.querySelector('.upload-section');

    if (saved) {
        display.innerHTML = `<img src="${saved}" style="width:100%;">`;
    } else {
        display.innerHTML = '<p>尚無作品</p>';
    }

    // 如果是在看別人的日曆，隱藏「上傳按鈕」，因為你不能幫別人傳照片
    uploadBtn.style.display = (currentUserId === "me") ? "block" : "none";
}