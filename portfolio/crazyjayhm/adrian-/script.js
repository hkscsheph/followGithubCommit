// 進階生活記錄 App - localStorage + 動態功能
document.addEventListener('DOMContentLoaded', () => {
  const app = {
      tabs: document.querySelectorAll('.tab-btn'),
      contents: document.querySelectorAll('.tab-content'),
      form: document.querySelector('.add-log'),
      titleInput: document.getElementById('logTitle'),
      contentInput: document.getElementById('logContent'),
      dateEl: document.getElementById('currentDate'),
      stats: {
          achieved: document.getElementById('achieved'),
          mood: document.getElementById('mood'),
          streak: document.getElementById('streak')
      },
      logs: {
          today: document.getElementById('todayLogs'),
          notes: document.getElementById('noteLogs'),
          tasks: document.getElementById('taskList')
      },
       JSON.parse(localStorage.getItem('lifeJournal')) || {
          logs: { today: [], notes: [], tasks: [] },
          stats: { achieved: 0, mood: 0, streak: 1 }
      }
  };

  // 更新日期
  function updateDate() {
      const now = new Date();
      const day = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
      app.dateEl.textContent = ${day} - Day ${app.data.stats.streak};
  }

  // 更新stats
  function updateStats() {
      app.stats.achieved.textContent = app.data.stats.achieved;
      app.stats.mood.textContent = app.data.stats.mood;
      app.stats.streak.textContent = Day ${app.data.stats.streak};
  }

  // 渲染logs
  function renderLogs(tab) {
      const logsEl = app.logs[tab];
      if (tab === 'tasks') {
          logsEl.innerHTML = app.data.logs[tab].map(task => <li class="gear-item">${task}</li>).join('');
      } else {
          logsEl.innerHTML = app.data.logs[tab].map(log => 
              <div class="log-item"><strong>${log.title}</strong><p>${log.content}</p></div>
          ).join('') || ${tab === 'today' ? '今日做了什麼？' : '快速記低想法。'};
      }
  }

  // Tab切換
  app.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
          app.tabs.forEach(t => t.classList.remove('active'));
          app.contents.forEach(c => c.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById(tab.dataset.tab).classList.add('active');
          renderLogs(tab.dataset.tab);
      });
  });

  // Form提交 - 新增log
  app.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
      const title = app.titleInput.value.trim();
      const content = app.contentInput.value.trim();
      if (title || content) {
          app.data.logs[activeTab].unshift({ title, content, date: new Date().toISOString() });
          app.data.stats.achieved++;
          app.data.stats.streak++;
          app.titleInput.value = '';
          app.contentInput.value = '';
          renderLogs(activeTab);
          saveData();
          updateStats();
      }
  });

  // 清空數據
  document.getElementById('clearData').addEventListener('click', () => {
      if (confirm('確定清空所有記錄？')) {
          app.data = { logs: { today: [], notes: [], tasks: [] }, stats: { achieved: 0, mood: 0, streak: 1 } };
          Object.values(app.logs).forEach(el => el.innerHTML = el.id === 'taskList' ? '<li class="gear-item">任務1</li>' : '');
          saveData();
          updateStats();
      }
  });

  // 儲存localStorage
  function saveData() {
      localStorage.setItem('lifeJournal', JSON.stringify(app.data));
  }

  // 初始化
  updateDate();
  updateStats();
  renderLogs('today');
});