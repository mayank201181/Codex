const els = {
  historyYears: document.querySelector("#historyYears"),
  method: document.querySelector("#method"),
  windowDays: document.querySelector("#windowDays"),
  minWinRate: document.querySelector("#minWinRate"),
  authScreen: document.querySelector("#authScreen"),
  passwordForm: document.querySelector("#passwordForm"),
  passwordInput: document.querySelector("#passwordInput"),
  authMessage: document.querySelector("#authMessage"),
  codeAccess: document.querySelector("#codeAccess"),
  requesterInput: document.querySelector("#requesterInput"),
  requestCodeBtn: document.querySelector("#requestCodeBtn"),
  codeLabel: document.querySelector("#codeLabel"),
  codeInput: document.querySelector("#codeInput"),
  verifyCodeBtn: document.querySelector("#verifyCodeBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  refreshBtn: document.querySelector("#refreshBtn"),
  statusText: document.querySelector("#statusText"),
  coverageText: document.querySelector("#coverageText"),
  pairCount: document.querySelector("#pairCount"),
  bullCount: document.querySelector("#bullCount"),
  bearCount: document.querySelector("#bearCount"),
  bestCurrency: document.querySelector("#bestCurrency"),
  bullishSub: document.querySelector("#bullishSub"),
  bearishSub: document.querySelector("#bearishSub"),
  bullishTable: document.querySelector("#bullishTable"),
  bearishTable: document.querySelector("#bearishTable"),
  currencyBars: document.querySelector("#currencyBars"),
  heatmap: document.querySelector("#heatmap"),
  chartPair: document.querySelector("#chartPair"),
  pathChart: document.querySelector("#pathChart"),
  pairPicker: document.querySelector("#pairPicker"),
};

const METHOD_LABELS = {
  dayOfYear: "day-of-year",
  weekOfYear: "week-of-year",
  monthOfYear: "month",
  dayOfMonth: "day-of-month",
  dayOfWeek: "day-of-week",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const state = {
  allPairs: [],
  selectedPairs: new Set(),
  history: {},
  errors: {},
  loading: false,
  requestId: "",
};

boot();

async function boot() {
  bindAuthEvents();
  const status = await getAuthStatus();
  updateAuthUi(status);
  if (!status.authenticated) return;
  await initDashboard();
}

async function initDashboard() {
  const pairResponse = await fetch("/api/pairs");
  if (pairResponse.status === 401) return showAuthScreen("Please log in again.");
  const pairData = await pairResponse.json();
  state.allPairs = pairData.pairs;
  state.selectedPairs = new Set(state.allPairs);
  renderPairPicker();
  await loadHistory();
  bindEvents();
}

function bindAuthEvents() {
  els.passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await passwordLogin();
  });

  els.requestCodeBtn.addEventListener("click", requestAccessCode);
  els.verifyCodeBtn.addEventListener("click", verifyAccessCode);
  els.logoutBtn.addEventListener("click", logout);
}

function bindEvents() {
  for (const el of [els.historyYears, els.method, els.windowDays, els.minWinRate]) {
    el.addEventListener("change", async () => {
      if (el === els.historyYears) await loadHistory();
      render();
    });
  }

  els.refreshBtn.addEventListener("click", () => loadHistory(true));
  els.chartPair.addEventListener("change", renderPathChart);
}

async function getAuthStatus() {
  const response = await fetch("/api/auth/status");
  return response.json();
}

async function passwordLogin() {
  setAuthMessage("Checking password...");
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: els.passwordInput.value }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return setAuthMessage(payload.error || "Could not log in.");

  hideAuthScreen();
  await initDashboard();
}

async function requestAccessCode() {
  setAuthMessage("Requesting code...");
  const response = await fetch("/api/auth/request-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requester: els.requesterInput.value }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return setAuthMessage(payload.error || "Could not request a code.");

  state.requestId = payload.requestId;
  els.codeLabel.hidden = false;
  els.verifyCodeBtn.hidden = false;
  setAuthMessage(`A code was emailed to the owner. It expires in ${payload.expiresMinutes} minutes.`);
}

async function verifyAccessCode() {
  setAuthMessage("Verifying code...");
  const response = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: state.requestId, code: els.codeInput.value }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return setAuthMessage(payload.error || "Could not verify code.");

  hideAuthScreen();
  await initDashboard();
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  state.history = {};
  state.allPairs = [];
  state.selectedPairs = new Set();
  showAuthScreen("Dashboard locked.");
}

function updateAuthUi(status) {
  els.codeAccess.hidden = !status.codeEnabled;
  if (status.authenticated) hideAuthScreen();
  else showAuthScreen();
}

function showAuthScreen(message = "") {
  els.authScreen.hidden = false;
  document.body.classList.add("is-locked");
  setAuthMessage(message);
  els.passwordInput.focus();
}

function hideAuthScreen() {
  els.authScreen.hidden = true;
  document.body.classList.remove("is-locked");
  setAuthMessage("");
}

function setAuthMessage(message) {
  els.authMessage.textContent = message;
}

async function loadHistory(refresh = false) {
  if (state.loading) return;
  state.loading = true;
  const years = Number(els.historyYears.value);
  const pairs = [...state.selectedPairs];
  els.statusText.textContent = `Loading ${pairs.length} FX pairs from EODHD...`;
  els.refreshBtn.disabled = true;

  try {
    const url = `/api/history?years=${years}&pairs=${pairs.join(",")}${refresh ? "&refresh=1" : ""}`;
    const response = await fetch(url);
    if (response.status === 401) return showAuthScreen("Please log in again.");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not load data");
    state.history = payload.pairs || {};
    state.errors = payload.errors || {};
    els.statusText.textContent = `Data loaded at ${new Date(payload.fetchedAt).toLocaleString()}`;
    els.coverageText.textContent = `${payload.from} to ${payload.to}`;
    renderChartPairSelect();
    render();
  } catch (error) {
    els.statusText.textContent = error.message;
  } finally {
    state.loading = false;
    els.refreshBtn.disabled = false;
  }
}

function render() {
  const analysis = analyzeAll();
  const bullish = analysis.signals
    .filter((row) => row.direction === "bullish")
    .sort(sortSignals)
    .slice(0, 20);
  const bearish = analysis.signals
    .filter((row) => row.direction === "bearish")
    .sort(sortSignals)
    .slice(0, 20);

  els.pairCount.textContent = Object.keys(state.history).length;
  els.bullCount.textContent = analysis.signals.filter((row) => row.direction === "bullish").length;
  els.bearCount.textContent = analysis.signals.filter((row) => row.direction === "bearish").length;
  els.bestCurrency.textContent = analysis.currencyScores[0]?.currency || "-";
  els.bullishSub.textContent = `${METHOD_LABELS[els.method.value]}, next ${els.windowDays.value} trading days`;
  els.bearishSub.textContent = els.bullishSub.textContent;

  renderTable(els.bullishTable, bullish);
  renderTable(els.bearishTable, bearish);
  renderCurrencyBars(analysis.currencyScores);
  renderHeatmap();
  renderPathChart();
}

function analyzeAll() {
  const method = els.method.value;
  const windowDays = Number(els.windowDays.value);
  const minWinRate = Number(els.minWinRate.value);
  const asOf = latestCommonDate();
  const signals = [];

  for (const [pair, rows] of Object.entries(state.history)) {
    const stats = getSeasonalStats(rows, pair, method, windowDays, asOf);
    if (!stats || stats.samples < 3) continue;

    if (stats.bullWinRate >= minWinRate) {
      signals.push({ ...stats, direction: "bullish", winRate: stats.bullWinRate, displayAvg: stats.avgReturn });
    }
    if (stats.bearWinRate >= minWinRate) {
      signals.push({ ...stats, direction: "bearish", winRate: stats.bearWinRate, displayAvg: -stats.avgReturn });
    }
  }

  return {
    signals,
    currencyScores: aggregateCurrencies(signals),
  };
}

function getSeasonalStats(rows, pair, method, windowDays, asOf) {
  const latest = asOf ? parseDate(`${asOf}T00:00:00Z`) : new Date();
  const filtered = rows.filter((row) => parseDate(`${row.date}T00:00:00Z`) <= latest);
  const historyYears = Number(els.historyYears.value);
  const cutoff = new Date(Date.UTC(latest.getUTCFullYear() - historyYears, latest.getUTCMonth(), latest.getUTCDate()));
  const targetKey = bucketKey(latest, method);
  const returns = [];

  for (let i = 0; i < filtered.length - windowDays; i++) {
    const start = parseDate(`${filtered[i].date}T00:00:00Z`);
    if (start < cutoff) continue;
    if (start.getUTCFullYear() === latest.getUTCFullYear() && start >= new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth(), latest.getUTCDate()))) continue;
    if (bucketKey(start, method) !== targetKey) continue;
    const ret = filtered[i + windowDays].close / filtered[i].close - 1;
    if (Number.isFinite(ret)) {
      returns.push({
        date: filtered[i].date,
        return: ret,
      });
    }
  }

  if (!returns.length) return null;

  const values = returns.map((row) => row.return);
  const positives = values.filter((value) => value > 0).length;
  const negatives = values.filter((value) => value < 0).length;
  const avgReturn = mean(values);

  return {
    pair,
    samples: values.length,
    avgReturn,
    bullWinRate: positives / values.length,
    bearWinRate: negatives / values.length,
    best: Math.max(...values),
    worst: Math.min(...values),
    sampleReturns: returns,
  };
}

function aggregateCurrencies(signals) {
  const scores = new Map();

  for (const signal of signals) {
    const [base, quote] = splitPair(signal.pair);
    const signed = signal.direction === "bullish" ? 1 : -1;
    const weight = (signal.winRate - 0.5) * Math.max(1, signal.samples) * signed;
    addScore(scores, base, weight);
    addScore(scores, quote, -weight);
  }

  return [...scores.entries()]
    .map(([currency, score]) => ({ currency, score }))
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}

function addScore(scores, currency, delta) {
  scores.set(currency, (scores.get(currency) || 0) + delta);
}

function renderTable(tbody, rows) {
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">No pairs meet the win-rate filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map((row) => `
      <tr>
        <td class="pair-cell">${row.pair}</td>
        <td>${pct(row.winRate, 0)}</td>
        <td class="${row.avgReturn >= 0 ? "positive" : "negative"}">${pct(row.avgReturn, 2)}</td>
        <td>${row.samples}</td>
        <td><span class="positive">${pct(row.best, 2)}</span> / <span class="negative">${pct(row.worst, 2)}</span></td>
      </tr>
    `)
    .join("");
}

function renderCurrencyBars(scores) {
  if (!scores.length) {
    els.currencyBars.innerHTML = `<div class="empty">No qualifying currency signals yet.</div>`;
    return;
  }
  const max = Math.max(...scores.map((row) => Math.abs(row.score))) || 1;
  els.currencyBars.innerHTML = scores.slice(0, 16).map((row) => {
    const width = Math.max(3, Math.abs(row.score) / max * 50);
    const cls = row.score >= 0 ? "positive" : "negative";
    return `
      <div class="bar-row">
        <div class="bar-label">${row.currency}</div>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${width}%"></div></div>
        <div class="${cls}">${row.score >= 0 ? "Strong" : "Weak"}</div>
      </div>
    `;
  }).join("");
}

function renderHeatmap() {
  const pairs = Object.keys(state.history).slice(0, 18);
  const windowDays = Number(els.windowDays.value);
  let html = `<div class="heatmap-cell heatmap-head">Pair</div>`;
  html += MONTHS.map((month) => `<div class="heatmap-cell heatmap-head">${month}</div>`).join("");

  for (const pair of pairs) {
    html += `<div class="heatmap-cell heatmap-head">${pair}</div>`;
    for (let month = 0; month < 12; month++) {
      const avg = averageForwardReturnByMonth(state.history[pair], month, windowDays);
      html += `<div class="heatmap-cell" style="${heatColor(avg)}">${Number.isFinite(avg) ? pct(avg, 1) : "-"}</div>`;
    }
  }
  els.heatmap.innerHTML = html;
}

function averageForwardReturnByMonth(rows, month, windowDays) {
  if (!rows) return NaN;
  const values = [];
  for (let i = 0; i < rows.length - windowDays; i++) {
    const date = parseDate(`${rows[i].date}T00:00:00Z`);
    if (date.getUTCMonth() !== month) continue;
    values.push(rows[i + windowDays].close / rows[i].close - 1);
  }
  return mean(values);
}

function renderPathChart() {
  const pair = els.chartPair.value || Object.keys(state.history)[0];
  const rows = state.history[pair];
  if (!rows?.length) return clearChart();

  const ctx = els.pathChart.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = els.pathChart.clientWidth;
  const height = 360;
  els.pathChart.width = width * dpr;
  els.pathChart.height = height * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const latestDate = parseDate(`${rows[rows.length - 1].date}T00:00:00Z`);
  const paths = seasonalPaths(rows, latestDate, 20, 30).slice(-10);
  if (!paths.length) {
    drawText(ctx, "Not enough history for the selected pair.", 20, 40);
    return;
  }

  const allValues = paths.flatMap((path) => path.values);
  const min = Math.min(...allValues, -0.01);
  const max = Math.max(...allValues, 0.01);
  const pad = 28;

  drawAxis(ctx, width, height, pad);

  paths.forEach((path, index) => {
    ctx.beginPath();
    ctx.strokeStyle = index === paths.length - 1 ? "#126c5a" : "rgba(49, 93, 140, 0.26)";
    ctx.lineWidth = index === paths.length - 1 ? 3 : 1.5;
    path.values.forEach((value, i) => {
      const x = pad + (i / (path.values.length - 1)) * (width - pad * 2);
      const y = height - pad - ((value - min) / (max - min)) * (height - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  drawText(ctx, `${pair}: historical paths around today's trading-date area`, pad, 18);
  drawText(ctx, `${pct(max, 1)}`, width - 62, pad + 4);
  drawText(ctx, `${pct(min, 1)}`, width - 62, height - pad);
}

function seasonalPaths(rows, targetDate, backDays, forwardDays) {
  const targetKey = bucketKey(targetDate, "dayOfYear");
  const paths = [];
  for (let i = backDays; i < rows.length - forwardDays; i++) {
    const date = parseDate(`${rows[i].date}T00:00:00Z`);
    if (bucketKey(date, "dayOfYear") !== targetKey) continue;
    const base = rows[i].close;
    const values = [];
    for (let offset = -backDays; offset <= forwardDays; offset++) {
      values.push(rows[i + offset].close / base - 1);
    }
    paths.push({ year: date.getUTCFullYear(), values });
  }
  return paths;
}

function clearChart() {
  const ctx = els.pathChart.getContext("2d");
  ctx.clearRect(0, 0, els.pathChart.width, els.pathChart.height);
}

function drawAxis(ctx, width, height, pad) {
  ctx.strokeStyle = "#d7d3ca";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, height / 2);
  ctx.lineTo(width - pad, height / 2);
  ctx.stroke();
}

function drawText(ctx, text, x, y) {
  ctx.fillStyle = "#63707a";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText(text, x, y);
}

function renderPairPicker() {
  els.pairPicker.innerHTML = state.allPairs.map((pair) => `
    <label>
      <input type="checkbox" value="${pair}" ${state.selectedPairs.has(pair) ? "checked" : ""} />
      ${pair}
    </label>
  `).join("");

  els.pairPicker.addEventListener("change", async (event) => {
    const input = event.target;
    if (input.tagName !== "INPUT") return;
    if (input.checked) state.selectedPairs.add(input.value);
    else state.selectedPairs.delete(input.value);
    await loadHistory();
  });
}

function renderChartPairSelect() {
  const pairs = Object.keys(state.history);
  els.chartPair.innerHTML = pairs.map((pair) => `<option value="${pair}">${pair}</option>`).join("");
}

function latestCommonDate() {
  const dates = Object.values(state.history)
    .map((rows) => rows?.[rows.length - 1]?.date)
    .filter(Boolean)
    .sort();
  return dates[dates.length - 1] || null;
}

function bucketKey(date, method) {
  if (method === "monthOfYear") return String(date.getUTCMonth() + 1);
  if (method === "dayOfMonth") return String(date.getUTCDate());
  if (method === "dayOfWeek") return String(date.getUTCDay());
  if (method === "weekOfYear") return String(isoWeek(date));
  return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

function isoWeek(date) {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy - yearStart) / 86400000) + 1) / 7);
}

function splitPair(pair) {
  return [pair.slice(0, 3), pair.slice(3, 6)];
}

function sortSignals(a, b) {
  return b.winRate - a.winRate || Math.abs(b.avgReturn) - Math.abs(a.avgReturn) || b.samples - a.samples;
}

function mean(values) {
  if (!values?.length) return NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function pct(value, decimals = 1) {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(decimals)}%`;
}

function parseDate(value) {
  return new Date(value);
}

function heatColor(value) {
  if (!Number.isFinite(value)) return "";
  const strength = Math.min(0.86, Math.abs(value) * 50);
  if (value >= 0) return `background: rgba(19,121,91,${strength}); color: ${strength > 0.45 ? "white" : "#15191d"}`;
  return `background: rgba(163,59,59,${strength}); color: ${strength > 0.45 ? "white" : "#15191d"}`;
}
