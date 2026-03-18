console.log('Hello!');
// 模擬資料庫 (Mock Data)
const db = {
  users: [
    { id: 1, name: "Yanny", age: 17, major: "電影 FDA", bio: "正在找畢業作演員，要識喊。", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" },
    { id: 2, name: "阿強", age: 18, major: "空間設計 ESS", bio: "有沒有人有多餘的亞加力膠？", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Chloe", age: 16, major: "視覺藝術 VA", bio: "我討厭油畫，但我還是在畫。", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" },
    { id: 4, name: "Kenji", age: 19, major: "多媒體 MPA", bio: "Looking for a vibe.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" }
  ],
  chats: [
    { id: 1, userId: 1, lastMsg: "你是認真的嗎？", time: "剛剛" },
    { id: 2, userId: 2, lastMsg: "可以啊，幾點見？", time: "2m" }
  ],
  messages: {
    1: [
      { type: 'in', text: 'Hi! 我看過你的短片，好勁！' },
      { type: 'out', text: '多謝！你也是讀 FDA 嗎？' },
      { type: 'in', text: '不是，我是 VA 的，但我對剪接有興趣。' }
    ]
  }
};

// 狀態管理
let state = {
  currentUser: null,
  currentChatId: null,
  cardIndex: 0
};

// 路由控制 (Router)
const router = {
  history: [],
  navigate: (pageId) => {
    // 隱藏所有頁面
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    // 顯示目標頁面
    document.getElementById(`page-${pageId}`).classList.add('active');
    router.history.push(pageId);
    
    // 特定頁面初始化
    if (pageId === 'home') app.renderCards();
    if (pageId === 'chat-list') app.renderChatList();
  },
  back: () => {
    router.history.pop(); // 移除當前頁
    const prevPage = router.history[router.history.length - 1] || 'login';
    router.navigate(prevPage);
    // 修正 history 重複 push 的問題
    router.history.pop(); 
  }
};

// 應用程式邏輯
const app = {
  register: () => {
    const name = document.getElementById('reg-name').value;
    if (!name) return alert("請輸入稱呼");
    alert(`歡迎加入創意書院交友網，${name}！\n請開始你的隨機匹配。`);
    router.navigate('home');
  },

  // 渲染卡片
  renderCards: () => {
    const container = document.getElementById('card-stack');
    container.innerHTML = ''; // 清空

    // 取得當前要顯示的卡片 (只顯示一張，簡化邏輯)
    if (state.cardIndex >= db.users.length) {
      container.innerHTML = '<div style="text-align:center; color:#666;"><h3>沒有更多人了</h3><p>去趕功課吧。</p></div>';
      return;
    }

    const user = db.users[state.cardIndex];
    const card = document.createElement('div');
    card.className = 'card';
    card.style.backgroundImage = `url('${user.img}')`;
    card.innerHTML = `
      <div class="card-gradient">
        <h2>${user.name}, ${user.age}</h2>
        <p>#${user.major}</p>
        <div class="bio">${user.bio}</div>
      </div>
    `;
    container.appendChild(card);
  },

  // 滑動/按鈕邏輯
  swipe: (direction) => {
    const card = document.querySelector('.card');
    if (!card) return;

    // 視覺動畫
    card.style.transform = `translateX(${direction === 'left' ? '-' : ''}150%) rotate(${direction === 'left' ? '-' : ''}20deg)`;
    card.style.opacity = '0';

    setTimeout(() => {
      if (direction === 'right') {
        // 模擬匹配成功
        const isMatch = Math.random() > 0.5;
        if (isMatch) alert("It's a Match! 🎉 \n你們的創意頻率接上了！");
      }
      
      state.cardIndex++;
      app.renderCards();
    }, 300);
  },

  // 隨機匹配功能
  randomMatch: () => {
    alert("系統正在為你隨機抓取一個完全不同科系的人...");
    setTimeout(() => {
      state.cardIndex = Math.floor(Math.random() * db.users.length);
      app.renderCards();
    }, 1000);
  },

  // 渲染聊天列表
  renderChatList: () => {
    const list = document.getElementById('chat-list-container');
    list.innerHTML = '';
    
    db.chats.forEach(chat => {
      const user = db.users.find(u => u.id === chat.userId);
      const el = document.createElement('div');
      el.className = 'chat-item';
      el.onclick = () => app.openChat(chat.userId);
      el.innerHTML = `
        <div class="avatar" style="background-image: url('${user.img}')"></div>
        <div class="chat-info">
          <h3>${user.name}</h3>
          <p>${chat.lastMsg} · ${chat.time}</p>
        </div>
      `;
      list.appendChild(el);
    });
  },

  // 進入聊天室
  openChat: (userId) => {
    state.currentChatId = userId;
    const user = db.users.find(u => u.id === userId);
    
    document.getElementById('chat-partner-name').innerText = user.name;
    document.getElementById('chat-partner-avatar').style.backgroundImage = `url('${user.img}')`;
    
    const msgContainer = document.getElementById('message-container');
    msgContainer.innerHTML = '';
    
    // 載入假訊息
    const msgs = db.messages[userId] || [];
    msgs.forEach(m => {
      const div = document.createElement('div');
      div.className = `msg ${m.type === 'in' ? 'msg-in' : 'msg-out'}`;
      div.innerText = m.text;
      msgContainer.appendChild(div);
    });

    router.navigate('chat-detail');
  },

  // 發送訊息
  sendMessage: () => {
    const input = document.getElementById('msg-input');
    const text = input.value;
    if (!text) return;

    const msgContainer = document.getElementById('message-container');
    const div = document.createElement('div');
    div.className = 'msg msg-out';
    div.innerText = text;
    msgContainer.appendChild(div);
    
    input.value = '';
    msgContainer.scrollTop = msgContainer.scrollHeight; // 捲動到底部

    // 模擬對方回覆
    setTimeout(() => {
      const replyDiv = document.createElement('div');
      replyDiv.className = 'msg msg-in';
      replyDiv.innerText = "好啊，聽起來不錯。";
      msgContainer.appendChild(replyDiv);
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 1500);
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 預設路由
  router.history.push('login'); 
});