const apiUrl =
  'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc';

const weatherList = document.getElementById('weatherList');
const updateTime = document.getElementById('updateTime');

function formatDate(dateStr) {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}-${month}-${day}`;
}

async function loadWeather() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    updateTime.textContent = `更新時間：${data.updateTime || '未知'}`;

    const forecasts = data.weatherForecast.slice(0, 5);

    weatherList.innerHTML = forecasts
      .map(
        (day) => `
      <div class="card">
        <h2>${formatDate(day.forecastDate)} (${day.week})</h2>
        <p><span class="label">天氣：</span>${day.forecastWeather}</p>
        <p><span class="label">氣溫：</span>${day.forecastMintemp.value}°${
          day.forecastMintemp.unit
        } - ${day.forecastMaxtemp.value}°${day.forecastMaxtemp.unit}</p>
        <p><span class="label">風力：</span>${day.forecastWind}</p>
        <p><span class="label">濕度：</span>${day.forecastMinrh.value}% - ${
          day.forecastMaxrh.value
        }%</p>
      </div>
    `
      )
      .join('');
  } catch (error) {
    weatherList.innerHTML = `<div class="error">無法載入天氣資料，請稍後再試。</div>`;
    updateTime.textContent = '讀取失敗';
  }
}

loadWeather();
