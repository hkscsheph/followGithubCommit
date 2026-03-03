const SUPABASE_URL = 'https://yjgctujlqebbnsbkguke.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C_plJVbYzHqhFsag6HSmiA_8gaA-IFo';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const chatBox = document.getElementById('chat-box');
const usernameInput = document.getElementById('username');
const contentInput = document.getElementById('content');
const sendBtn = document.getElementById('send-btn'); // 取得按鈕

// --- 函式定義 ---

async function fetchMessages() {
    const { data, error } = await _supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
    if (!error) {
        chatBox.innerHTML = '';
        data.forEach(msg => appendMessage(msg));
        scrollToBottom();
    }
}

async function sendMessage() {
    const username = usernameInput.value.trim();
    const content = contentInput.value.trim();
    if (!username || !content) return;

    const { error } = await _supabase
        .from('messages')
        .insert([{ username: username, content: content }]);

    if (!error) contentInput.value = '';
}

function appendMessage(data) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<span class="user">${data.username}:</span> ${data.content}`;
    chatBox.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- 事件綁定 (Event Listeners) ---

// 監聽按鈕點擊
sendBtn.addEventListener('click', sendMessage);

// 監聽鍵盤 Enter 鍵
contentInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// 監聽 Supabase 即時更新
_supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        appendMessage(payload.new);
    })
    .subscribe();

// 初始化
fetchMessages();