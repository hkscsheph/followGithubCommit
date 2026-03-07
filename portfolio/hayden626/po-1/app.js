const SB_URL = 'https://wmpehsgqpjurzqphzetn.supabase.co'; 
const SB_KEY = 'sb_publishable_cIOKp3SdJrc7D76CrWK-PA_A3JvShVD'; 

const supabaseClient = supabase.createClient(SB_URL, SB_KEY, {
    realtime: { params: { eventsPerSecond: 10 } }
});

document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const contentInput = document.getElementById('content');
    const glitchOverlay = document.getElementById('glitch-overlay');
    const bgm = document.getElementById('bgm');
    const statusDiv = document.getElementById('auth-status');

    const getAvatar = (seed) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    let currentUser = null;

    // --- 登入邏輯 ---
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) statusDiv.innerText = "❌ " + error.message;
    };

    // --- 註冊邏輯 ---
    document.getElementById('btn-signup').onclick = async () => {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const { data, error } = await supabaseClient.auth.signUp({ email, password });
        if (error) statusDiv.innerText = "❌ " + error.message;
        else statusDiv.innerText = "✅ 註冊成功！請檢查郵箱驗證（如已關閉驗證可直接登入）";
    };

    // 監聽登入狀態切換 UI
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            currentUser = session.user;
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';
            document.getElementById('user-display').innerText = currentUser.email.split('@')[0].toUpperCase();
            document.getElementById('user-avatar').innerHTML = `<img src="${getAvatar(currentUser.email)}">`;
            loadHistory();
            
            // 訂閱實時訊息
            supabaseClient.channel('messages').on('postgres_changes', { 
                event: 'INSERT', schema: 'public', table: 'messages' 
            }, p => render(p.new)).subscribe();
        } else {
            document.getElementById('login-screen').style.display = 'flex';
            document.getElementById('chat-container').style.display = 'none';
        }
    });

    // --- 特效與訊息功能 ---
    function triggerGlitch() {
        if (glitchOverlay) {
            glitchOverlay.classList.add('glitch-active');
            document.getElementById('snd-glitch').play().catch(()=>{});
            setTimeout(() => glitchOverlay.classList.remove('glitch-active'), 400);
        }
    }

    async function send(payload) {
        let text = payload || contentInput.value.trim();
        if (!text || !currentUser) return;
        
        if (text === '/glitch') { triggerGlitch(); contentInput.value = ''; return; }
        
        let isDestruct = false;
        if (text.startsWith('/boom ')) { 
            text = text.replace('/boom ', '[🔥] '); 
            isDestruct = true; 
        }

        document.getElementById('snd-send').play().catch(()=>{});
        await supabaseClient.from('messages').insert([{ 
            username: currentUser.email, content: text, metadata: { destruct: isDestruct } 
        }]);
        contentInput.value = '';
    }

    function render(msg) {
        const isMe = currentUser && currentUser.email === msg.username;
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${isMe ? 'me' : ''}`;
        const isDestruct = msg.metadata?.destruct;
        const contentHtml = msg.content.startsWith('data:image') 
            ? `<img src="${msg.content}" style="max-width:100%; border-radius:10px;">` 
            : `<span>${msg.content}</span>`;

        wrapper.innerHTML = `
            <div class="avatar-sm"><img src="${getAvatar(msg.username)}"></div>
            <div class="message ${isMe ? 'sent' : 'received'} ${isDestruct ? 'destruct' : ''}">${contentHtml}</div>
        `;
        chatBox.appendChild(wrapper);
        chatBox.scrollTop = chatBox.scrollHeight;
        if (!isMe) triggerGlitch();
    }

    // --- 事件綁定 ---
    document.getElementById('btn-send').onclick = () => send();
    contentInput.onkeyup = (e) => e.key === 'Enter' && send();
    document.getElementById('btn-logout').onclick = () => supabaseClient.auth.signOut();
    document.getElementById('btn-bgm').onclick = () => bgm.paused ? bgm.play() : bgm.pause();
    document.getElementById('btn-upload').onclick = () => document.getElementById('file-input').click();
    
    document.getElementById('file-input').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => send(ev.target.result);
        reader.readAsDataURL(e.target.files[0]);
    };

    async function loadHistory() {
        chatBox.innerHTML = '';
        const { data } = await supabaseClient.from('messages').select('*').order('created_at').limit(50);
        if(data) data.forEach(render);
    }
});