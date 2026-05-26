const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

let isRecording = false;
let isPlaying = false;
let startTime = 0;
let recordedNotes = [];
let playbackTimeoutIds = [];

const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-btn');
const clearBtn = document.getElementById('clear-btn');
const toneSelect = document.getElementById('tone-select');
const statusText = document.getElementById('status-text');
const frets = document.querySelectorAll('.fret');

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

// 萬能音色合成器
function playBassNote(frequency, toneType) {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // 建立基礎節點
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    osc.frequency.setValueAtTime(frequency, now);

    // 根據選取的音色調配架構
    switch(toneType) {
        case 'sub-bass':
            // 深度重低音：使用純淨的正弦波，極低的過濾頻率，只有物理震動感
            osc.type = 'sine';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(120, now);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1.0, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            break;

        case 'synth':
            // 復古合成器：鋸齒波(Sawtooth)，帶有明顯的濾波器掃頻(Envelope Filter)
            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            // 模擬合成器哇哇聲效果
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.6, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            break;

        case 'slap':
            // 敲擊低音：高頻爆破音，模擬手指大力擊弦
            osc.type = 'triangle';
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1500, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            
            // 額外加一個極短的方波製造雜訊敲擊感
            const noiseOsc = audioCtx.createOscillator();
            const noiseGain = audioCtx.createGain();
            noiseOsc.type = 'square';
            noiseOsc.frequency.setValueAtTime(frequency * 4, now);
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            noiseOsc.connect(noiseGain);
            noiseGain.connect(gainNode);
            noiseOsc.start(now);
            noiseOsc.stop(now + 0.05);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.8, now + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            break;

        case 'classic':
        default:
            // 經典電低音：三角波混合一點點高頻，模擬標準木頭共鳴
            osc.type = 'triangle';
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, now);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            break;
    }

    // 連接節點
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 啟動與停止
    osc.start(now);
    osc.stop(now + 2.0);
}

// 十二平均律音高計算
function getFrequency(baseFreq, fret) {
    return baseFreq * Math.pow(2, fret / 12);
}

// 點擊事件
frets.forEach(fret => {
    fret.addEventListener('mousedown', (e) => {
        const row = e.target.parentElement;
        const baseFreq = parseFloat(row.dataset.base);
        const fretNum = parseInt(e.target.dataset.fret);
        const frequency = getFrequency(baseFreq, fretNum);
        const currentTone = toneSelect.value;

        // 播音
        playBassNote(frequency, currentTone);

        // 錄音機制
        if (isRecording) {
            const timeOffset = audioCtx.currentTime - startTime;
            recordedNotes.push({
                frequency: frequency,
                toneType: currentTone, // 同時記錄當時選擇的音色
                time: timeOffset
            });
        }
    });
});

// 錄音控制
recordBtn.addEventListener('click', () => {
    initAudio();
    if (!isRecording) {
        isRecording = true;
        recordedNotes = [];
        startTime = audioCtx.currentTime;
        recordBtn.textContent = '⏹️ 停止錄音';
        recordBtn.classList.add('recording');
        statusText.textContent = '狀態: 錄音中...';
        playBtn.disabled = true;
    } else {
        isRecording = false;
        recordBtn.textContent = '🔴 開始錄音';
        recordBtn.classList.remove('recording');
        statusText.textContent = `狀態: 已錄製 ${recordedNotes.length} 個音符`;
        if (recordedNotes.length > 0) playBtn.disabled = false;
    }
});

// 播放控制
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        stopPlayback();
    } else {
        isPlaying = true;
        playBtn.textContent = '⏹️ 停止播放';
        statusText.textContent = '狀態: 正在播放...';
        
        recordedNotes.forEach(note => {
            const id = setTimeout(() => {
                playBassNote(note.frequency, note.toneType);
            }, note.time * 1000);
            playbackTimeoutIds.push(id);
        });

        const totalDuration = recordedNotes.length > 0 ? recordedNotes[recordedNotes.length - 1].time + 1.5 : 0;
        const endId = setTimeout(() => { stopPlayback(); }, totalDuration * 1000);
        playbackTimeoutIds.push(endId);
    }
});

function stopPlayback() {
    isPlaying = false;
    playBtn.textContent = '▶️ 播放旋律';
    statusText.textContent = '狀態: 閒置';
    playbackTimeoutIds.forEach(id => clearTimeout(id));
    playbackTimeoutIds = [];
}

clearBtn.addEventListener('click', () => {
    stopPlayback();
    recordedNotes = [];
    playBtn.disabled = true;
    statusText.textContent = '狀態: 已清空';
});