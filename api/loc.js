function sendJson(res, statusCode, obj) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  // For maximum reliability, default to the VPS origin over HTTP.
  // You can override this in Vercel env vars (recommended) with:
  //   VPS_LOC_ENDPOINT=https://loc.maps.linktime.link/loc
  const upstream =
    process.env.VPS_LOC_ENDPOINT || "http://142.171.179.15:8787/loc";
  const token = process.env.VPS_LOC_TOKEN;
  if (!token) {
    sendJson(res, 500, { error: "missing_token" });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: "bad_json" });
    return;
  }

  try {
    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };
    const r = await fetch(upstream, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    res.statusCode = r.status;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(text);
  } catch {
    sendJson(res, 502, { error: "upstream_failed" });
  }
};
