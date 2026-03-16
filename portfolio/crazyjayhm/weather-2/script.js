var API_URL = "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc";
var ICON_BASE = "https://www.hko.gov.hk/images/HKOWxIconOutline/pic";

var weatherList = document.getElementById("weatherList");
var updateTime = document.getElementById("updateTime");
var refreshBtn = document.getElementById("refreshBtn");

function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) {
    return "日期不明";
  }
  var year = dateStr.substring(0, 4);
  var month = dateStr.substring(4, 6);
  var day = dateStr.substring(6, 8);
  return year + "-" + month + "-" + day;
}

function getValue(obj, key1, key2) {
  if (!obj) return "";
  if (key2) {
    if (obj[key1] && obj[key1][key2] !== undefined) {
      return obj[key1][key2];
    }
    return "";
  }
  return obj[key1] !== undefined ? obj[key1] : "";
}

function createCard(day) {
  var icon = day.ForecastIcon;
  if (Array.isArray(icon)) {
    icon = icon[0];
  }

  var iconHtml = "";
  if (icon !== undefined && icon !== null && icon !== "") {
    iconHtml = '<img src="' + ICON_BASE + icon + '.png" alt="天氣圖示">';
  }

  var minTemp = getValue(day, "forecastMintemp", "value") || "--";
  var maxTemp = getValue(day, "forecastMaxtemp", "value") || "--";
  var tempUnit = getValue(day, "forecastMaxtemp", "unit") || "C";
  var minRh = getValue(day, "forecastMinrh", "value") || "--";
  var maxRh = getValue(day, "forecastMaxrh", "value") || "--";

  return ''
    + '<div class="card">'
    +   '<h2>' + formatDate(day.forecastDate) + ' (' + (day.week || "未知") + ')' + '</h2>'
    +   iconHtml
    +   '<p><strong>天氣：</strong>' + (day.forecastWeather || "沒有資料") + '</p>'
    +   '<p><strong>氣溫：</strong>' + minTemp + '°' + tempUnit + ' - ' + maxTemp + '°' + tempUnit + '</p>'
    +   '<p><strong>濕度：</strong>' + minRh + '% - ' + maxRh + '%</p>'
    +   '<p><strong>風力：</strong>' + (day.forecastWind || "未提供") + '</p>'
    + '</div>';
}

function loadWeather() {
  weatherList.innerHTML = '<div class="loading">載入中...</div>';

  fetch(API_URL, { cache: "no-store" })
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      var list = data.weatherForecast || [];
      var html = "";
      var i;

      if (!list.length) {
        weatherList.innerHTML = '<div class="error">目前沒有天氣資料。</div>';
        return;
      }

      for (i = 0; i < 5 && i < list.length; i++) {
        html += createCard(list[i]);
      }

      weatherList.innerHTML = html;
      updateTime.textContent = "更新時間：" + (data.updateTime || "未知");
    })
    .catch(function(error) {
      weatherList.innerHTML = '<div class="error">無法載入資料，請檢查檔案名稱、路徑或網絡設定。</div>';
      updateTime.textContent = "更新時間：讀取失敗";
    });
}

refreshBtn.addEventListener("click", loadWeather);
loadWeather();