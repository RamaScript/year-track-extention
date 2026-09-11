/* ==========================================================================
   TIME // TRACKER — NEO-BRUTALIST TELEMETRY ENGINE
   ========================================================================== */

/*
|--------------------------------------------------------------------------
| Target Date (Locked for 2027)
|--------------------------------------------------------------------------
*/

const TARGET_DATE = new Date("2027-01-01T00:00:00");
localStorage.removeItem("brutalist_target_date");

/*
|--------------------------------------------------------------------------
| Brutalist Theme System (Acid <-> Onyx)
|--------------------------------------------------------------------------
*/

const THEME_KEY = "brutalist_theme";
const themeBtn = document.getElementById("theme-btn");
const themeBtnLabel = document.getElementById("theme-btn-label");

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || "acid";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  if (themeBtnLabel) {
    themeBtnLabel.textContent = `THEME: ${theme.toUpperCase()}`;
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "acid";
  const next = current === "acid" ? "onyx" : "acid";
  applyTheme(next);
}

if (themeBtn) {
  themeBtn.addEventListener("click", toggleTheme);
}
applyTheme(getStoredTheme());

/*
|--------------------------------------------------------------------------
| System Clock Telemetry
|--------------------------------------------------------------------------
*/

const systemClockEl = document.getElementById("system-clock");

function updateSystemClock() {
  if (!systemClockEl) return;
  const now = new Date();
  const utc = now.toTimeString().split(" ")[0];
  const offset = -now.getTimezoneOffset() / 60;
  const sign = offset >= 0 ? "+" : "-";
  const zoneStr = `UTC${sign}${Math.abs(offset)}`;
  systemClockEl.textContent = `${utc} [${zoneStr}]`;
}
setInterval(updateSystemClock, 1000);
updateSystemClock();

/*
|--------------------------------------------------------------------------
| Accurate Stepped Countdown Engine
|--------------------------------------------------------------------------
*/

const yearsEl = document.getElementById("years");
const monthsEl = document.getElementById("months");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const millisecondsEl = document.getElementById("milliseconds");

const lastValues = {};

function setValue(el, key, text) {
  if (lastValues[key] !== text) {
    lastValues[key] = text;
    el.textContent = text;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }
}

function updateCountdown() {
  const now = new Date();

  if (TARGET_DATE <= now) {
    setValue(yearsEl, "y", "0");
    setValue(monthsEl, "mo", "0");
    setValue(daysEl, "d", "0");
    setValue(hoursEl, "h", "00");
    setValue(minutesEl, "mi", "00");
    setValue(secondsEl, "s", "00");
    millisecondsEl.textContent = "000";
    return;
  }

  let temp = new Date(now);

  let years = 0;
  while (
    new Date(
      temp.getFullYear() + 1,
      temp.getMonth(),
      temp.getDate(),
      temp.getHours(),
      temp.getMinutes(),
      temp.getSeconds(),
      temp.getMilliseconds(),
    ) <= TARGET_DATE
  ) {
    years++;
    temp.setFullYear(temp.getFullYear() + 1);
  }

  let months = 0;
  while (
    new Date(
      temp.getFullYear(),
      temp.getMonth() + 1,
      temp.getDate(),
      temp.getHours(),
      temp.getMinutes(),
      temp.getSeconds(),
      temp.getMilliseconds(),
    ) <= TARGET_DATE
  ) {
    months++;
    temp.setMonth(temp.getMonth() + 1);
  }

  const diff = TARGET_DATE - temp;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const remainingAfterDays = diff % (1000 * 60 * 60 * 24);

  const hours = Math.floor(remainingAfterDays / (1000 * 60 * 60));
  const remainingAfterHours = remainingAfterDays % (1000 * 60 * 60);

  const minutes = Math.floor(remainingAfterHours / (1000 * 60));
  const remainingAfterMinutes = remainingAfterHours % (1000 * 60);

  const seconds = Math.floor(remainingAfterMinutes / 1000);
  const milliseconds = remainingAfterMinutes % 1000;

  setValue(yearsEl, "y", String(years));
  setValue(monthsEl, "mo", String(months));
  setValue(daysEl, "d", String(days));
  setValue(hoursEl, "h", String(hours).padStart(2, "0"));
  setValue(minutesEl, "mi", String(minutes).padStart(2, "0"));
  setValue(secondsEl, "s", String(seconds).padStart(2, "0"));

  millisecondsEl.textContent = String(milliseconds).padStart(3, "0");
}

setInterval(updateCountdown, 10);
updateCountdown();

/*
|--------------------------------------------------------------------------
| Week Wall — 52 Architectural Matrix Tiles
|--------------------------------------------------------------------------
*/

const wall = document.getElementById("week-wall");
const tooltip = document.getElementById("tile-tooltip");
const TILE_COUNT = 52;
const COLS = 13;
const ROWS = 4;
const QUARTER_LABELS = ["Q1 // JAN-MAR", "Q2 // APR-JUN", "Q3 // JUL-SEP", "Q4 // OCT-DEC"];
const DAY_MS = 24 * 60 * 60 * 1000;

const now = new Date();
const currentYear = now.getFullYear();

const yearStampEl = document.getElementById("current-year-stamp");
if (yearStampEl) {
  yearStampEl.textContent = `YEAR ${currentYear}`;
}

const startOfYear = new Date(currentYear, 0, 1);
const startOfNextYear = new Date(currentYear + 1, 0, 1);
const weekYearStart = new Date(startOfYear);
const daysSinceMonday = (weekYearStart.getDay() + 6) % 7;
weekYearStart.setDate(weekYearStart.getDate() - daysSinceMonday);

const totalYearMs = startOfNextYear - startOfYear;
const elapsedYearMs = now - startOfYear;
const yearPercent = Math.min(
  100,
  Math.max(0, (elapsedYearMs / totalYearMs) * 100),
);

const elapsedDays = Math.floor(
  (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
    Date.UTC(
      weekYearStart.getFullYear(),
      weekYearStart.getMonth(),
      weekYearStart.getDate(),
    )) /
    DAY_MS,
);
const currentWeekIndex = Math.min(TILE_COUNT - 1, Math.floor(elapsedDays / 7));

const weekStart = new Date(weekYearStart);
weekStart.setDate(weekStart.getDate() + currentWeekIndex * 7);

function currentWeekFraction() {
  const msIntoWeek = new Date() - weekStart;
  return Math.min(1, Math.max(0, msIntoWeek / (7 * DAY_MS)));
}

function currentDayOfWeekNumber() {
  const msIntoWeek = new Date() - weekStart;
  return Math.min(7, Math.floor(msIntoWeek / DAY_MS) + 1);
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function weekDateRange(i) {
  const start = new Date(weekYearStart);
  start.setDate(start.getDate() + i * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${dateFmt.format(start)} – ${dateFmt.format(end)}`;
}

let nowFillEl = null;
let nowTileEl = null;

if (wall) {
  wall.innerHTML = "";
  for (let row = 0; row < ROWS; row++) {
    const rowEl = document.createElement("div");
    rowEl.className = "wall-row";

    const label = document.createElement("span");
    label.className = "q-label";
    label.textContent = QUARTER_LABELS[row];
    rowEl.appendChild(label);

    for (let col = 0; col < COLS; col++) {
      const i = row * COLS + col;
      const tile = document.createElement("div");
      tile.className = "tile";
      const weekNum = i + 1;
      const range = weekDateRange(i);

      if (i < currentWeekIndex) {
        tile.classList.add("spent");
        tile.dataset.tip = `[WK ${weekNum}] ${range} // EXPIRED`;
      } else if (i === currentWeekIndex) {
        tile.classList.add("open", "now");

        const fill = document.createElement("div");
        fill.className = "tile-now-fill";
        fill.style.height = `${currentWeekFraction() * 100}%`;
        tile.appendChild(fill);
        nowFillEl = fill;
        nowTileEl = tile;

        tile.dataset.tip = `[WK ${weekNum} · LIVE] ${range} // DAY ${currentDayOfWeekNumber()}/7`;
      } else {
        tile.classList.add("open");
        tile.dataset.tip = `[WK ${weekNum}] ${range} // UNLOCKED`;
      }

      tile.addEventListener("mouseenter", () => {
        if (!tooltip) return;
        tooltip.textContent = tile.dataset.tip;
        tooltip.classList.add("visible");
      });
      tile.addEventListener("mousemove", (e) => {
        if (!tooltip) return;
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY - 10}px`;
      });
      tile.addEventListener("mouseleave", () => {
        if (!tooltip) return;
        tooltip.classList.remove("visible");
      });

      rowEl.appendChild(tile);
    }

    wall.appendChild(rowEl);
  }
}

// Keep active week progress updated in real time
setInterval(() => {
  if (!nowFillEl || !nowTileEl) return;
  nowFillEl.style.height = `${currentWeekFraction() * 100}%`;
  const weekNum = currentWeekIndex + 1;
  nowTileEl.dataset.tip = `[WK ${weekNum} · LIVE] ${weekDateRange(currentWeekIndex)} // DAY ${currentDayOfWeekNumber()}/7`;
}, 60000);

/*
|--------------------------------------------------------------------------
| Count-Up Metric Animations
|--------------------------------------------------------------------------
*/

function countUp(el, target, duration = 800) {
  if (!el) return;
  const start = performance.now();
  function frame(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = String(Math.round(eased * target));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

countUp(document.getElementById("weeks-gone"), currentWeekIndex);
countUp(
  document.getElementById("weeks-left"),
  Math.max(0, TILE_COUNT - currentWeekIndex - 1),
  800,
);

/*
|--------------------------------------------------------------------------
| Progress Section — Industrial Telemetry & ASCII Bar
|--------------------------------------------------------------------------
*/

const progressFill = document.getElementById("progress-fill");
const progressMarker = document.getElementById("progress-marker");
const progressLabel = document.getElementById("progress-label");
const progressPct = document.getElementById("progress-pct");
const progressAscii = document.getElementById("progress-ascii");

function generateAsciiBar(percent, totalBlocks = 20) {
  const filledCount = Math.round((percent / 100) * totalBlocks);
  const filled = "█".repeat(Math.max(0, Math.min(totalBlocks, filledCount)));
  const empty = "░".repeat(Math.max(0, totalBlocks - filledCount));
  return `[${filled}${empty}]`;
}

if (progressFill) progressFill.style.width = `${yearPercent}%`;
if (progressMarker) progressMarker.style.left = `${yearPercent}%`;
if (progressPct) progressPct.textContent = `${yearPercent.toFixed(1)}%`;
if (progressAscii) progressAscii.textContent = generateAsciiBar(yearPercent, 20);
if (progressLabel) {
  progressLabel.textContent = `${yearPercent.toFixed(1)}% ELAPSED`;
}

