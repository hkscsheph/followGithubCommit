document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('ai-bttn');
    const bubble = document.getElementById('info-bubble');
    const closeBtn = document.getElementById('close-bttn');
  
    trigger.addEventListener('click', () => {
      bubble.classList.remove('bubble-hidden');
    });

    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      bubble.classList.add('bubble-hidden');
    });
  });

  //line break

  document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('work-bttn');
    const bubble = document.getElementById('timer-tab');
    const closeBtn = document.getElementById('close-bttn2');
  
    trigger.addEventListener('click', () => {
      bubble.classList.remove('timer-hidden');
    });

    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      bubble.classList.add('timer-hidden');
    });
  });

//timer

  const workBtn = document.getElementById('work-bttn');
  const closeBtn = document.getElementById('close-bttn2');
const display = document.getElementById('timer-display');

let timer;
let timeLeft = 61;

workBtn.addEventListener('click', () => {
  clearInterval(timer);
  
  timeLeft = 61;

  timer = setInterval(() => {
    timeLeft--;

    closeBtn.disabled = true;

    const minutes = Math.floor(timeLeft / 61);
    const seconds = timeLeft % 61;

    display.textContent = 
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      display.textContent = "00:00";
      closeBtn.disabled = false;
    }
  }, 1000);
});

//i want to sleep

let hwCount = 3;
let choices = [];

const hwDisplay = document.getElementById('funne-counter');
const endingDisplay = document.getElementById('ending-message');
const aiEnding = document.getElementById('ai-bttn');
const humanEnding = document.getElementById('work-bttn')

function handleTask(type) {
  if (hwCount > 0) {
    hwCount--;
    choices.push(type);
    hwDisplay.textContent = `HOMEWORK TO DO: ${hwCount}`;

    if (hwCount === 0) {
      triggerEnding();
        aiBtn.disabled = true;
  workBtn.disabled = true;
    }
  }
}
function triggerEnding() {
  const aiUsage = choices.filter(choice => choice === 'ai').length;
  const humanUsage = choices.filter(choice => choice === 'human').length;


  if (humanUsage === 3) {
    endingDisplay.textContent = "you wasted 3 hours of your precious time! at least it'll show on your report card.";
  } else if (aiUsage === 1) {
    endingDisplay.textContent = "thanks for polluting the earth.";
}

aiBtn.addEventListener('click', () => handleTask('ai'));
workBtn.addEventListener('click', () => handleTask('human'));
}