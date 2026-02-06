const { createClient } = window.supabase;

const SUPABASE_URL = 'https://gugpxbezjshdwqcmncsa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dgbc23XbCPVqD-NiKcXGNA_Kpg4YfGv';

// 這裡改名，避免 Identifier 'supabase' has already been declared 錯誤
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 渲染訊息函數
function appendMessage(msg) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const div = document.createElement('div');
    div.className = 'msg';
    div.style.padding = '8px';
    div.style.borderBottom = '1px solid #eee';
    
    let imageHtml = msg.image_url ? `<br><img src="${msg.image_url}" style="max-width:200px; border-radius:4px;">` : '';
    
    div.innerHTML = `<strong>${msg.username || '無名氏'}:</strong> ${msg.content || ''} ${imageHtml}`;
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 3. 讀取歷史紀錄
async function loadHistory() {
    const { data, error } = await supabaseClient
        .from('message')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) console.error('讀取失敗:', error);
    else if (data) data.forEach(appendMessage);
}

// 4. 發送訊息 (強制掛載到 window 以解決 ReferenceError)
window.sendMessage = async function() {
    const msgInput = document.getElementById('messageInput');
    const imgInput = document.getElementById('imageInput');
    const userInput = document.getElementById('username');
    
    const content = msgInput.value;
    const username = userInput.value || '訪客';
    const file = imgInput.files[0];

    if (!content && !file) return;

    try {
        let imageUrl = null;

        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data, error: uploadError } = await supabaseClient.storage
                .from('chat_images')
                .upload(fileName, file);
            
            if (uploadError) throw uploadError;

            const { data: urlData } = supabaseClient.storage
                .from('chat_images')
                .getPublicUrl(fileName);
            imageUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabaseClient
            .from('message')
            .insert([{ content, username, image_url: imageUrl }]);

        if (insertError) throw insertError;

        msgInput.value = '';
        imgInput.value = '';
    } catch (err) {
        console.error('發送失敗:', err);
        alert('發送失敗，請查看 Console');
    }
};

// 5. 實時監聽
supabaseClient
    .channel('chat-room')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message' }, payload => {
        appendMessage(payload.new);
    })
    .subscribe();

// 啟動
loadHistory();

async function testConnection() {
  try {
      const { data, error } = await supabaseClient.from('message').select('count');
      if (error) {
          console.error("連線測試失敗，請檢查資料表名稱是否為 'message' 或 RLS 權限:", error);
      } else {
          console.log("✅ Supabase 連線成功，找到資料列數量:", data);
      }
  } catch (e) {
      console.error("網路請求發生嚴重錯誤:", e);
  }
}
testConnection();