const SB_URL = 'https://wmpehsgqpjurzqphzetn.supabase.co';
const SB_KEY = 'sb_publishable_cIOKp3SdJrc7D76CrWK-PA_A3JvShVD';
const supabaseClient = supabase.createClient(SB_URL, SB_KEY);

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('username');
const contentInput = document.getElementById('content');
const sendBtn = document.getElementById('btn-send');
const uploadBtn = document.getElementById('btn-upload');
const fileInput = document.getElementById('file-input');

function render(msg) {
    const isMe = userInput.value === msg.username;
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    
    const isImg = msg.content.startsWith('data:image') || msg.content.match(/\.(jpeg|jpg|gif|png|webp)$/i);
    const body = isImg 
        ? `<img src="${msg.content}" class="msg-img">` 
        : `<span>${msg.content}</span>`;

    div.innerHTML = body;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function send(payload) {
    const text = payload || contentInput.value.trim();
    if (!text) return;
    await supabaseClient.from('messages').insert([{ username: userInput.value, content: text }]);
    contentInput.value = '';
}

uploadBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => send(ev.target.result);
        reader.readAsDataURL(file);
    }
};

supabaseClient.channel('room').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, p => render(p.new)).subscribe();

sendBtn.onclick = () => send();
contentInput.onkeyup = (e) => e.key === 'Enter' && send();

(async () => {
    const { data } = await supabaseClient.from('messages').select('*').order('created_at').limit(50);
    if(data) data.forEach(render);
})();