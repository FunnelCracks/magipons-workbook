const GHL_TOKEN       = process.env.GHL_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE            = "https://services.leadconnectorhq.com";
const TAG             = "reto3k-worbook";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let email;
  try {
    ({ email } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  if (!email) return { statusCode: 400, body: "Missing email" };

  console.log(`[ghl-tag] Buscando: ${email} | locationId: ${GHL_LOCATION_ID} | token: ${GHL_TOKEN ? "OK" : "MISSING"}`);

  const headers = {
    Authorization: `Bearer ${GHL_TOKEN}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  // 1. Buscar contacto por email
  const searchUrl = `${BASE}/contacts/search?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(email)}`;
  const searchRes = await fetch(searchUrl, { headers });
  const searchData = await searchRes.json();

  console.log(`[ghl-tag] GHL search status: ${searchRes.status} | contacts: ${searchData.contacts?.length ?? 0} | raw: ${JSON.stringify(searchData).slice(0, 300)}`);

  const contact = searchData.contacts?.[0];

  if (!contact) {
    return { statusCode: 404, body: JSON.stringify({ error: "Contact not found", email, ghlResponse: searchData }) };
  }

  // 2. Añadir etiqueta
  const tagRes = await fetch(`${BASE}/contacts/${contact.id}/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tags: [TAG] }),
  });
  const tagData = await tagRes.json();

  console.log(`[ghl-tag] Tag status: ${tagRes.status} | response: ${JSON.stringify(tagData).slice(0, 200)}`);

  return { statusCode: 200, body: JSON.stringify({ ok: true, contactId: contact.id }) };
};
