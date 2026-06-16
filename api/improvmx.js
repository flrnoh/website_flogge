// Vercel Serverless Function — protected ImprovMX account-overview page.
// Auth: ?key=<DASHBOARD_KEY>  (URL-token, both env vars set in Vercel project settings)
// Source: https://api.improvmx.com/v3/account/

export default async function handler(req, res) {
  const { IMPROVMX_API_KEY, DASHBOARD_KEY } = process.env;

  if (!IMPROVMX_API_KEY || !DASHBOARD_KEY) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send(
      'Server-Konfiguration unvollständig: IMPROVMX_API_KEY und/oder DASHBOARD_KEY fehlen in den Vercel Env Vars.'
    );
  }

  const providedKey = (req.query?.key ?? '').toString();
  if (providedKey !== DASHBOARD_KEY) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(403).send('403 — Schlüssel fehlt oder falsch.');
  }

  let payload;
  try {
    const auth = Buffer.from('api:' + IMPROVMX_API_KEY).toString('base64');
    const r = await fetch('https://api.improvmx.com/v3/account/', {
      headers: { Authorization: 'Basic ' + auth },
    });
    if (!r.ok) {
      throw new Error(`ImprovMX API ${r.status} ${r.statusText}`);
    }
    payload = await r.json();
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(502).send('Fehler beim Abruf der ImprovMX-API: ' + err.message);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(renderPage(payload));
}

function renderPage(payload) {
  const account = payload?.account ?? {};
  const limits = account.limits ?? {};
  const planName = account.plan?.name ?? (account.premium ? 'Premium' : 'Free');

  const esc = (v) =>
    String(v ?? '—').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtDate = (ts) => (ts ? new Date(ts * 1000).toLocaleDateString('de-DE') : '—');
  const fmtBool = (b) => (b ? 'ja' : 'nein');
  const fetchedAt = new Date().toLocaleString('de-DE');

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ImprovMX Status</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 3rem 1.25rem; min-height: 100vh;
    background: #0f0e0c; color: #e9e6df;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.5;
  }
  .wrap { max-width: 640px; margin: 0 auto; }
  h1 { font-size: 1.75rem; margin: 0 0 0.25rem; color: #f3e5b3; letter-spacing: -0.01em; }
  .sub { color: #918a7a; margin: 0 0 2rem; font-size: 0.9rem; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.85rem 1.5rem;
       margin: 0 0 2rem; padding: 1.5rem; border: 1px solid #2a2723;
       border-radius: 12px; background: #16140f; }
  dt { color: #8e8676; font-size: 0.85rem; align-self: center; }
  dd { margin: 0; font-variant-numeric: tabular-nums; word-break: break-word; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px;
           font-size: 0.78rem; background: #2a2723; color: #e9e6df; }
  .badge.gold { background: #3a2f12; color: #f3e5b3; }
  details { margin-top: 1.5rem; }
  summary { cursor: pointer; color: #918a7a; font-size: 0.85rem; }
  summary:hover { color: #c9c1ad; }
  pre { overflow: auto; padding: 1rem; background: #0a0908;
        border-radius: 8px; border: 1px solid #2a2723; font-size: 0.78rem; }
  .meta { color: #5d564a; font-size: 0.75rem; margin-top: 2rem; text-align: right; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>ImprovMX Status</h1>
    <p class="sub">Live-Snapshot der Account-Übersicht.</p>

    <dl>
      <dt>Account</dt>
      <dd>${esc(account.email)}</dd>

      <dt>Plan</dt>
      <dd><span class="badge ${account.premium ? 'gold' : ''}">${esc(planName)}</span></dd>

      <dt>Premium</dt>
      <dd>${fmtBool(account.premium)}</dd>

      <dt>Aliases-Limit</dt>
      <dd>${esc(limits.aliases)}</dd>

      <dt>Domains-Limit</dt>
      <dd>${esc(limits.domains)}</dd>

      <dt>Weiterleitungen / Alias</dt>
      <dd>${esc(limits.redirects)}</dd>

      <dt>Subdomains-Limit</dt>
      <dd>${esc(limits.subdomains)}</dd>

      <dt>Requests / Min</dt>
      <dd>${esc(limits.requests_per_minute)}</dd>

      <dt>Konto seit</dt>
      <dd>${fmtDate(account.created)}</dd>
    </dl>

    <details>
      <summary>Rohdaten (JSON) anzeigen</summary>
      <pre>${esc(JSON.stringify(payload, null, 2))}</pre>
    </details>

    <p class="meta">Abgerufen ${esc(fetchedAt)}</p>
  </div>
</body>
</html>`;
}
