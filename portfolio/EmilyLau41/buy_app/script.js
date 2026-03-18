<script>
async function init() {
    try {
        // 1. 確認讀取的檔名與左側檔案列表完全一致
        const res = await fetch('data.json'); 
        
        if (!res.ok) throw new Error(`找不到檔案 (代碼: ${res.status})`);
        
        const jsonData = await res.json();
        
        // 2. 偵測陣列位置 (消委會資料可能在根目錄或 items 欄位中)
        allData = Array.isArray(jsonData) ? jsonData : (jsonData.items || []);

        document.getElementById('status').style.display = 'none';
        render(allData.slice(0, 50));
    } catch (e) {
        document.getElementById('status').innerHTML = `❌ 錯誤: ${e.message}`;
    }
}

function render(items) {
    const listDiv = document.getElementById('list');
    listDiv.innerHTML = items.map(p => {
        // 3. 使用數據字典定義的 zh-Hant 欄位 [cite: 10]
        const nameZh = p.name ? p.name['zh-Hant'] : '未知貨品';
        const brandZh = p.brand ? p.brand['zh-Hant'] : '';

        // 4. 處理價格陣列 
        let priceHTML = '';
        if (p.prices && Array.isArray(p.prices)) {
            priceHTML = p.prices.map(pr => `
                <div class="price-item">
                    <span class="store-code">${pr.supermarketCode}</span>
                    <span class="amount">$${pr.price}</span>
                </div>
            `).join('');
        }

        return `
            <div class="product-card">
                <div class="brand">${brandZh}</div>
                <div class="name">${nameZh}</div>
                <div class="price-grid">${priceHTML}</div>
            </div>
        `;
    }).join('');
}
</script>