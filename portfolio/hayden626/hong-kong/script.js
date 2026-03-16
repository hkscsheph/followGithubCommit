// 香港真實人口數據
const dataset = [
  {year: "2018", pop: 7451000, m: 82.2, f: 87.6},
  {year: "2019", pop: 7507400, m: 82.3, f: 88.1},
  {year: "2020", pop: 7481800, m: 82.9, f: 88.0},
  {year: "2021", pop: 7413100, m: 83.0, f: 88.4},
  {year: "2022", pop: 7346100, m: 83.2, f: 88.5},
  {year: "2023", pop: 7498100, m: 83.3, f: 88.7},
  {year: "2024", pop: 7503100, m: 83.5, f: 88.9}
];

let mainChart, radarChart;

// 系統啟動
function bootTerminal() {
  updateCharts();
  updateTable();
  setInterval(updateClock, 1000);
  setInterval(simulateData, 2500);
  setInterval(scrollingLogs, 3000);
}

function updateClock() {
  document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}

function simulateData() {
  // 讓人口數字微跳
  const base = 7503100;
  const jitter = Math.floor(Math.random() * 10);
  document.getElementById('pop-main').innerText = (base + jitter).toLocaleString();
}

function scrollingLogs() {
  const logs = ["SYNCING_NODE_115", "DATA_VALIDATED", "RECALC_TREND", "DB_UPDATE_OK"];
  const box = document.getElementById('console-out');
  const time = new Date().toLocaleTimeString().split(' ')[0];
  box.innerHTML += `<div>[${time}] > ${logs[Math.floor(Math.random()*logs.length)]}</div>`;
  if(box.childNodes.length > 6) box.removeChild(box.firstChild);
}

function updateTable() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = [...dataset].reverse().map(d => `
      <tr><td>${d.year}</td><td class="neon-cyan">${d.pop.toLocaleString()}</td><td>${d.m}</td><td>${d.f}</td></tr>
  `).join('');
}

function updateCharts() {
  const latest = dataset[dataset.length - 1];
  document.getElementById('life-m').innerText = latest.m;
  document.getElementById('life-f').innerText = latest.f;

  // 主圖表
  const ctxMain = document.getElementById('mainChart').getContext('2d');
  if(mainChart) mainChart.destroy();
  mainChart = new Chart(ctxMain, {
      type: 'line',
      data: {
          labels: dataset.map(d => d.year),
          datasets: [{
              data: dataset.map(d => d.pop),
              borderColor: '#00f3ff',
              backgroundColor: 'rgba(0, 243, 255, 0.05)',
              fill: true,
              tension: 0.4,
              borderWidth: 2
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
              y: { grid: { color: '#111' }, ticks: { display: false } },
              x: { grid: { display: false }, ticks: { color: '#444' } }
          }
      }
  });

  // 雷達圖
  const ctxRadar = document.getElementById('radarChart').getContext('2d');
  if(radarChart) radarChart.destroy();
  radarChart = new Chart(ctxRadar, {
      type: 'radar',
      data: {
          labels: ['POP', 'MALE', 'FEMALE', 'DENS', 'HLTH'],
          datasets: [{
              data: [90, latest.m, latest.f, 85, 95],
              borderColor: '#0088ff',
              backgroundColor: 'rgba(0, 136, 255, 0.2)',
              pointRadius: 0
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
              r: { grid: { color: '#222' }, angleLines: { color: '#222' }, ticks: { display: false }, pointLabels: { color: '#444' } }
          }
      }
  });
}

// 確保所有資源加載後執行
window.addEventListener('load', bootTerminal);