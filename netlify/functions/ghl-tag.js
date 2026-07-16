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

  const headers = {
    Authorization: `Bearer ${GHL_TOKEN}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  // 1. Buscar contacto por email
  const searchRes = await fetch(
    `${BASE}/contacts/?email=${encodeURIComponent(email)}&locationId=${GHL_LOCATION_ID}`,
    { headers }
  );
  const searchData = await searchRes.json();
  const contact = searchData.contacts?.[0];

  if (!contact) {
    return { statusCode: 404, body: JSON.stringify({ error: "Contact not found", email }) };
  }

  // 2. Añadir etiqueta
  await fetch(`${BASE}/contacts/${contact.id}/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tags: [TAG] }),
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true, contactId: contact.id }) };
};
