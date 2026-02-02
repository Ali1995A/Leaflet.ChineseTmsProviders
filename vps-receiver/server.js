import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8787);
const OUT_DIR = process.env.OUT_DIR || path.join(__dirname, "data");
const OUT_FILE = process.env.OUT_FILE || path.join(OUT_DIR, "locations.jsonl");
const TOKEN = process.env.LOC_TOKEN || ""; // optional shared token

fs.mkdirSync(OUT_DIR, { recursive: true });

function send(res, code, body, headers = {}) {
  res.writeHead(code, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

function getAuthToken(req) {
  const h = req.headers["authorization"];
  if (!h) return "";
  const m = /^Bearer\s+(.+)$/.exec(String(h));
  return m ? m[1] : "";
}

function safeRecord(rec) {
  // Keep only what we need (avoid accidentally storing more than intended)
  const out = {
    ts: typeof rec.ts === "string" ? rec.ts : new Date().toISOString(),
    reason: typeof rec.reason === "string" ? rec.reason : "unknown",
    deviceId: typeof rec.deviceId === "string" ? rec.deviceId : "unknown",
    coords:
      rec.coords && typeof rec.coords === "object"
        ? {
            lat: Number(rec.coords.lat),
            lng: Number(rec.coords.lng),
            accuracy: Number(rec.coords.accuracy || 0)
          }
        : null,
    map:
      rec.map && typeof rec.map === "object"
        ? {
            zoom: Number(rec.map.zoom || 0),
            provider: String(rec.map.provider || ""),
            mode: String(rec.map.mode || "")
          }
        : null
  };
  if (!out.coords || !Number.isFinite(out.coords.lat) || !Number.isFinite(out.coords.lng)) {
    return null;
  }
  return out;
}

const server = http.createServer((req, res) => {
  // CORS (for browser POST)
  res.setHeader("access-control-allow-origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("access-control-allow-methods", "POST,OPTIONS,GET");
  res.setHeader(
    "access-control-allow-headers",
    "content-type,authorization"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    send(res, 200, { ok: true });
    return;
  }

  if (req.method !== "POST" || req.url !== "/loc") {
    send(res, 404, { error: "not_found" });
    return;
  }

  if (TOKEN && getAuthToken(req) !== TOKEN) {
    send(res, 401, { error: "unauthorized" });
    return;
  }

  let buf = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    buf += chunk;
    if (buf.length > 1024 * 32) req.destroy(); // 32KB max
  });
  req.on("end", () => {
    let parsed = null;
    try {
      parsed = JSON.parse(buf || "{}");
    } catch {
      send(res, 400, { error: "bad_json" });
      return;
    }

    const rec = safeRecord(parsed);
    if (!rec) {
      send(res, 400, { error: "bad_payload" });
      return;
    }

    fs.appendFile(OUT_FILE, `${JSON.stringify(rec)}\n`, (err) => {
      if (err) {
        console.error(err);
        send(res, 500, { error: "write_failed" });
        return;
      }
      send(res, 200, { ok: true });
    });
  });
});

server.listen(PORT, () => {
  console.log(`listening on :${PORT}`);
  console.log(`POST /loc -> ${OUT_FILE}`);
});
