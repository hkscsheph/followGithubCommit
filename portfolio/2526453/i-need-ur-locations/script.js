const updateLiveTracker = () => {
  const now = new Date();

  // 1. Update Clock (24h format with leading zeros)
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const clockElement = document.getElementById('digital-clock');
  if (clockElement) {
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // 2. Update Date
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    dateElement.textContent = now.toLocaleDateString(undefined, options);
  }

  // 3. Timetable Logic (HHMM format)
  const currentTime = now.getHours() * 100 + now.getMinutes();
  let status = 'School is Out';

  const schedule = [
    { name: 'Period 1', start: 800, end: 850 },
    { name: 'Period 2', start: 850, end: 940 },
    { name: 'Recess', start: 940, end: 1000 },
    { name: 'Period 3', start: 1000, end: 1050 },
    { name: 'Period 4', start: 1050, end: 1140 },
    { name: 'Lunch', start: 1140, end: 1230 },
    { name: 'Period 5', start: 1230, end: 1320 },
    { name: 'Period 6', start: 1320, end: 1410 },
    { name: 'Period 7', start: 1410, end: 1500 },
    { name: 'Period 8', start: 1500, end: 1550 },
  ];

  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0 || day === 6) {
    status = 'Weekend - No School';
  } else {
    for (const session of schedule) {
      if (currentTime >= session.start && currentTime < session.end) {
        status = session.name;
        break;
      }
    }
  }

  const statusElement = document.getElementById('current-period-display');
  if (statusElement) {
    statusElement.textContent = status;
  }
};

// CRITICAL FIX: Ensure the DOM is fully loaded before running
document.addEventListener('DOMContentLoaded', () => {
  console.log('123');
  updateLiveTracker(); // Run once immediately
  setInterval(updateLiveTracker, 1000); // Sync every second
});
