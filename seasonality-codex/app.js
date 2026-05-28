const state = {
  data: null,
  mode: "raw",
  selectedYear: "all",
  selectedPair: "EURUSD",
};

const els = {
  dataStamp: document.querySelector("#dataStamp"),
  yearSelect: document.querySelector("#yearSelect"),
  pairSelect: document.querySelector("#pairSelect"),
  rawMode: document.querySelector("#rawMode"),
  usdMode: document.querySelector("#usdMode"),
  modeLabel: document.querySelector("#modeLabel"),
  previewReturn: document.querySelector("#previewReturn"),
  previewLabel: document.querySelector("#previewLabel"),
  topFullCorr: document.querySelector("#topFullCorr"),
  topFullCorrLabel: document.querySelector("#topFullCorrLabel"),
  topYearCorr: document.querySelector("#topYearCorr"),
  topYearCorrLabel: document.querySelector("#topYearCorrLabel"),
  latestMonth: document.querySelector("#latestMonth"),
  latestMonthLabel: document.querySelector("#latestMonthLabel"),
  yearCorrHeader: document.querySelector("#yearCorrHeader"),
  correlationBody: document.querySelector("#correlationBody"),
  scatterTitle: document.querySelector("#scatterTitle"),
  sampleCount: document.querySelector("#sampleCount"),
  scatterChart: document.querySelector("#scatterChart"),
  matrixTitle: document.querySelector("#matrixTitle"),
  matrixHead: document.querySelector("#matrixHead"),
  matrixBody: document.querySelector("#matrixBody"),
  downloadCsv: document.querySelector("#downloadCsv"),
};

const palette = ["#0f8a7d", "#2457a6", "#b93838", "#a66a00", "#6652a3", "#26736d", "#8b4b72"];

boot().catch((error) => {
  els.dataStamp.textContent = error.message;
  document.body.classList.add("load-error");
});

async function boot() {
  const response = await fetch("./data/seasonality.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load seasonality data: ${response.status}`);
  }
  state.data = await response.json();
  state.selectedPair = state.data.meta.pairs[0].symbol;
  state.selectedYear = latestCompleteYear();
  bindControls();
  render();
}

function bindControls() {
  const years = [...new Set(state.data.rows.map((row) => row.month.slice(0, 4)))].reverse();
  els.yearSelect.innerHTML = [
    `<option value="all">All 5y</option>`,
    ...years.map((year) => `<option value="${year}">${year}</option>`),
  ].join("");
  els.yearSelect.value = state.selectedYear;

  els.pairSelect.innerHTML = state.data.meta.pairs
    .map((pair) => `<option value="${pair.symbol}">${pair.symbol}</option>`)
    .join("");
  els.pairSelect.value = state.selectedPair;

  els.yearSelect.addEventListener("change", () => {
    state.selectedYear = els.yearSelect.value;
    render();
  });
  els.pairSelect.addEventListener("change", () => {
    state.selectedPair = els.pairSelect.value;
    render();
  });
  els.rawMode.addEventListener("click", () => setMode("raw"));
  els.usdMode.addEventListener("click", () => setMode("usd"));
  els.downloadCsv.addEventListener("click", downloadCsv);
}

function setMode(mode) {
  state.mode = mode;
  els.rawMode.classList.toggle("active", mode === "raw");
  els.usdMode.classList.toggle("active", mode === "usd");
  render();
}

function render() {
  const rows = visibleRows();
  const allRows = state.data.rows;
  const pairs = state.data.meta.pairs.map((pair) => pair.symbol);
  const stats = pairs.map((pair, index) => pairStats(pair, allRows, rows, index));

  renderHeader();
  renderSummary(stats, rows);
  renderCorrelationTable(stats);
  renderScatter(rows);
  renderMatrix(rows);
}

function renderHeader() {
  const meta = state.data.meta;
  const generated = new Date(meta.generatedAt);
  els.dataStamp.textContent = `Generated ${generated.toLocaleString()} from ${meta.source}. Completed sample through ${meta.completedThrough}; latest S&P close ${formatNumber(meta.latestSpxClose, 2)} on ${formatDate(meta.latestSpxDate)}.`;
  els.modeLabel.textContent = state.mode === "raw" ? "Raw pair return" : "USD-normalized return";
  els.yearCorrHeader.textContent = `${state.selectedYear === "all" ? "All" : state.selectedYear} r`;
  els.matrixTitle.textContent = state.selectedYear === "all" ? "Last five years" : `${state.selectedYear} observations`;
}

function renderSummary(stats, rows) {
  const topFull = byAbs(stats, "fullCorr")[0];
  const topYear = byAbs(stats, "windowCorr")[0];
  const latest = state.data.rows[state.data.rows.length - 1];
  const preview = state.data.preview;

  if (preview) {
    els.previewReturn.textContent = formatPct(preview.spxMonthlyReturnPct);
    els.previewLabel.textContent = `${preview.month} through ${formatDate(state.data.meta.latestSpxDate)}; expected final trading date ${formatDate(state.data.meta.currentMonthExpectedFinalTradingDate)}`;
  } else {
    els.previewReturn.textContent = "--";
    els.previewLabel.textContent = "No current-month preview in the snapshot";
  }

  els.topFullCorr.textContent = topFull ? `${topFull.pair} ${formatCorr(topFull.fullCorr)}` : "--";
  els.topFullCorrLabel.textContent = `${state.data.meta.observationCount} completed month-ends, ${state.mode === "raw" ? "raw pair" : "USD strength"} view`;

  els.topYearCorr.textContent = topYear ? `${topYear.pair} ${formatCorr(topYear.windowCorr)}` : "--";
  els.topYearCorrLabel.textContent = `${state.selectedYear === "all" ? "All 5y" : state.selectedYear}, n=${rows.length}`;

  els.latestMonth.textContent = `${latest.month} ${formatPct(latest.spxMonthlyReturnPct)}`;
  els.latestMonthLabel.textContent = `Last S&P month-end close: ${formatDate(latest.monthEnd)}`;
}

function renderCorrelationTable(stats) {
  els.correlationBody.innerHTML = stats
    .sort((a, b) => Math.abs(b.fullCorr || 0) - Math.abs(a.fullCorr || 0))
    .map((item) => {
      const fullClass = signClass(item.fullCorr);
      const yearClass = signClass(item.windowCorr);
      return `
        <tr>
          <td>
            <span class="pair-name">
              <span class="dot" style="background:${item.color}"></span>${item.pair}
            </span>
          </td>
          <td class="corr-cell ${fullClass}">
            <span class="corr-value">${formatCorr(item.fullCorr)}</span>${corrBar(item.fullCorr)}
          </td>
          <td class="corr-cell ${yearClass}">
            <span class="corr-value">${formatCorr(item.windowCorr)}</span>${corrBar(item.windowCorr)}
          </td>
          <td>${formatBeta(item.beta)}</td>
          <td class="${signClass(item.avgWhenSpxUp)}">${formatPct(item.avgWhenSpxUp)}</td>
          <td class="read-cell">${relationshipText(item)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderScatter(rows) {
  const pair = state.selectedPair;
  const points = rows
    .map((row) => ({
      month: row.month,
      x: row.spxMonthlyReturnPct,
      y: fxReturn(row, pair),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  const stats = regression(points.map((point) => point.x), points.map((point) => point.y));
  els.scatterTitle.textContent = `${pair}: ${state.mode === "raw" ? "raw return" : "USD strength"}`;
  els.sampleCount.textContent = `n=${points.length}`;
  els.scatterChart.innerHTML = scatterSvg(points, stats);
}

function renderMatrix(rows) {
  const pairs = state.data.meta.pairs.map((pair) => pair.symbol);
  els.matrixHead.innerHTML = `
    <tr>
      <th>Month</th>
      <th>S&P month</th>
      <th>S&P day</th>
      ${pairs.map((pair) => `<th>${pair}</th>`).join("")}
    </tr>
  `;
  els.matrixBody.innerHTML = rows
    .slice()
    .reverse()
    .map((row) => `
      <tr>
        <td class="month-cell">${row.month}</td>
        <td class="${signClass(row.spxMonthlyReturnPct)}">${formatPct(row.spxMonthlyReturnPct)}</td>
        <td class="${signClass(row.spxLastDayReturnPct)}">${formatPct(row.spxLastDayReturnPct)}</td>
        ${pairs.map((pair) => heatCell(fxReturn(row, pair))).join("")}
      </tr>
    `)
    .join("");
}

function pairStats(pair, allRows, rows, index) {
  const fullPoints = paired(allRows, pair);
  const windowPoints = paired(rows, pair);
  const upPoints = windowPoints.filter((point) => point.x > 0);
  const downPoints = windowPoints.filter((point) => point.x < 0);
  const reg = regression(fullPoints.map((point) => point.x), fullPoints.map((point) => point.y));
  return {
    pair,
    color: palette[index % palette.length],
    fullCorr: pearson(fullPoints.map((point) => point.x), fullPoints.map((point) => point.y)),
    windowCorr: pearson(windowPoints.map((point) => point.x), windowPoints.map((point) => point.y)),
    beta: reg.slope,
    avgWhenSpxUp: mean(upPoints.map((point) => point.y)),
    avgWhenSpxDown: mean(downPoints.map((point) => point.y)),
    sample: windowPoints.length,
  };
}

function paired(rows, pair) {
  return rows
    .map((row) => ({ x: row.spxMonthlyReturnPct, y: fxReturn(row, pair) }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function fxReturn(row, pair) {
  const payload = row.fx[pair];
  if (!payload) return null;
  return state.mode === "usd" ? payload.usdReturnPct : payload.returnPct;
}

function visibleRows() {
  if (state.selectedYear === "all") return state.data.rows;
  return state.data.rows.filter((row) => row.month.startsWith(state.selectedYear));
}

function latestCompleteYear() {
  const counts = new Map();
  for (const row of state.data?.rows || []) {
    const year = row.month.slice(0, 4);
    counts.set(year, (counts.get(year) || 0) + 1);
  }
  const completeYears = [...counts.entries()]
    .filter(([, count]) => count === 12)
    .map(([year]) => year)
    .sort();
  return completeYears.at(-1) || state.data?.rows?.at(-1)?.month.slice(0, 4) || "all";
}

function pearson(xs, ys) {
  const pairs = xs
    .map((x, index) => [x, ys[index]])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 3) return null;
  const xMean = mean(pairs.map(([x]) => x));
  const yMean = mean(pairs.map(([, y]) => y));
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - xMean) * (y - yMean), 0);
  const xVar = pairs.reduce((sum, [x]) => sum + (x - xMean) ** 2, 0);
  const yVar = pairs.reduce((sum, [, y]) => sum + (y - yMean) ** 2, 0);
  if (!xVar || !yVar) return null;
  return numerator / Math.sqrt(xVar * yVar);
}

function regression(xs, ys) {
  const pairs = xs
    .map((x, index) => [x, ys[index]])
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (pairs.length < 2) return { slope: null, intercept: null };
  const xMean = mean(pairs.map(([x]) => x));
  const yMean = mean(pairs.map(([, y]) => y));
  const numerator = pairs.reduce((sum, [x, y]) => sum + (x - xMean) * (y - yMean), 0);
  const denominator = pairs.reduce((sum, [x]) => sum + (x - xMean) ** 2, 0);
  if (!denominator) return { slope: null, intercept: null };
  const slope = numerator / denominator;
  return { slope, intercept: yMean - slope * xMean };
}

function mean(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function byAbs(items, key) {
  return items
    .filter((item) => Number.isFinite(item[key]))
    .sort((a, b) => Math.abs(b[key]) - Math.abs(a[key]));
}

function relationshipText(item) {
  if (!Number.isFinite(item.fullCorr) || Math.abs(item.fullCorr) < 0.2) {
    return "Weak historical link";
  }
  const strong = Math.abs(item.fullCorr) >= 0.45 ? "Stronger" : "Moderate";
  const direction = item.fullCorr > 0 ? "moves with S&P" : "moves against S&P";
  return `${strong}; ${direction}`;
}

function scatterSvg(points, reg) {
  if (points.length < 3) {
    return `<div class="empty">Not enough observations for this selection.</div>`;
  }
  const width = 760;
  const height = 360;
  const pad = { top: 24, right: 24, bottom: 48, left: 58 };
  const xExtent = extent(points.map((point) => point.x));
  const yExtent = extent(points.map((point) => point.y));
  const xPad = Math.max(0.8, (xExtent[1] - xExtent[0]) * 0.12);
  const yPad = Math.max(0.15, (yExtent[1] - yExtent[0]) * 0.18);
  const xDomain = [xExtent[0] - xPad, xExtent[1] + xPad];
  const yDomain = [yExtent[0] - yPad, yExtent[1] + yPad];
  const xScale = (value) => pad.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * (width - pad.left - pad.right);
  const yScale = (value) => height - pad.bottom - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * (height - pad.top - pad.bottom);
  const zeroX = clamp(xScale(0), pad.left, width - pad.right);
  const zeroY = clamp(yScale(0), pad.top, height - pad.bottom);
  const line = Number.isFinite(reg.slope)
    ? {
        x1: xDomain[0],
        y1: reg.intercept + reg.slope * xDomain[0],
        x2: xDomain[1],
        y2: reg.intercept + reg.slope * xDomain[1],
      }
    : null;

  return `
    <svg class="scatter-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Scatter plot">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"></rect>
      <line x1="${pad.left}" x2="${width - pad.right}" y1="${zeroY}" y2="${zeroY}" stroke="#ccd5dc"></line>
      <line x1="${zeroX}" x2="${zeroX}" y1="${pad.top}" y2="${height - pad.bottom}" stroke="#ccd5dc"></line>
      ${ticks(xDomain, 5).map((tick) => `
        <line x1="${xScale(tick)}" x2="${xScale(tick)}" y1="${height - pad.bottom}" y2="${height - pad.bottom + 5}" stroke="#93a1aa"></line>
        <text class="axis-label" x="${xScale(tick)}" y="${height - 22}" text-anchor="middle">${tick.toFixed(1)}%</text>
      `).join("")}
      ${ticks(yDomain, 5).map((tick) => `
        <line x1="${pad.left - 5}" x2="${pad.left}" y1="${yScale(tick)}" y2="${yScale(tick)}" stroke="#93a1aa"></line>
        <text class="axis-label" x="${pad.left - 10}" y="${yScale(tick) + 4}" text-anchor="end">${tick.toFixed(1)}%</text>
      `).join("")}
      ${line ? `<line x1="${xScale(line.x1)}" y1="${yScale(line.y1)}" x2="${xScale(line.x2)}" y2="${yScale(line.y2)}" stroke="#2457a6" stroke-width="2.5"></line>` : ""}
      ${points.map((point) => `
        <circle cx="${xScale(point.x)}" cy="${yScale(point.y)}" r="4.5" fill="#0f8a7d" opacity="0.78">
          <title>${point.month}: S&P ${formatPct(point.x)}, FX ${formatPct(point.y)}</title>
        </circle>
      `).join("")}
      <text class="axis-label" x="${width / 2}" y="${height - 4}" text-anchor="middle">S&P monthly return</text>
      <text class="axis-label" x="16" y="${height / 2}" text-anchor="middle" transform="rotate(-90 16 ${height / 2})">FX month-end move</text>
    </svg>
  `;
}

function extent(values) {
  return [Math.min(...values), Math.max(...values)];
}

function ticks(domain, count) {
  const step = (domain[1] - domain[0]) / (count - 1);
  return Array.from({ length: count }, (_, index) => domain[0] + step * index);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function corrBar(value) {
  if (!Number.isFinite(value)) return "";
  const width = Math.round(Math.abs(value) * 100);
  const color = value >= 0 ? "var(--teal)" : "var(--red)";
  return `<span class="bar-track"><span class="bar-fill" style="width:${width}%;background:${color}"></span></span>`;
}

function heatCell(value) {
  if (!Number.isFinite(value)) return `<td class="heat-cell neutral">--</td>`;
  const magnitude = Math.min(Math.abs(value) / 1.3, 1);
  const bg = value >= 0
    ? `rgba(15, 138, 125, ${0.3 + magnitude * 0.7})`
    : `rgba(185, 56, 56, ${0.3 + magnitude * 0.7})`;
  const neutral = Math.abs(value) < 0.04 ? " neutral" : "";
  return `<td class="heat-cell${neutral}" style="background:${neutral ? "#edf2f5" : bg}">${formatPct(value)}</td>`;
}

function formatPct(value) {
  if (!Number.isFinite(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

function formatCorr(value) {
  if (!Number.isFinite(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}`;
}

function formatBeta(value) {
  if (!Number.isFinite(value)) return "--";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(3)}% FX / 1% S&P`;
}

function formatNumber(value, digits) {
  if (!Number.isFinite(value)) return "--";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatDate(value) {
  if (!value) return "--";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function signClass(value) {
  if (!Number.isFinite(value)) return "";
  if (value > 0.0001) return "positive";
  if (value < -0.0001) return "negative";
  return "amber";
}

function downloadCsv() {
  const pairs = state.data.meta.pairs.map((pair) => pair.symbol);
  const header = ["month", "month_end", "spx_monthly_return_pct", "spx_last_day_return_pct", ...pairs.map((pair) => `${pair}_${state.mode}_return_pct`)];
  const lines = [header.join(",")];
  for (const row of visibleRows()) {
    const values = [
      row.month,
      row.monthEnd,
      row.spxMonthlyReturnPct,
      row.spxLastDayReturnPct,
      ...pairs.map((pair) => fxReturn(row, pair)),
    ];
    lines.push(values.join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fx-month-end-seasonality-${state.selectedYear}-${state.mode}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
