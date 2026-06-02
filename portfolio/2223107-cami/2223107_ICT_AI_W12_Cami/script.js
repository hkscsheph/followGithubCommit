document.addEventListener('DOMContentLoaded', () => {
  const pins = document.querySelectorAll('.radar-pin');
  const hudCard = document.getElementById('hud-card');

  // 監聽地圖上所有雷達點的滑鼠移入事件 (電腦端) 或點擊事件 (手機端)
  pins.forEach(pin => {
      pin.addEventListener('mouseenter', (e) => {
          activateTarget(e.target);
      });

      pin.addEventListener('click', (e) => {
          activateTarget(e.target);
      });
  });

  // 當滑鼠移出地圖大區域，卡片自動隱藏，讓畫面保持乾淨
  document.querySelector('.world-map').addEventListener('mouseleave', () => {
      hudCard.classList.remove('visible');
      pins.forEach(p => p.classList.remove('active'));
  });

  // 讀取隱藏數據庫並渲染到 HUD 面板的主功能
  function activateTarget(targetPin) {
      // 清除其他點的高亮
      pins.forEach(p => p.classList.remove('active'));
      targetPin.classList.add('active');

      const targetId = targetPin.getAttribute('data-target');
      const dbSource = document.getElementById(targetId);

      if (!dbSource) return;

      // 提取隱藏資料
      const sciName = dbSource.querySelector('.sci-name').textContent;
      const comName = dbSource.querySelector('.com-name').textContent;
      const imgUrl = dbSource.querySelector('.img-url').textContent;
      const status = dbSource.querySelector('.status').textContent;
      const desc = dbSource.querySelector('.desc').textContent;

      // 根據瀕危狀態調整標籤外觀
      let statusClass = '';
      if (status === '已滅絕') statusClass = 'extinct';
      if (status === '無危' || status === '永不放棄') statusClass = 'safe';

      // 動態注入到 HUD 卡片中
      hudCard.innerHTML = `
          <img class="hud-photo" src="${imgUrl}" alt="${comName}">
          <div class="hud-title-sci">${sciName}</div>
          <div class="hud-title-com">${comName}</div>
          <div class="hud-status ${statusClass}">${status}</div>
          <p class="hud-desc">${desc}</p>
      `;

      // 顯示 HUD 面板
      hudCard.classList.add('visible');
  }
});