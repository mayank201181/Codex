import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const PORT = Number(process.env.PORT || 5177);
const HOST = process.env.HOST || "0.0.0.0";
const collabRooms = new Map();

await loadDotEnv();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const gradeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["correct", "partially_correct", "incorrect"] },
    marks_awarded: { type: "integer" },
    marks_available: { type: "integer" },
    what_was_good: { type: "string" },
    missing_points: { type: "array", items: { type: "string" } },
    model_answer: { type: "string" },
    revision_tip: { type: "string" }
  },
  required: ["status", "marks_awarded", "marks_available", "what_was_good", "missing_points", "model_answer", "revision_tip"]
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === "POST" && url.pathname === "/api/grade") return gradeAnswer(req, res);
    if (url.pathname === "/api/collab/stroke" && req.method === "POST") return saveCollabStroke(req, res);
    if (url.pathname === "/api/collab/clear" && req.method === "POST") return clearCollabRoom(req, res);
    if (url.pathname === "/api/collab" && req.method === "GET") return getCollabRoom(url, res);
    if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed" });

    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(publicDir, safePath);

    if (!filePath.startsWith(publicDir)) return sendText(res, 403, "Forbidden");

    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch (error) {
    if (error.code === "ENOENT") return sendText(res, 404, "Not found");
    console.error(error);
    sendText(res, 500, "Unexpected server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Pastel 3D Pen Studio local: http://127.0.0.1:${PORT}`);
  for (const url of getLanUrls(PORT)) console.log(`Pastel 3D Pen Studio mobile: ${url}`);
});

async function gradeAnswer(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return sendJson(res, 500, { error: "OPENAI_API_KEY is not set. Add it to .env locally or to the deployment environment." });

  const payload = await readJson(req);
  const { topic, question, studentAnswer, modelAnswer, markScheme, marks } = payload;
  if (!topic || !question || !studentAnswer || !modelAnswer || !Array.isArray(markScheme)) {
    return sendJson(res, 400, { error: "Missing grading information." });
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: [
        {
          role: "system",
          content: "You are a careful Year 7 science exam marker for an IGCSE-style curriculum. Mark only against the supplied mark scheme and model answer. Be encouraging, specific, and concise. Do not introduce unrelated advanced content."
        },
        {
          role: "user",
          content: JSON.stringify({ topic, question, studentAnswer, modelAnswer, markScheme, marksAvailable: marks })
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "science_answer_mark",
          strict: true,
          schema: gradeSchema
        }
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error(data);
    return sendJson(res, response.status, { error: data.error?.message || "OpenAI request failed." });
  }

  const text = data.output_text || data.output?.flatMap((item) => item.content || []).find((part) => part.type === "output_text")?.text;
  if (!text) return sendJson(res, 502, { error: "The AI marker returned no text." });

  sendJson(res, 200, JSON.parse(text));
}

async function saveCollabStroke(req, res) {
  const payload = await readJson(req);
  const room = String(payload.room || "").slice(0, 80);
  const segment = payload.segment;
  if (!room || !segment) return sendJson(res, 400, { error: "Missing collab room or segment." });
  const strokes = collabRooms.get(room) || [];
  const saved = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    user: String(segment.user || "friend").slice(0, 18),
    color: String(segment.color || "#ff4fb3").slice(0, 18),
    radius: Number(segment.radius || 0.105),
    a: segment.a,
    b: segment.b
  };
  strokes.push(saved);
  collabRooms.set(room, strokes.slice(-1200));
  sendJson(res, 200, saved);
}

async function clearCollabRoom(req, res) {
  const payload = await readJson(req);
  const room = String(payload.room || "").slice(0, 80);
  if (!room) return sendJson(res, 400, { error: "Missing collab room." });
  collabRooms.set(room, []);
  sendJson(res, 200, { ok: true });
}

function getCollabRoom(url, res) {
  const room = String(url.searchParams.get("room") || "").slice(0, 80);
  const since = Number(url.searchParams.get("since") || 0);
  if (!room) return sendJson(res, 400, { error: "Missing collab room." });
  const strokes = collabRooms.get(room) || [];
  sendJson(res, 200, { strokes: strokes.slice(Math.max(0, since)), total: strokes.length });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function loadDotEnv() {
  try {
    const content = await fs.readFile(path.join(__dirname, ".env"), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // A deployed app can use platform environment variables instead.
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function getLanUrls(port) {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((info) => info && info.family === "IPv4" && !info.internal)
    .map((info) => `http://${info.address}:${port}`);
}
