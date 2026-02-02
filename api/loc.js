export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  // For maximum reliability, default to the VPS origin over HTTP.
  // You can override this in Vercel env vars (recommended) with:
  //   VPS_LOC_ENDPOINT=https://loc.maps.linktime.link/loc
  const upstream = process.env.VPS_LOC_ENDPOINT || "http://142.171.179.15/loc";
  const token = process.env.VPS_LOC_TOKEN;
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
    const headers = {
      "content-type": "application/json",
      authorization: `Bearer ${token}`
    };
    // When calling the VPS by IP, ensure nginx routes to the correct vhost.
    if (upstream.startsWith("http://142.171.179.15/")) {
      headers.host = "loc.maps.linktime.link";
    }

    const r = await fetch(upstream, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    res.status(r.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(502).json({ error: "upstream_failed" });
  }
}
