export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond({ error: "Ungültige E-Mail-Adresse." }, 400);
  }
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": undefined                             
    },
    body: JSON.stringify({
      email,
      listIds: [3],
      updateEnabled: true
    })
  });
  if (res.status === 201 || res.status === 204) {
    return respond({ ok: true }, 200);
  }
  const err = await res.json().catch(() => ({}));
  if (err?.code === "duplicate_parameter") {
    return respond({ ok: true }, 200);
  }
  console.error("Brevo error:", err);
  return respond({ error: "Fehler beim Speichern. Bitte später versuchen." }, 500);
};
function respond(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
