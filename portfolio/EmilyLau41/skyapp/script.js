
// 1. 初始化 Supabase (請替換成你的專案資訊)
const SUPABASE_URL = 'https://dhypkutxhcfjpzmlufxr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeXBrdXR4aGNmanB6bWx1ZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTA0OTQsImV4cCI6MjA4NTY2NjQ5NH0.0wlQw1SlkDoThRgemcyhHIg-PnsSjf50vG0Osb8kbWU';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = 'sky_images';

// 2. 上傳天空邏輯
async function uploadSky() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const loadingText = document.getElementById('loading');

    if (!file) return;

    loadingText.style.display = 'block';
    loadingText.innerText = "🚀 正在飛往 Supabase 雲端...";

    try {
        // A. 處理檔名，避免重複 (使用 timestamp)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // B. 上傳檔案到 Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from(BUCKET_NAME)
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // C. 獲取圖片的公開連結 (Public URL)
        const { data: publicUrlData } = supabaseClient.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        const imageUrl = publicUrlData.publicUrl;

        // D. (選修) 將紀錄存入 Database Table
        // 建議你在 Supabase 建立一個 daily_skies 表，包含 id, created_at, image_url 欄位
        const { error: dbError } = await supabaseClient
            .from('daily_skies')
            .insert([{ image_url: imageUrl }]);

        if (dbError) throw dbError;

        alert("天空捕捉成功！");
        fetchSkies(); // 重新載入相簿
    } catch (error) {
        console.error('Error:', error.message);
        alert("上傳失敗，請檢查權限設定！");
    } finally {
        loadingText.style.display = 'none';
        fileInput.value = ""; // 清空上傳欄位
    }
}

// 3. 獲取資料並渲染
async function fetchSkies() {
    const gallery = document.getElementById('gallery');
    
    // 從資料表抓取資料
    const { data, error } = await supabaseClient
        .from('daily_skies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    gallery.innerHTML = data.map(item => {
        const dateStr = new Date(item.created_at).toLocaleDateString('zh-TW');
        return `
            <div class="sky-item" style="animation: fadeIn 0.8s ease">
                <img src="${item.image_url}" alt="Sky" loading="lazy">
                <div class="sky-info">
                    <span class="date-tag">🗓️ ${dateStr}</span>
                    <span>☁️</span>
                </div>
            </div>
        `;
    }).join('');
}

// 初始載入
fetchSkies();