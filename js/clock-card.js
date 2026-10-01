<link rel="stylesheet" class="aplayer-secondary-style-marker" href="\assets\css\APlayer.min.css"><script src="\assets\js\APlayer.min.js" class="aplayer-secondary-script-marker"></script>/* 自写时间/天气卡片
 * 为什么自己写：原插件（hexo-butterfly-clock-anzhiyu）依赖和风天气的免费组件（已停用）、
 * 并把 API key 明文写进页面；且和风 v7 免费账号需要专属 API Host 才能取天气。
 * 这里改用 Open-Meteo（无需 key、支持跨域），失败时只降级天气，不影响时钟。
 * 想换城市：改下面 CITY 的经纬度即可（默认：贵州兴义）。
 */
(function () {
  "use strict";

  var CITY = { name: "贵州 · 兴义", lat: 25.088, lon: 104.909 };
  var CACHE_KEY = "own-clock-weather";
  var CACHE_TTL = 30 * 60 * 1000; // 30 分钟内不重复请求

  // WMO 天气代码 → 图标 + 中文
  var WMO = {
    0: ["☀️", "晴"], 1: ["🌤️", "少云"], 2: ["⛅", "多云"], 3: ["☁️", "阴"],
    45: ["🌫️", "雾"], 48: ["🌫️", "雾凇"],
    51: ["🌦️", "毛毛雨"], 53: ["🌦️", "小雨"], 55: ["🌧️", "中雨"],
    56: ["🌧️", "冻雨"], 57: ["🌧️", "冻雨"],
    61: ["🌧️", "小雨"], 63: ["🌧️", "中雨"], 65: ["🌧️", "大雨"],
    66: ["🌧️", "冻雨"], 67: ["🌧️", "冻雨"],
    71: ["🌨️", "小雪"], 73: ["🌨️", "中雪"], 75: ["❄️", "大雪"], 77: ["❄️", "雪粒"],
    80: ["🌦️", "阵雨"], 81: ["🌧️", "阵雨"], 82: ["⛈️", "强阵雨"],
    85: ["🌨️", "阵雪"], 86: ["❄️", "强阵雪"],
    95: ["⛈️", "雷阵雨"], 96: ["⛈️", "雷阵雨伴冰雹"], 99: ["⛈️", "强雷暴"]
  };

  function wmo(code) {
    return WMO[code] || ["🌡️", "未知"];
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function buildCard() {
    var d = document.createElement("div");
    d.className = "card-widget card-clock card-clock-own";
    d.innerHTML =
      '<div class="item-headline"><i class="fas fa-clock"></i><span>时间与天气</span></div>' +
      '<div class="own-time">--:--:--</div>' +
      '<div class="own-date">加载中…</div>' +
      '<div class="own-weather">' +
      '  <div class="own-w-line"><span class="own-w-loading">天气获取中…</span></div>' +
      "</div>" +
      '<div class="own-city">' + CITY.name + "</div>";
    return d;
  }

  function markErr(msg) {
    try {
      var e = document.getElementById("clock-card-diag") || document.createElement("div");
      e.id = "clock-card-diag";
      e.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;background:#c00;color:#fff;padding:6px 10px;font-size:12px;border-radius:6px";
      e.textContent = "[clock-card] " + msg;
      document.body.appendChild(e);
    } catch (x) {}
  }

  function mount() {
    if (document.querySelector(".card-clock-own")) return; // 防重复
    var host = document.querySelector(".sticky_layout") ||
               document.querySelector("#aside-content .card-widget") ||
               document.querySelector("#aside-content");
    if (!host) { markErr("找不到挂载点 sticky_layout / #aside-content（readyState=" + document.readyState + "）"); return; }
    host.insertBefore(buildCard(), host.firstChild);
    tick();
    loadWeather();
  }

  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  function tick() {
    var t = document.querySelector(".card-clock-own .own-time");
    var dt = document.querySelector(".card-clock-own .own-date");
    if (!t || !dt) return;
    var now = new Date();
    t.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    dt.textContent = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
                     " 星期" + WEEK[now.getDay()];
  }
  setInterval(tick, 1000);

  function renderWeather(box, data) {
    var cur = data.current || {};
    var w = wmo(cur.weather_code);
    var daily = data.daily || {};
    var html = '<div class="own-w-line">' +
               '<span class="own-w-emoji">' + w[0] + "</span>" +
               '<span class="own-w-temp">' + Math.round(cur.temperature_2m) + "°C</span>" +
               '<span class="own-w-desc">' + w[1] + "</span></div>";
    if (daily.time && daily.time.length) {
      html += '<div class="own-w-range">今天 ' + Math.round(daily.temperature_2m_min[0]) +
              "° ~ " + Math.round(daily.temperature_2m_max[0]) + "°</div>";
      if (daily.time.length > 1) {
        var days = "";
        for (var i = 1; i < daily.time.length && i < 3; i++) {
          var dw = wmo(daily.weather_code[i]);
          days += '<div class="own-w-day">' + daily.time[i].slice(5) + "<br>" + dw[0] + " " +
                  Math.round(daily.temperature_2m_min[i]) + "/" +
                  Math.round(daily.temperature_2m_max[i]) + "</div>";
        }
        if (days) html += '<div class="own-w-days">' + days + "</div>";
      }
    }
    box.innerHTML = html;
  }

  function loadWeather() {
    var box = document.querySelector(".card-clock-own .own-weather");
    if (!box) return;
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        var c = JSON.parse(raw);
        if (c && c.t && Date.now() - c.t < CACHE_TTL && c.d) { renderWeather(box, c.d); return; }
      }
    } catch (e) { /* 忽略缓存异常 */ }

    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + CITY.lat +
              "&longitude=" + CITY.lon +
              "&current=temperature_2m,weather_code" +
              "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
              "&timezone=Asia%2FShanghai&forecast_days=3";

    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.current) throw new Error("bad payload");
      renderWeather(box, d);
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: d })); } catch (e) {}
    }).catch(function () {
      box.innerHTML = '<div class="own-w-line"><span class="own-fail">天气暂时取不到（不影响时钟）</span></div>';
    });
  }

  // 首次加载 + pjax 切换后都尝试挂载
  function safeMount() {
    try { mount(); } catch (e) { markErr("异常: " + (e && e.message ? e.message : e)); }
  }
  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", safeMount);
    } else {
      safeMount();
    }
    document.addEventListener("pjax:complete", safeMount);
    window.addEventListener("load", safeMount);
  } catch (e) { markErr("初始化异常: " + (e && e.message ? e.message : e)); }
})();
