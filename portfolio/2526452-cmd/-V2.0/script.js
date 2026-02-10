function generateDocument() {
    // --- V3.0 新增：儲存使用者資料 ---
    localStorage.setItem('savedName', document.getElementById('name').value);
    localStorage.setItem('savedDept', document.getElementById('dept').value);
    
    // ... 下面接你原本的舊程式碼 ...

// --- V3.0 功能：開啟 Email 草稿 ---
function openEmailDraft() {
    const name = document.getElementById('name').value;
    const type = document.getElementById('type').options[document.getElementById('type').selectedIndex].text;
    
    // 檢查是否有生成過內容，如果沒有就用預設提示
    const bodyContent = window.generatedChatText || "請先點擊「生成預覽」以產生內容。";
    
    const subject = encodeURIComponent(`請假申請 - ${name} - ${type}`);
    const body = encodeURIComponent(bodyContent);
    
    // 開啟系統預設郵件軟體
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// --- V3.0 功能：下載行事曆檔案 (.ics) ---
function addToCalendar() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const type = document.getElementById('type').value;
    
    if(!start || !end) { alert("請選擇日期！"); return; }

    // 格式化日期 (移除橫線，符合 ICS 格式: YYYYMMDD)
    const format = (date) => date.replace(/-/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:${format(start)}
DTEND;VALUE=DATE:${format(end)}
SUMMARY:休假：${type}
DESCRIPTION:已透過請假系統申請。
END:VEVENT
END:VCALENDAR`;

    // 建立下載連結
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leave_event.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}