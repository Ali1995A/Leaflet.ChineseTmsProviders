export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const upstream = process.env.VPS_LOC_ENDPOINT;
  const token = process.env.VPS_LOC_TOKEN;
  if (!upstream) {
    res.status(500).json({ error: "missing_upstream" });
    return;
  }
  if (!token) {
    res.status(500).json({ error: "missing_token" });
    return;
  }

  let payload = req.body;
  // Some Vercel configurations may pass raw body as string.
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      res.status(400).json({ error: "bad_json" });
      return;
    }
  }

  try {
    const r = await fetch(upstream, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    res.status(r.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream_failed" });
  }
}

