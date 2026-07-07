// Vercel Serverless Function — protected ImprovMX diagnostics page.
// Auth: ?key=<DASHBOARD_KEY>  (URL-token, both env vars set in Vercel project settings)
//
// Views (all require ?key=…):
//   /api/improvmx                       → Account-Übersicht + Liste aller Domains
//   /api/improvmx?domain=<domain>       → Aliase (Weiterleitungen) + letzte Zustell-Logs der Domain
//   /api/improvmx?domain=<domain>&q=…   → Logs zusätzlich nach Empfänger/Absender/Betreff gefiltert
//
// Zum Debuggen fehlender Magic-Links: Domain öffnen ("Kultur am Regen"), prüfen ob für die
// betroffene Adresse ein Alias/Weiterleitung existiert und ob die letzten Zustellungen
// (Logs) DELIVERED oder BOUNCED/REFUSED sind. Mit ?q= nach dem Empfänger filtern.
//
// Quelle: https://api.improvmx.com/v3/

const API = 'https://api.improvmx.com/v3';

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

  const auth = 'Basic ' + Buffer.from('api:' + IMPROVMX_API_KEY).toString('base64');
  const imx = async (path) => {
    const r = await fetch(API + path, { headers: { Authorization: auth } });
    if (!r.ok) {
      let detail = `${r.status} ${r.statusText}`;
      try {
        const body = await r.json();
        if (body?.error) detail += ` — ${body.error}`;
        else if (Array.isArray(body?.errors)) detail += ` — ${body.errors.join('; ')}`;
      } catch { /* ignore non-JSON error bodies */ }
      throw new Error(`ImprovMX API ${detail}`);
    }
    return r.json();
  };

  // Fetch all pages of a paginated collection (aliases/domains cap out well below this).
  const imxAll = async (basePath, listKey) => {
    const items = [];
    for (let page = 1; page <= 20; page++) {
      const sep = basePath.includes('?') ? '&' : '?';
      const data = await imx(`${basePath}${sep}page=${page}&limit=100`);
      const chunk = data?.[listKey] ?? [];
      items.push(...chunk);
      if (chunk.length < 100) break;
    }
    return items;
  };

  const domain = (req.query?.domain ?? '').toString().trim();
  const q = (req.query?.q ?? '').toString().trim();
  const dashKey = encodeURIComponent(providedKey);

  try {
    if (!domain) {
      const [account, domains] = await Promise.all([
        imx('/account/').then((d) => d?.account ?? {}),
        imxAll('/domains/', 'domains'),
      ]);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(renderOverview({ account, domains, dashKey }));
    }

    const dom = encodeURIComponent(domain);
    const [aliases, logsRaw] = await Promise.all([
      imxAll(`/domains/${dom}/aliases/`, 'aliases'),
      imx(`/domains/${dom}/logs/`).then((d) => d?.logs ?? []).catch(() => null),
    ]);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(renderDomain({ domain, aliases, logs: logsRaw, q, dashKey }));
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(502).send('Fehler beim Abruf der ImprovMX-API: ' + err.message);
  }
}

/* ---------- shared helpers ---------- */

const esc = (v) =>
  String(v ?? '—').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmtDate = (ts) => (ts ? new Date(ts * 1000).toLocaleDateString('de-DE') : '—');
const fmtDateTime = (ts) => (ts ? new Date(ts * 1000).toLocaleString('de-DE') : '—');
const fmtBool = (b) => (b ? 'ja' : 'nein');

const STYLES = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 3rem 1.25rem; min-height: 100vh;
    background: #0f0e0c; color: #e9e6df;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.5;
  }
  .wrap { max-width: 760px; margin: 0 auto; }
  a { color: #7fd4c9; text-decoration: none; }
  a:hover { text-decoration: underline; }
  h1 { font-size: 1.75rem; margin: 0 0 0.25rem; color: #f3e5b3; letter-spacing: -0.01em; }
  h2 { font-size: 1.05rem; margin: 2.25rem 0 0.75rem; color: #f3e5b3; }
  .sub { color: #918a7a; margin: 0 0 2rem; font-size: 0.9rem; }
  .back { display: inline-block; margin-bottom: 1.25rem; font-size: 0.85rem; color: #918a7a; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 0.85rem 1.5rem;
       margin: 0 0 2rem; padding: 1.5rem; border: 1px solid #2a2723;
       border-radius: 12px; background: #16140f; }
  dt { color: #8e8676; font-size: 0.85rem; align-self: center; }
  dd { margin: 0; font-variant-numeric: tabular-nums; word-break: break-word; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 999px;
           font-size: 0.78rem; background: #2a2723; color: #e9e6df; }
  .badge.gold { background: #3a2f12; color: #f3e5b3; }
  .badge.ok { background: #14331f; color: #8fe3a8; }
  .badge.warn { background: #3a2f12; color: #f3d58b; }
  .badge.bad { background: #3a1717; color: #f0a3a3; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 1.5rem; font-size: 0.85rem; }
  th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #221f1b;
           vertical-align: top; word-break: break-word; }
  th { color: #8e8676; font-weight: 600; font-size: 0.78rem; }
  tr:hover td { background: #14120e; }
  .empty { padding: 1.25rem 1.5rem; border: 1px dashed #2a2723; border-radius: 12px;
           background: #16140f; color: #918a7a; }
  form.filter { margin: 0 0 1.25rem; display: flex; gap: 0.5rem; }
  form.filter input[type=text] { flex: 1; padding: 0.55rem 0.75rem; border-radius: 8px;
    border: 1px solid #2a2723; background: #0a0908; color: #e9e6df; font-size: 0.9rem; }
  form.filter button { padding: 0.55rem 1rem; border-radius: 8px; border: 1px solid #3a2f12;
    background: #3a2f12; color: #f3e5b3; cursor: pointer; font-size: 0.9rem; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.85em; }
  details { margin-top: 1.5rem; }
  summary { cursor: pointer; color: #918a7a; font-size: 0.85rem; }
  summary:hover { color: #c9c1ad; }
  pre { overflow: auto; padding: 1rem; background: #0a0908;
        border-radius: 8px; border: 1px solid #2a2723; font-size: 0.78rem; }
  .meta { color: #5d564a; font-size: 0.75rem; margin-top: 2rem; text-align: right; }
`;

function page(title, inner) {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${STYLES}</style>
</head>
<body>
  <div class="wrap">
${inner}
    <p class="meta">Abgerufen ${esc(new Date().toLocaleString('de-DE'))}</p>
  </div>
</body>
</html>`;
}

/* ---------- overview: account + domains ---------- */

function renderOverview({ account, domains, dashKey }) {
  const limits = account.limits ?? {};
  const planName = account.plan?.name ?? (account.premium ? 'Premium' : 'Free');

  const rows = (domains ?? [])
    .map((d) => {
      const name = d.display ?? d.domain ?? '—';
      const active = d.active === false ? '<span class="badge bad">inaktiv</span>' : '<span class="badge ok">aktiv</span>';
      const banned = d.banned ? ' <span class="badge bad">gesperrt</span>' : '';
      const href = `?key=${dashKey}&domain=${encodeURIComponent(name)}`;
      return `<tr>
        <td><a href="${esc(href)}"><code>${esc(name)}</code></a></td>
        <td>${active}${banned}</td>
        <td>${esc(d.aliases_count ?? d.aliases ?? '—')}</td>
      </tr>`;
    })
    .join('');

  const domainsBlock = rows
    ? `<table>
         <thead><tr><th>Domain</th><th>Status</th><th>Aliase</th></tr></thead>
         <tbody>${rows}</tbody>
       </table>`
    : `<div class="empty">Keine Domains gefunden.</div>`;

  const inner = `
    <h1>ImprovMX Status</h1>
    <p class="sub">Account-Übersicht &amp; Domains. Domain öffnen, um Weiterleitungen und Zustell-Logs zu prüfen.</p>

    <dl>
      <dt>Account</dt><dd>${esc(account.email)}</dd>
      <dt>Plan</dt><dd><span class="badge ${account.premium ? 'gold' : ''}">${esc(planName)}</span></dd>
      <dt>Premium</dt><dd>${fmtBool(account.premium)}</dd>
      <dt>Aliases-Limit</dt><dd>${esc(limits.aliases)}</dd>
      <dt>Domains-Limit</dt><dd>${esc(limits.domains)}</dd>
      <dt>Weiterleitungen / Alias</dt><dd>${esc(limits.redirects)}</dd>
      <dt>Requests / Min</dt><dd>${esc(limits.requests_per_minute)}</dd>
      <dt>Konto seit</dt><dd>${fmtDate(account.created)}</dd>
    </dl>

    <h2>Domains</h2>
    ${domainsBlock}
  `;
  return page('ImprovMX Status', inner);
}

/* ---------- domain detail: aliases + logs ---------- */

// Classify a log entry by its most recent event so problems stand out at a glance.
function classifyLog(log) {
  const events = Array.isArray(log.events) ? log.events : [];
  const last = events[events.length - 1] ?? {};
  const status = String(last.status ?? log.status ?? '').toUpperCase();
  if (/DELIVER|ACCEPT|SENT|QUEUED/.test(status)) return { status: status || 'OK', cls: 'ok' };
  if (/SOFT|DEFER|GREYLIST|QUEUE/.test(status)) return { status: status || 'VERZÖGERT', cls: 'warn' };
  if (/BOUNCE|REFUS|REJECT|FAIL|ERROR|BLOCK|SPAM/.test(status)) return { status: status || 'FEHLER', cls: 'bad' };
  return { status: status || '—', cls: '' };
}

function logMatches(log, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    log.sender?.email, log.sender?.name,
    log.recipient?.email, log.recipient?.name,
    log.subject,
    ...(Array.isArray(log.forwards) ? log.forwards.map((f) => f?.email ?? f) : []),
    ...(Array.isArray(log.events) ? log.events.map((e) => e?.recipient ?? e?.message) : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(needle);
}

function renderDomain({ domain, aliases, logs, q, dashKey }) {
  const back = `<a class="back" href="?key=${dashKey}">← Alle Domains</a>`;

  // Aliases table
  const aliasRows = (aliases ?? [])
    .map((a) => {
      const hit = q && String(a.alias ?? '').toLowerCase().includes(q.toLowerCase());
      const catchAll = a.alias === '*' ? ' <span class="badge">Catch-all</span>' : '';
      return `<tr${hit ? ' style="background:#1a180f"' : ''}>
        <td><code>${esc(a.alias)}</code>@${esc(domain)}${catchAll}</td>
        <td><code>${esc(a.forward)}</code></td>
      </tr>`;
    })
    .join('');

  const aliasBlock = aliasRows
    ? `<table>
         <thead><tr><th>Adresse</th><th>Weiterleitung an</th></tr></thead>
         <tbody>${aliasRows}</tbody>
       </table>`
    : `<div class="empty">Keine Aliase/Weiterleitungen für diese Domain — eingehende Mails an diese Domain gehen ohne Catch-all ins Leere.</div>`;

  // Logs table
  let logsBlock;
  if (logs === null) {
    logsBlock = `<div class="empty">Zustell-Logs konnten nicht geladen werden (evtl. nur mit Premium-Plan verfügbar).</div>`;
  } else {
    const filtered = logs.filter((l) => logMatches(l, q));
    const logRows = filtered
      .map((l) => {
        const { status, cls } = classifyLog(l);
        const fwd = Array.isArray(l.forwards) && l.forwards.length
          ? l.forwards.map((f) => esc(f?.email ?? f)).join(', ')
          : '—';
        return `<tr>
          <td>${esc(fmtDateTime(l.created))}</td>
          <td><code>${esc(l.recipient?.email)}</code></td>
          <td>${esc(l.sender?.email)}</td>
          <td>${esc(l.subject)}</td>
          <td>→ ${fwd}</td>
          <td><span class="badge ${cls}">${esc(status)}</span></td>
        </tr>`;
      })
      .join('');

    logsBlock = logRows
      ? `<table>
           <thead><tr><th>Zeit</th><th>An (Alias)</th><th>Von</th><th>Betreff</th><th>Weitergeleitet</th><th>Status</th></tr></thead>
           <tbody>${logRows}</tbody>
         </table>`
      : `<div class="empty">Keine Log-Einträge${q ? ` für „${esc(q)}“` : ''} gefunden. Wenn ein Magic-Link-Mail hier gar nicht auftaucht, ist es nie bei ImprovMX angekommen (Absender-Problem); taucht es mit Fehler-Status auf, scheitert die Weiterleitung ans Zielpostfach.</div>`;
  }

  const inner = `
    ${back}
    <h1>${esc(domain)}</h1>
    <p class="sub">Weiterleitungen &amp; letzte Zustell-Logs.</p>

    <form class="filter" method="get">
      <input type="hidden" name="key" value="${esc(decodeURIComponent(dashKey))}">
      <input type="hidden" name="domain" value="${esc(domain)}">
      <input type="text" name="q" value="${esc(q)}" placeholder="Nach Empfänger/Absender/Betreff filtern (z. B. Name oder Adresse)…" autofocus>
      <button type="submit">Filtern</button>
    </form>

    <h2>Aliase / Weiterleitungen (${(aliases ?? []).length})</h2>
    ${aliasBlock}

    <h2>Zustell-Logs</h2>
    ${logsBlock}
  `;

  return page(`ImprovMX — ${domain}`, inner);
}
