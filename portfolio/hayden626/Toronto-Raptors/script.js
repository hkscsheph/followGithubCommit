// 多倫多暴龍隊 2025-26 賽季更完整球員數據與名單 
const officialRaptorsData = [
  { no: "03", name: "Brandon Ingram", pos: "小前鋒 (SF)", age: 28, ht_wt: "6'8\" / 190 lbs", pts: "21.5", reb: "5.6", ast: "3.7", school: "Duke" },
  { no: "04", name: "Scottie Barnes", pos: "大前鋒 (PF)", age: 24, ht_wt: "6'8\" / 237 lbs", pts: "18.1", reb: "7.5", ast: "5.9", school: "Florida State" },
  { no: "09", name: "RJ Barrett", pos: "得分後衛 (SG)", age: 25, ht_wt: "6'6\" / 214 lbs", pts: "19.3", reb: "5.3", ast: "3.3", school: "Duke" },
  { no: "05", name: "Immanuel Quickley", pos: "控球後衛 (PG)", age: 26, ht_wt: "6'2\" / 190 lbs", pts: "16.4", reb: "4.0", ast: "5.9", school: "Kentucky" },
  { no: "54", name: "S. Mamukelashvili", pos: "大前鋒/中鋒 (F/C)", age: 27, ht_wt: "6'9\" / 240 lbs", pts: "11.2", reb: "4.9", ast: "1.9", school: "Seton Hall" },
  { no: "19", name: "Jakob Poeltl", pos: "中鋒 (C)", age: 30, ht_wt: "7'0\" / 253 lbs", pts: "10.7", reb: "7.0", ast: "2.0", school: "Utah" },
  { no: "12", name: "Collin Murray-Boyles", pos: "前鋒 (PF)", age: 20, ht_wt: "6'7\" / 245 lbs", pts: "8.5", reb: "5.0", ast: "1.9", school: "South Carolina" },
  { no: "14", name: "Ja'Kobe Walter", pos: "得分後衛 (SG)", age: 21, ht_wt: "6'4\" / 180 lbs", pts: "7.5", reb: "2.6", ast: "1.2", school: "Baylor" },
  { no: "01", name: "Gradey Dick", pos: "得分後衛 (SG)", age: 22, ht_wt: "6'6\" / 205 lbs", pts: "10.2", reb: "2.1", ast: "1.5", school: "Kansas" },
  { no: "11", name: "Bruce Brown", pos: "得分後衛 (SG)", age: 29, ht_wt: "6'4\" / 202 lbs", pts: "9.6", reb: "3.8", ast: "2.7", school: "Miami" },
  { no: "41", name: "Kelly Olynyk", pos: "中鋒/前鋒 (C/F)", age: 35, ht_wt: "6'11\" / 240 lbs", pts: "7.8", reb: "4.5", ast: "3.2", school: "Gonzaga" },
  { no: "30", name: "Ochai Agbaji", pos: "小前鋒 (SF)", age: 26, ht_wt: "6'5\" / 215 lbs", pts: "5.4", reb: "2.5", ast: "1.0", school: "Kansas" }
];

const transactionHistory = [
  { date: "2026 賽季成果", event: "暴龍隊例行賽打出 46 勝 36 負，名列東區第 5，在季後賽展現頑強戰力。" },
  { date: "2026 重大交易", event: "季中發動大型交易引進明星前鋒 Brandon Ingram，與 Barnes、Barrett 組成強力鋒線群。" },
  { date: "年度防守殊榮", event: "核心球星 Scottie Barnes 憑藉統治級的全能防守，成功入選 2025-26 賽季「年度最佳防守陣容第二隊」。" },
  { date: "新秀戰力崛起", event: "首輪新秀大前鋒 Collin Murray-Boyles 表現驚艷，賽季結束後順利入選「年度最佳新秀陣容第二隊」。" },
  { date: "2024-07", event: "球隊與當家球星 Scottie Barnes 達成了頂薪續約協議，簽下 5 年指定新秀最高薪合約。" },
  { date: "2024-07", event: "自由市場開啟後，球隊正式與 Immanuel Quickley 達成 5 年 1.75 億美元的長期續約。" }
];

const newsData = [
  {
    title: "賽季總結：Rajaković 總教練全能傳導體系大獲成功",
    desc: "暴龍隊本季在攻防兩端均大放異彩，特別是團隊防守效率位居聯盟前 10 名，圍繞 Barnes 與 Ingram 的多核戰術已成球隊基石。"
  },
  {
    title: "休賽期前瞻：烏傑里總裁表示將著重補強替補板凳深度",
    desc: "管理層在媒體日透漏，主力核心架構已基本定型，今年夏天的主要目標是透過自由市場引入外線 3D 防守型射手，強化輪替陣容。"
  },
  {
    title: "球評分析：RJ Barrett 的效率提升是暴龍本賽季的一大驚喜",
    desc: "自從從紐約轉會回到家鄉加拿大後，Barrett 的進攻選擇與三分球穩定度大幅躍進，場均穩定增長，成為第二控球點的絕佳選擇。"
  },
  {
    title: "傷情報告：Immanuel Quickley 康復進度良好，預計能趕上夏季特訓",
    desc: "暴龍醫療團隊確認，Quickley 季末遭遇的輕微韌帶扭傷已無大礙，目前正處於功能性恢復階段，將以 100% 的狀態迎接下賽季。"
  }
];

// 核心渲染函數
function renderDashboardData() {
  // 1. 渲染球員名單
  const rosterTableBody = document.getElementById("real-roster-data");
  if (rosterTableBody && rosterTableBody.children.length === 0) {
    officialRaptorsData.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${p.no}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.pos}</td>
        <td>${p.age}</td>
        <td>${p.ht_wt}</td>
        <td style="color: #fff; font-weight: bold;">${p.pts}</td>
        <td>${p.reb}</td>
        <td>${p.ast}</td>
        <td style="color: var(--raptors-gold);">${p.school}</td>
      `;
      rosterTableBody.appendChild(tr);
    });
  }

  // 2. 渲染交易歷史
  const tradeTimeline = document.getElementById("trade-timeline");
  if (tradeTimeline && tradeTimeline.children.length === 0) {
    transactionHistory.forEach(t => {
      const item = document.createElement("div");
      item.className = "timeline-item";
      item.innerHTML = `
        <span class="timeline-date">[ ${t.date} ]</span>
        <p>${t.event}</p>
      `;
      tradeTimeline.appendChild(item);
    });
  }

  // 3. 渲染新聞
  const newsArchive = document.getElementById("news-archive");
  if (newsArchive && newsArchive.children.length === 0) {
    newsData.forEach(n => {
      const box = document.createElement("div");
      box.className = "news-box";
      box.innerHTML = `
        <h4>${n.title}</h4>
        <p>${n.desc}</p>
      `;
      newsArchive.appendChild(box);
    });
  }
}

// 雙重安全加載保障：不論 DOM 載入快慢，皆能成功觸發渲染
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderDashboardData);
} else {
  renderDashboardData();
}