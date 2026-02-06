const SUPABASE_URL = 'https://lzywwvjhhwlgrwfzosys.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8913JaWJFqSi95Y67Dnydg_NZqdHnbX';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const usernameInput = document.getElementById('username');
const sendBtn = document.getElementById('send-btn');

// 1. 初始化：抓取舊有的訊息
async function fetchMessages() {
  const { data, error } = await supabaseClient
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) console.error('Error fetching:', error);
  else data.forEach(appendMessage);
}

// 2. 將訊息渲染到畫面上
function appendMessage(msg) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<span class="username">${msg.username}:</span> ${msg.content}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight; // 自動捲動到底部
}

// 3. 發送訊息到 Supabase
async function sendMessage() {
  const content = messageInput.value;
  const username = usernameInput.value || '匿名';

  if (!content) return;

  const { error } = await supabaseClient
    .from('messages')
    .insert([{ content, username }]);

  if (error) console.error('Error sending:', error);
  messageInput.value = ''; // 清空輸入框
}

// 4. 監聽即時更新 (Realtime)
const channel = supabaseClient
  .channel('schema-db-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      appendMessage(payload.new);
    }
  )
  .subscribe();

// 綁定按鈕與 Enter 鍵
sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => {
  if (e.key === 'Enter') sendMessage();
};

// 執行初始化
fetchMessages();
