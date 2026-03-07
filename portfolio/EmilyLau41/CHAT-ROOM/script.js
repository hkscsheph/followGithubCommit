document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://dhypkutxhcfjpzmlufxr.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_1k3-mNqoqErdRgxC0P11zA_fXVopcwJ';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // 獲取所有按鈕與輸入框
    const magicBtn = document.getElementById('magic-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const authMsg = document.getElementById('auth-msg');

    // --- 功能 A: 魔術連結 (Magic Link) ---
    magicBtn.onclick = async () => {
        const email = emailInput.value.trim();
        if (!email) return alert("請輸入 Email");
        
        authMsg.innerText = "傳送連結中...";
        const { error } = await _supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.href }
        });
        
        if (error) authMsg.innerText = "❌ 錯誤: " + error.message;
        else authMsg.innerText = "✅ 連結已寄出！請查看信箱。";
    };

    // --- 功能 B: 密碼登入 ---
    loginBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) return alert("請輸入帳號與密碼");

        authMsg.innerText = "正在登入...";
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        
        if (error) authMsg.innerText = "❌ 登入失敗: " + error.message;
    };

    // --- 功能 C: 帳號註冊 ---
    signupBtn.onclick = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (password.length < 6) return alert("密碼至少需要 6 位數");

        authMsg.innerText = "正在註冊...";
        const { error } = await _supabase.auth.signUp({ email, password });
        
        if (error) authMsg.innerText = "❌ 註冊失敗: " + error.message;
        else authMsg.innerText = "✅ 註冊成功！若有開啟驗證請先收信。";
    };

    // ... 其餘的狀態監聽 (onAuthStateChange) 與聊天邏輯保持不變 ...
});
const emailInput = document.getElementById('email-input');
const loginBtn = document.getElementById('login-btn');
const authMsg = document.getElementById('auth-msg');
const authContainer = document.getElementById('auth-container');
const mainChat = document.getElementById('main-chat');

// 1. 發送魔術連結
loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('請輸入電子郵件');

    loginBtn.disabled = true;
    authMsg.innerText = '正在發送郵件...';

    const { error } = await _supabase.auth.signInWithOtp({
        email: email,
        options: {
            // 這裡可以指定跳轉回來的網址
            emailRedirectTo: window.location.href, 
        }
    });

    if (error) {
        alert('發生錯誤：' + error.message);
        loginBtn.disabled = false;
    } else {
        authMsg.innerText = '驗證信已寄出！請檢查您的收件匣。';
    }
};

// 2. 監聽身份狀態變更 (Auth State)
_supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        // 登入成功
        authContainer.style.display = 'none';
        mainChat.style.display = 'flex';
        
        // 自動將 username 欄位填入 Email 前綴或 Email
        userInput.value = session.user.email.split('@')[0];
        
        // 載入歷史訊息
        init(); 
    } else if (event === 'SIGNED_OUT') {
        // 登出後切換介面
        authContainer.style.display = 'block';
        mainChat.style.display = 'none';
    }
});
;// ❌ 錯誤示範：這會導致全網頁無法輸入
window.onkeydown = (e) => {
  e.preventDefault(); 
};

// ✅ 正確示範：只針對 Enter 鍵處理，且不阻斷輸入文字
msgInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
      handleSend();
  }
  // 不要在這裡寫 e.preventDefault()，除非你非常確定要擋掉某個鍵
};
