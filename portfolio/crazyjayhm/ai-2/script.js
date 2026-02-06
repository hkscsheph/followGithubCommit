
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const GEMINI_KEY = 'YOUR_GEMINI_KEY';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const messagesEl = document.getElementById('messages');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

let mockUser = { id: 'demo', email: 'user@example.com' };


function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
}


function addMessage(role, content, type = 'text', time = new Date()) {
    const div = document.createElement('div');
    div.className = message ${role};
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (type === 'image') {
        const img = document.createElement('img');
        img.src = content;
        img.className = 'message-image';
        img.alt = 'AI圖片';
        bubble.appendChild(img);
    } else {
        bubble.textContent = content;
    }
    
    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = time.toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
    
    bubble.appendChild(timeEl);
    div.appendChild(bubble);
    messagesEl.appendChild(div);
    scrollToBottom();
}


async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    
    sendBtn.disabled = true;
    input.value = '';
    
  
    addMessage('user', text);
    
 
    setTimeout(() => {
        if (text.toLowerCase().startsWith('/img')) {
            const imgUrl = https://picsum.photos/300/200?random=${Math.random()};
            addMessage('bot', imgUrl, 'image');
        } else {
            addMessage('bot', 收到：${text}。我係AI助手，可以幫你生成圖片（用 /img 提示）！);
        }
        sendBtn.disabled = false;
        input.focus();
    }, 1000);
}

// Events
sendBtn.onclick = sendMessage;
input.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};
input.oninput = function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
};

// Init
input.focus();
addMessage('bot', '你好！我是AI助手，打字聊天或用 /img 生成圖片！', 'text', new Date(Date.now() - 60000));