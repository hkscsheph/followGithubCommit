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
