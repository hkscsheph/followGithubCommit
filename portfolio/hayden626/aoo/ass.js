// 替換為你的 Supabase 憑證
const SUPABASE_URL = '你的_SUPABASE_URL';
const SUPABASE_ANON_KEY = '你的_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const contentInput = document.getElementById('content');
const sendBtn = document.getElementById('send-btn');

// 渲染訊息
function appendMessage(msg) {
    const isMe = usernameInput.value === msg.username;
    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'sent' : 'received'}`;
    
    div.innerHTML = `
        <div class="msg-info">${msg.username} • ${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        <div class="msg-text">${msg.content}</div>
    `;
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 獲取歷史紀錄
async function loadHistory() {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) console.error('讀取失敗:', error);
    else data.forEach(appendMessage);
}

// 發送訊息到 Supabase
async function handleSend() {
    const user = usernameInput.value.trim();
    const text = contentInput.value.trim();

    if (!text) return;

    // 禁用按鈕防止重複點擊
    sendBtn.disabled = true;

    const { error } = await supabaseClient
        .from('messages')
        .insert([{ username: user, content: text }]);

    if (error) {
        alert('發送失敗，請檢查 Supabase RLS 設定');
        console.error(error);
    } else {
        contentInput.value = ''; // 清空輸入
    }
    sendBtn.disabled = false;
}

// 訂閱即時廣播 (這才是真的 send 完立刻收到的關鍵)
function initRealtime() {
    supabaseClient
        .channel('any') // 頻道名稱隨意
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
            appendMessage(payload.new);
        })
        .subscribe();
}

// 綁定事件
sendBtn.onclick = handleSend;
contentInput.onkeydown = (e) => { if(e.key === 'Enter') handleSend(); };

// 啟動
loadHistory();
initRealtime();
