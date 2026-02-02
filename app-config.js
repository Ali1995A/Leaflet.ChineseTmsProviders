// Edit this file to change the default view without rebuilding.
// You can also override most values via URL query params:
//   ?lat=31.23&lng=121.47&z=12&provider=GaoDe
//   ?sat=Satellite.Map&labels=Satellite.Annotion
//   ?tianDiTuKey=YOUR_KEY
window.APP_CONFIG = {
  title: "Map Viewer",
  default: {
    center: { lat: 39.908722, lng: 116.397499 }, // Beijing Tiananmen
    zoom: 12,
    provider: "GaoDe",
    mode: "sat", // "sat" (satellite) or "road"
    // Auto-locate on page load (requires user consent).
    // - "off": never
    // - "once": try once per device (stored in localStorage)
    // - "always": try every time the page loads
    autoLocate: "always",
    autoLocateZoom: 14,
    // Location reporting (best-effort; requires HTTPS and user consent for location).
    // NOTE: Any token stored here is visible to users of the page. Treat it as a shared key,
    // and enforce rate-limits + validation on the server.
    report: {
      enabled: true,
      // For Vercel deployment, use same-origin API that forwards to your VPS.
      endpoint: "/api/loc",
      // Leave empty when using `/api/loc` (token stays in Vercel env vars).
      token: "",
      // Send on successful location ("auto"/"manual"/"hourly")
      sendOnLocate: true,
      // 0 disables periodic reporting. If >0, re-locate and report every N minutes while visible.
      intervalMinutes: 0
    },
    // Layer ids must match the plugin's "Provider.MapName.MapType"
    // Examples:
    //   GaoDe.Satellite.Map + GaoDe.Satellite.Annotion
    //   TianDiTu.Satellite.Map + TianDiTu.Satellite.Annotion
    sat: "Satellite.Map",
    labels: "Satellite.Annotion",
    tianDiTuKey: ""
  }
};
