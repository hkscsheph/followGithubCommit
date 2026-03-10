const teamsData = {
  raptors: { name: "Toronto Raptors", color: "#CE1141", coords: [43.643, -79.379], logo: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg", quote: "We The North.", author: "Toronto", classic: "2019 Finals: Kawhi's buzzer-beater shot." },
  lakers: { name: "LA Lakers", color: "#552583", coords: [34.043, -118.267], logo: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg", quote: "Mamba Mentality.", author: "Kobe Bryant", classic: "2006: Kobe's 81-point masterclass." },
  bulls: { name: "Chicago Bulls", color: "#CE1141", coords: [41.880, -87.674], logo: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg", quote: "I'm back.", author: "Michael Jordan", classic: "1997 Finals: The Flu Game." },
  warriors: { name: "GS Warriors", color: "#1D428A", coords: [37.768, -122.387], logo: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg", quote: "Night Night.", author: "Stephen Curry", classic: "2016: The 73-9 legendary season." },
  celtics: { name: "Boston Celtics", color: "#007A33", coords: [42.366, -71.062], logo: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg", quote: "Anything is possible!", author: "Kevin Garnett", classic: "18 Championships: NBA's most elite team." }
};

let map, isDark = true, currentMarker;
let score = 0, timeLeft = 10, isPlaying = false, highScore = localStorage.getItem('nbaHighScore') || 0;

function init() {
  // 初始化地圖
  map = L.map('map', { zoomControl: false }).setView([43.643, -79.379], 13);
  updateMap();
  
  // 強制重整地圖尺寸 (防止地圖消失)
  setTimeout(() => { map.invalidateSize(); }, 500);

  document.getElementById('high-score').innerText = highScore;
  updateBadge(highScore); // 方案 A
  changeTeam(); // 方案 C
}

// 方案 A: 成就判定
function updateBadge(s) {
  let badge = "新秀 (Rookie)";
  if (s >= 15) badge = "神射手 (Sharpshooter) 🎯";
  if (s >= 30) badge = "全明星 (All-Star) ⭐";
  if (s >= 50) badge = "名人堂 (Hall of Fame) 🏛️";
  if (s >= 75) badge = "籃球之神 (GOAT) 🐐";
  document.getElementById('badge-display').innerText = badge;
}

function changeTeam() {
  const key = document.getElementById('team-select').value;
  const team = teamsData[key];

  // 更新 UI 色彩同名言 (方案 C)
  document.documentElement.style.setProperty('--primary', team.color);
  document.getElementById('team-label').innerText = team.name;
  document.getElementById('team-logo').src = team.logo;
  document.getElementById('quote-text').innerText = `"${team.quote}"`;
  document.getElementById('quote-author').innerText = `- ${team.author}`;

  // 地圖定位同標記 (方案 C)
  map.flyTo(team.coords, 14);
  if (currentMarker) map.removeLayer(currentMarker);
  const icon = L.divIcon({ html: `<img src="${team.logo}" style="width:45px;height:45px;background:white;border-radius:10px;padding:3px;border:3px solid ${team.color}">`, className: '' });
  currentMarker = L.marker(team.coords, { icon: icon }).addTo(map)
      .bindPopup(`<b>${team.name} 經典對決:</b><br>${team.classic}`).openPopup();
}

function shootThree() {
  if (isPlaying) { 
      score++; 
      if (score % 10 === 0) triggerHype("SWISH!");
  } else {
      isPlaying = true; score = 1; timeLeft = 10;
      const timer = setInterval(() => {
          timeLeft--;
          document.getElementById('timer-txt').innerText = `得分: ${score} | 時間: ${timeLeft}s`;
          if (timeLeft <= 0) {
              clearInterval(timer); isPlaying = false;
              if (score > highScore) {
                  highScore = score; localStorage.setItem('nbaHighScore', highScore);
                  document.getElementById('high-score').innerText = highScore;
              }
              updateBadge(highScore);
              triggerHype("GAME OVER");
          }
      }, 1000);
  }
  document.getElementById('timer-txt').innerText = `得分: ${score} | 時間: ${timeLeft}s`;
}

function triggerHype(txt) {
  const el = document.createElement('div');
  el.className = 'hype-text'; el.innerText = txt;
  el.style.left = '50%'; el.style.top = '50%';
  document.getElementById('effect-overlay').appendChild(el);
  setTimeout(() => el.remove(), 800);
}

function updateMap() {
  const layer = isDark ? 'dark_all' : 'light_all';
  L.tileLayer(`https://{s}.basemaps.cartocdn.com/${layer}/{z}/{x}/{y}{r}.png`).addTo(map);
}

function toggleTheme() {
  isDark = !isDark;
  document.body.className = isDark ? 'dark-theme' : 'light-theme';
  updateMap();
}

window.onload = init;