import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const publicDir = path.join(root, "public");
const cacheDir = path.join(root, "data", "cache");

await loadEnv(path.join(root, ".env"));

const API_KEY = process.env.EODHD_API_KEY;
const PORT = Number(process.env.PORT || 5177);
const HOST = process.env.HOST || (process.env.RENDER || process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "127.0.0.1");
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const EMAIL_CODE_ENABLED = process.env.EMAIL_CODE_ENABLED === "true";
const OWNER_EMAIL = process.env.OWNER_EMAIL || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const CODE_TTL_MS = 10 * 60 * 1000;
const pendingCodes = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const COMMON_FX_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD",
  "EURGBP", "EURJPY", "EURCHF", "EURCAD", "EURAUD", "EURNZD",
  "GBPJPY", "GBPCHF", "GBPCAD", "GBPAUD", "GBPNZD",
  "AUDJPY", "AUDCHF", "AUDCAD", "AUDNZD",
  "NZDJPY", "NZDCHF", "NZDCAD",
  "CADJPY", "CADCHF", "CHFJPY",
  "USDMXN", "USDZAR", "USDTRY", "USDSGD", "USDHKD", "USDCNH", "USDSEK", "USDNOK", "USDPLN",
  "EURSEK", "EURNOK", "EURPLN", "EURTRY", "EURZAR", "EURMXN",
  "GBPSEK", "GBPNOK", "GBPSGD", "GBPHKD",
  "AUDSGD", "AUDCNH", "NZDSGD", "SGDJPY", "NOKJPY", "SEKJPY",
];

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/auth/status") {
      return sendJson(res, authStatus(req));
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      return handlePasswordLogin(req, res);
    }

    if (url.pathname === "/api/auth/request-code" && req.method === "POST") {
      return handleCodeRequest(req, res);
    }

    if (url.pathname === "/api/auth/verify-code" && req.method === "POST") {
      return handleCodeVerify(req, res);
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      res.writeHead(204, { "Set-Cookie": clearSessionCookie() });
      return res.end();
    }

    if (url.pathname === "/api/pairs") {
      if (!isAuthorized(req)) return sendJson(res, { error: "Login required" }, 401);
      return sendJson(res, { pairs: COMMON_FX_PAIRS });
    }

    if (url.pathname === "/api/history") {
      if (!isAuthorized(req)) return sendJson(res, { error: "Login required" }, 401);
      return handleHistory(url, res);
    }

    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(publicDir, safePath);

    if (!filePath.startsWith(publicDir)) {
      return sendText(res, 403, "Forbidden");
    }

    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") return sendText(res, 404, "Not found");
    console.error(error);
    sendJson(res, { error: error.message || "Unexpected error" }, 500);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`FX seasonality dashboard: http://localhost:${PORT}`);
});

async function handlePasswordLogin(req, res) {
  if (!AUTH_PASSWORD) return sendJson(res, { ok: true, authRequired: false });

  const body = await readJsonBody(req);
  if (body.password !== AUTH_PASSWORD) {
    return sendJson(res, { error: "Incorrect password" }, 401);
  }

  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Set-Cookie": sessionCookie("password"),
  });
  res.end(JSON.stringify({ ok: true }));
}

async function handleCodeRequest(req, res) {
  const configured = EMAIL_CODE_ENABLED && OWNER_EMAIL && RESEND_API_KEY && EMAIL_FROM;
  if (!configured) {
    return sendJson(res, { error: "Email access codes are not configured yet." }, 400);
  }

  const body = await readJsonBody(req);
  const requester = String(body.requester || "").slice(0, 120).trim() || "A colleague";
  const code = String(crypto.randomInt(100000, 1000000));
  const requestId = crypto.randomUUID();
  pendingCodes.set(requestId, {
    codeHash: hashValue(code),
    expiresAt: Date.now() + CODE_TTL_MS,
    requester,
  });

  await sendOwnerCodeEmail({ code, requester });
  sendJson(res, { ok: true, requestId, expiresMinutes: CODE_TTL_MS / 60000 });
}

async function handleCodeVerify(req, res) {
  const body = await readJsonBody(req);
  const requestId = String(body.requestId || "");
  const code = String(body.code || "").trim();
  const pending = pendingCodes.get(requestId);

  if (!pending || pending.expiresAt < Date.now()) {
    pendingCodes.delete(requestId);
    return sendJson(res, { error: "That code has expired. Please request a new one." }, 401);
  }

  if (pending.codeHash !== hashValue(code)) {
    return sendJson(res, { error: "Incorrect code" }, 401);
  }

  pendingCodes.delete(requestId);
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Set-Cookie": sessionCookie("email-code"),
  });
  res.end(JSON.stringify({ ok: true }));
}

async function handleHistory(url, res) {
  if (!API_KEY) return sendJson(res, { error: "Missing EODHD_API_KEY in .env" }, 500);

  const pairs = (url.searchParams.get("pairs") || "")
    .split(",")
    .map((pair) => pair.trim().toUpperCase())
    .filter(Boolean);
  const years = clamp(Number(url.searchParams.get("years") || 10), 1, 35);
  const refresh = url.searchParams.get("refresh") === "1";

  if (!pairs.length) return sendJson(res, { error: "No pairs requested" }, 400);

  await fs.mkdir(cacheDir, { recursive: true });

  const today = new Date();
  const from = new Date(Date.UTC(today.getUTCFullYear() - years - 1, today.getUTCMonth(), today.getUTCDate()));
  const fromStr = toIsoDate(from);
  const toStr = toIsoDate(today);

  const results = {};
  const errors = {};

  await runPool(pairs, 5, async (pair) => {
    try {
      results[pair] = await getPairHistory(pair, fromStr, toStr, refresh);
    } catch (error) {
      errors[pair] = error.message || String(error);
    }
  });

  sendJson(res, {
    fetchedAt: new Date().toISOString(),
    from: fromStr,
    to: toStr,
    pairs: results,
    errors,
  });
}

async function sendOwnerCodeEmail({ code, requester }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: OWNER_EMAIL,
      subject: "FX Seasonality access code",
      text: `${requester} requested access to the FX Seasonality Dashboard.\n\nTemporary access code: ${code}\n\nThis code expires in 10 minutes. Share it only if you want to approve this device.`,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Could not send email code: ${text.slice(0, 200)}`);
  }
}

async function getPairHistory(pair, from, to, refresh) {
  const cachePath = path.join(cacheDir, `${pair}_${from}_${to}.json`);
  if (!refresh) {
    const cached = await readCache(cachePath);
    if (cached) return cached;
  }

  const symbol = `${pair}.FOREX`;
  const apiUrl = new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);
  apiUrl.searchParams.set("api_token", API_KEY);
  apiUrl.searchParams.set("fmt", "json");
  apiUrl.searchParams.set("from", from);
  apiUrl.searchParams.set("to", to);
  apiUrl.searchParams.set("period", "d");

  const response = await fetch(apiUrl);
  const text = await response.text();
  if (!response.ok) throw new Error(`EODHD ${response.status}: ${text.slice(0, 160)}`);

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(`EODHD returned non-JSON data for ${pair}`);
  }

  if (!Array.isArray(raw)) {
    const message = raw?.message || raw?.error || "Unexpected EODHD response";
    throw new Error(message);
  }

  const cleaned = raw
    .map((row) => ({
      date: row.date,
      close: Number(row.adjusted_close ?? row.close),
    }))
    .filter((row) => row.date && Number.isFinite(row.close) && row.close > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  await fs.writeFile(cachePath, JSON.stringify(cleaned));
  return cleaned;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

async function readCache(cachePath) {
  try {
    const stat = await fs.stat(cachePath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs > 18 * 60 * 60 * 1000) return null;
    return JSON.parse(await fs.readFile(cachePath, "utf8"));
  } catch {
    return null;
  }
}

function authStatus(req) {
  return {
    authenticated: isAuthorized(req),
    passwordEnabled: Boolean(AUTH_PASSWORD),
    codeEnabled: Boolean(EMAIL_CODE_ENABLED && OWNER_EMAIL && RESEND_API_KEY && EMAIL_FROM),
  };
}

function isAuthorized(req) {
  if (!AUTH_PASSWORD && !EMAIL_CODE_ENABLED) return true;
  const cookies = parseCookies(req.headers.cookie || "");
  return verifySession(cookies.fx_session);
}

function sessionCookie(method) {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `${expiresAt}.${method}`;
  const signature = signValue(payload);
  return `fx_session=${encodeURIComponent(`${payload}.${signature}`)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`;
}

function clearSessionCookie() {
  return "fx_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
}

function verifySession(value) {
  if (!value) return false;
  const parts = decodeURIComponent(value).split(".");
  if (parts.length !== 3) return false;
  const [expiresText, method, signature] = parts;
  const payload = `${expiresText}.${method}`;
  const expected = signValue(payload);
  return timingSafeEqual(signature, expected) && Number(expiresText) > Date.now();
}

function parseCookies(cookieHeader) {
  const cookies = {};
  for (const item of cookieHeader.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (!key) continue;
    cookies[key] = value.join("=");
  }
  return cookies;
}

function signValue(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function hashValue(value) {
  return crypto.createHash("sha256").update(`${SESSION_SECRET}:${value}`).digest("hex");
}

function timingSafeEqual(a, b) {
  const aBuffer = Buffer.from(a || "");
  const bBuffer = Buffer.from(b || "");
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

async function runPool(items, limit, worker) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(workers);
}

async function loadEnv(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = rest.join("=").trim();
    }
  } catch {
    // .env is optional so the app can also run with exported environment variables.
  }
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function sendJson(res, payload, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}
