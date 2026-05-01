var targetKeyEl = document.getElementById('targetKey');
var countdownEl = document.getElementById('countdown');
var hitsEl = document.getElementById('hits');
var difficultyText = document.getElementById('difficultyText');
var statusEl = document.getElementById('status');
var youRunner = document.getElementById('youRunner');
var cpuRunner = document.getElementById('cpuRunner');
var youFill = document.getElementById('youFill');
var cpuFill = document.getElementById('cpuFill');
var difficultySelect = document.getElementById('difficulty');
var startBtn = document.getElementById('startBtn');
var resetBtn = document.getElementById('resetBtn');

var keys = ['A', 'S', 'D', 'F', 'J', 'K', 'L'];
var profiles = {
  easy: { min: 0.003, max: 0.006, label: '易' },
  normal: { min: 0.0045, max: 0.0075, label: '普通' },
  hard: { min: 0.006, max: 0.0095, label: '難' },
};

var targetKey = 'A';
var hits = 0;
var playerProgress = 0;
var cpuProgress = 0;
var playing = false;
var finished = false;
var countdownTimer = null;
var raceTimer = null;

function randomKey() {
  return keys[Math.floor(Math.random() * keys.length)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getTrackPoint(progress, lane) {
  var t = Math.PI + progress * Math.PI * 2;
  var cx = 50;
  var cy = 50;
  var rx = lane === 'you' ? 36 : 30.5;
  var ry = lane === 'you' ? 25 : 20;

  return {
    x: cx + rx * Math.cos(t),
    y: cy + ry * Math.sin(t),
  };
}

function placeRunner(el, progress, lane) {
  var p = getTrackPoint(progress, lane);
  el.style.left = p.x + '%';
  el.style.top = p.y + '%';
}

function flashRunner(el) {
  el.classList.remove('bounce');
  void el.offsetWidth;
  el.classList.add('bounce');
}

function updateUI() {
  targetKeyEl.textContent = targetKey;
  hitsEl.textContent = hits;
  difficultyText.textContent = profiles[difficultySelect.value].label;

  if (playing) {
    countdownEl.textContent = 'GO';
  }

  youFill.style.width = playerProgress * 100 + '%';
  cpuFill.style.width = cpuProgress * 100 + '%';

  placeRunner(youRunner, playerProgress, 'you');
  placeRunner(cpuRunner, cpuProgress, 'cpu');
}

function resetGame(message) {
  if (!message) {
    message = '撳開始準備起跑';
  }

  clearInterval(countdownTimer);
  clearInterval(raceTimer);

  targetKey = randomKey();
  hits = 0;
  playerProgress = 0;
  cpuProgress = 0;
  playing = false;
  finished = false;

  countdownEl.textContent = '3';
  statusEl.textContent = message;
  updateUI();
}

function finishRace(winner) {
  finished = true;
  playing = false;
  clearInterval(raceTimer);
  countdownEl.textContent = '完';

  if (winner === 'you') {
    statusEl.textContent = '你贏咗一個圈！';
  } else {
    statusEl.textContent = '電腦快你一步衝線！';
  }
}

function startRaceLoop() {
  var profile = profiles[difficultySelect.value];

  raceTimer = setInterval(function () {
    if (!playing || finished) return;

    cpuProgress += profile.min + Math.random() * (profile.max - profile.min);
    cpuProgress = clamp(cpuProgress, 0, 1);

    if (cpuProgress >= 1) {
      updateUI();
      finishRace('cpu');
      return;
    }

    updateUI();
  }, 60);
}

function startCountdown() {
  var count = 3;
  countdownEl.textContent = count;
  statusEl.textContent = '預備...';

  clearInterval(countdownTimer);

  countdownTimer = setInterval(function () {
    count -= 1;

    if (count > 0) {
      countdownEl.textContent = count;
      statusEl.textContent = '準備開跑...';
    } else if (count === 0) {
      countdownEl.textContent = 'GO';
      statusEl.textContent = '快啲撳 ' + targetKey;
      playing = true;
      startRaceLoop();
    } else {
      clearInterval(countdownTimer);
    }
  }, 850);
}

document.addEventListener('keydown', function (e) {
  if (!playing || finished) return;

  var pressed = e.key.toUpperCase();
  if (pressed !== targetKey) return;

  hits += 1;
  playerProgress += 0.055;
  playerProgress = clamp(playerProgress, 0, 1);
  flashRunner(youRunner);

  if (playerProgress >= 1) {
    updateUI();
    finishRace('you');
    return;
  }

  targetKey = randomKey();
  statusEl.textContent = '繼續撳 ' + targetKey;
  updateUI();
});

startBtn.addEventListener('click', function () {
  resetGame('倒數中...');
  startCountdown();
});

resetBtn.addEventListener('click', function () {
  resetGame();
});

difficultySelect.addEventListener('change', function () {
  difficultyText.textContent = profiles[difficultySelect.value].label;
});

resetGame();
