# VPS receiver (JSONL)

Minimal HTTP endpoint to store browser-reported locations to a local JSONL file.

## Run

```bash
cd vps-receiver
npm i --omit=dev
LOC_TOKEN="change-me" PORT=8787 node server.js
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

Write a record:

```bash
curl -X POST http://127.0.0.1:8787/loc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer change-me" \
  -d '{"ts":"2026-02-02T00:00:00.000Z","reason":"manual","deviceId":"demo","coords":{"lat":31.23,"lng":121.47,"accuracy":12},"map":{"zoom":12,"provider":"GaoDe","mode":"sat"},"ua":"demo"}'
```

## Configure the webpage

In `app-config.js`, set:

- `report.enabled = true`
- `report.endpoint = "https://loc.YOUR_DOMAIN/loc"` (recommend HTTPS + reverse proxy)
- `report.token = "change-me"`

## Notes

- This is best-effort logging, not a full auth system.
- Client-side tokens are visible to users; enforce rate limits and IP allowlists at the reverse proxy if possible.
