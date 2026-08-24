/*
|--------------------------------------------------------------------------
| CHANGE THIS DATE
|--------------------------------------------------------------------------
*/

const TARGET_DATE = new Date("2027-01-01T00:00:00");

/*
|--------------------------------------------------------------------------
| Countdown (unchanged logic — accurate calendar year/month stepping)
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
| Week Wall — 52 tiles, one per week of the calendar year.
| Weeks already gone render dark/flat. Weeks still open glow, brightening
| toward "today", which pulses. This is the year, made visible.
|--------------------------------------------------------------------------
*/

const wall = document.getElementById("week-wall");
const tooltip = document.getElementById("tile-tooltip");
const TILE_COUNT = 52;
const COLS = 13;
const ROWS = 4;
const QUARTER_LABELS = ["Q1", "Q2", "Q3", "Q4"];
const DAY_MS = 24 * 60 * 60 * 1000;

const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 1);
const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);
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

// gradient stops the "open" weeks sweep through as they approach today
const fluxStops = ["#3b5bfd", "#5f4bf5", "#8b5cf6", "#5b7ff0", "#22d3b8"];
const dateFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function lerpColor(hexA, hexB, t) {
  const a = hexA.match(/\w\w/g).map((x) => parseInt(x, 16));
  const b = hexB.match(/\w\w/g).map((x) => parseInt(x, 16));
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function weekDateRange(i) {
  const start = new Date(weekYearStart);
  start.setDate(start.getDate() + i * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${dateFmt.format(start)} – ${dateFmt.format(end)}`;
}

let nowFillEl = null;
let nowTileEl = null;

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

    // diagonal-wave reveal on load
    tile.style.setProperty("--reveal-delay", `${(row + col) * 0.028}s`);

    if (i < currentWeekIndex) {
      tile.classList.add("spent");
      tile.dataset.tip = `Week ${weekNum} · ${range} · gone`;
    } else if (i === currentWeekIndex) {
      tile.classList.add("open", "now");
      tile.style.setProperty("--tile-c1", "#ffb37a");
      tile.style.setProperty("--tile-c2", "#ff8a5c");
      tile.style.setProperty("--tile-op", "0.95");

      // day-by-day fill: the passed portion of THIS week goes dark,
      // same color language as the rest of the wall — the week fills
      // up in real time instead of just flipping states on Monday
      const fill = document.createElement("div");
      fill.className = "tile-now-fill";
      fill.style.height = `${currentWeekFraction() * 100}%`;
      tile.appendChild(fill);
      nowFillEl = fill;
      nowTileEl = tile;

      tile.dataset.tip = `Week ${weekNum} · ${range} · day ${currentDayOfWeekNumber()} of 7`;
    } else {
      tile.classList.add("open");
      const distance =
        (i - currentWeekIndex) / (TILE_COUNT - currentWeekIndex || 1);
      const t = 1 - distance;
      const c1 = lerpColor(
        fluxStops[i % fluxStops.length],
        "#ffffff",
        t * 0.25,
      );
      const c2 = lerpColor(
        fluxStops[(i + 2) % fluxStops.length],
        "#22d3b8",
        0.4 + t * 0.3,
      );
      tile.style.setProperty("--tile-c1", c1);
      tile.style.setProperty("--tile-c2", c2);
      tile.style.setProperty("--tile-op", String(0.65 + t * 0.3));
      tile.style.setProperty("--tile-dur", `${5 + Math.random() * 4}s`);
      tile.style.setProperty("--tile-delay", `${Math.random() * 4}s`);
      tile.dataset.tip = `Week ${weekNum} · ${range} · still ahead`;
    }

    tile.addEventListener("mouseenter", () => {
      tooltip.textContent = tile.dataset.tip;
      tooltip.classList.add("visible");
    });
    tile.addEventListener("mousemove", (e) => {
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY - 14}px`;
    });
    tile.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });

    rowEl.appendChild(tile);
  }

  wall.appendChild(rowEl);
}

// keep the current week's fill (and its tooltip) accurate as the day rolls on,
// without needing a page reload
setInterval(() => {
  if (!nowFillEl || !nowTileEl) return;
  nowFillEl.style.height = `${currentWeekFraction() * 100}%`;
  const weekNum = currentWeekIndex + 1;
  nowTileEl.dataset.tip = `Week ${weekNum} · ${weekDateRange(currentWeekIndex)} · day ${currentDayOfWeekNumber()} of 7`;
}, 60000);

/*
|--------------------------------------------------------------------------
| Count-up animation for the headline numbers
|--------------------------------------------------------------------------
*/

function countUp(el, target, duration = 900, suffix = "") {
  const start = performance.now();
  function frame(t) {
    const p = Math.min(1, (t - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

countUp(document.getElementById("weeks-gone"), currentWeekIndex);
countUp(
  document.getElementById("weeks-left"),
  TILE_COUNT - currentWeekIndex - 1,
  900,
);

/*
|--------------------------------------------------------------------------
| Progress row — % of the year already gone
|--------------------------------------------------------------------------
*/

const progressFill = document.getElementById("progress-fill");
const progressMarker = document.getElementById("progress-marker");
const progressLabel = document.getElementById("progress-label");

progressFill.style.width = `${yearPercent}%`;
progressMarker.style.left = `${yearPercent}%`;
progressLabel.textContent = `${yearPercent.toFixed(1)}% of ${now.getFullYear()} gone — ${currentWeekIndex} of ${TILE_COUNT} weeks`;

/*
|--------------------------------------------------------------------------
| Sparks — small drifting motes, colored from the flux palette
|--------------------------------------------------------------------------
*/

const sparkField = document.getElementById("spark-field");
const MAX_SPARKS = 20;
const SPARK_COLORS = ["#3b5bfd", "#8b5cf6", "#22d3b8", "#ffb37a"];

function spawnSpark() {
  if (sparkField.childElementCount >= MAX_SPARKS) return;

  const spark = document.createElement("div");
  spark.className = "spark";

  const size = 2 + Math.random() * 3;
  const duration = 8 + Math.random() * 6;
  const drift = -40 + Math.random() * 80;
  const left = Math.random() * 100;
  const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

  spark.style.setProperty("--s", `${size}px`);
  spark.style.setProperty("--dur", `${duration}s`);
  spark.style.setProperty("--drift", `${drift}px`);
  spark.style.setProperty("--sc", color);
  spark.style.left = `${left}%`;

  sparkField.appendChild(spark);
  setTimeout(() => spark.remove(), duration * 1000 + 200);
}

for (let i = 0; i < 12; i++) {
  setTimeout(spawnSpark, i * 350);
}
setInterval(spawnSpark, 600);

/*
|--------------------------------------------------------------------------
| Cursor glow + Week Wall parallax
|--------------------------------------------------------------------------
*/

const cursorGlow = document.getElementById("cursor-glow");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

document.addEventListener("mousemove", (e) => {
  cursorGlow.classList.add("active");
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;

  if (!prefersReducedMotion) {
    const xRatio = e.clientX / window.innerWidth - 0.5;
    const yRatio = e.clientY / window.innerHeight - 0.5;
    wall.style.transform = `scale(1.04) translate(${xRatio * -14}px, ${yRatio * -10}px)`;
  }
});

document.addEventListener("mouseleave", () => {
  cursorGlow.classList.remove("active");
  wall.style.transform = "scale(1.04) translate(0, 0)";
});
