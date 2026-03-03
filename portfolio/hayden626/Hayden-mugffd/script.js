
      const canvas = document.getElementById('visualizer');
      const ctx = canvas.getContext('2d');
      const startBtn = document.getElementById('startBtn');
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      let audioCtx, notes = [], score = 0, combo = 0;
      let nextNoteTime = 0;
      const lanePos = [canvas.width/2 - 150, canvas.width/2 - 50, canvas.width/2 + 50, canvas.width/2 + 150];
      
      // --- 自動生成音樂 (Synthesizer) ---
      function playBeat(time) {
          // 簡單嘅踢鼓聲 (Kick Drum)
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
          gain.gain.setValueAtTime(1, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(time);
          osc.stop(time + 0.5);
      
          // 每一下節拍自動生一個遊戲方塊
          const lane = Math.floor(Math.random() * 4);
          notes.push({ x: lanePos[lane], y: -50, lane: lane, speed: 7, time: time });
      }
      
      // --- 震撼背景渲染 ---
      function drawScene() {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      
          // 隨機霓虹線條背景
          ctx.strokeStyle = '#330066';
          for(let i=0; i<canvas.width; i+=100) {
              ctx.beginPath();
              ctx.moveTo(i, 0);
              ctx.lineTo(i + (Math.random()-0.5)*50, canvas.height);
              ctx.stroke();
          }
      
          // 畫出音符
          notes.forEach((note, i) => {
              note.y += note.speed;
              ctx.fillStyle = `hsl(${note.lane * 70 + 200}, 100%, 50%)`;
              ctx.shadowBlur = 20;
              ctx.shadowColor = ctx.fillStyle;
              ctx.fillRect(note.x - 35, note.y, 70, 15);
              
              if (note.y > canvas.height) {
                  notes.splice(i, 1);
                  combo = 0;
                  document.getElementById('combo').style.opacity = 0;
              }
          });
      
          // 節拍器控制邏輯
          if (audioCtx && audioCtx.currentTime + 0.2 > nextNoteTime) {
              playBeat(nextNoteTime);
              nextNoteTime += 0.5; // 每 0.5 秒一拍 (120 BPM)
          }
      
          requestAnimationFrame(drawScene);
      }
      
      // --- 互動控制 ---
      window.onkeydown = (e) => {
          const keys = { 'a': 0, 's': 1, 'd': 2, 'f': 3 };
          if (e.key.toLowerCase() in keys) {
              const lane = keys[e.key.toLowerCase()];
              const hints = document.querySelectorAll('.lane-hint');
              hints[lane].classList.add('active');
              setTimeout(() => hints[lane].classList.remove('active'), 100);
      
              const hitIdx = notes.findIndex(n => n.lane === lane && n.y > canvas.height - 150 && n.y < canvas.height - 50);
              if (hitIdx !== -1) {
                  score += 100;
                  combo++;
                  notes.splice(hitIdx, 1);
                  document.getElementById('score').innerText = `SCORE: ${score}`;
                  document.getElementById('combo').innerText = `COMBO x${combo}`;
                  document.getElementById('combo').style.opacity = 1;
              }
          }
      };
      
      startBtn.onclick = () => {
          document.getElementById('startScreen').style.display = 'none';
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          nextNoteTime = audioCtx.currentTime;
          drawScene();
      };