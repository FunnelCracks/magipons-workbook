const GHL_TOKEN       = process.env.GHL_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const BASE            = "https://services.leadconnectorhq.com";
const TAG             = "reto3k-worbook";

function normalizePhone(phone) {
  // Strip spaces so "+34 600043904" → "+34600043904"
  return phone.replace(/\s+/g, "");
}

async function searchContactExact(field, value, headers) {
  const res = await fetch(`${BASE}/contacts/search`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      page: 1,
      pageLimit: 1,
      filters: [
        {
          group: "AND",
          filters: [{ field, operator: "eq", value }],
        },
      ],
      sort: [],
    }),
  });
  const data = await res.json();
  console.log(`[ghl-tag] POST search ${field}="${value}" → status: ${res.status} | contacts: ${data.contacts?.length ?? 0} | raw: ${JSON.stringify(data).slice(0, 300)}`);
  return data.contacts?.[0] ?? null;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let email, phone;
  try {
    ({ email, phone } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  if (!email) return { statusCode: 400, body: "Missing email" };

  console.log(`[ghl-tag] Buscando: ${email} | phone: ${phone || "—"} | locationId: ${GHL_LOCATION_ID} | token: ${GHL_TOKEN ? "OK" : "MISSING"}`);

  const headers = {
    Authorization: `Bearer ${GHL_TOKEN}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };

  // 1. Buscar por email exacto
  let contact = await searchContactExact("email", email, headers);

  // 2. Fallback: buscar por teléfono exacto (normalizado sin espacios)
  if (!contact && phone) {
    const normalizedPhone = normalizePhone(phone);
    console.log(`[ghl-tag] No encontrado por email, intentando por teléfono: ${normalizedPhone}`);
    contact = await searchContactExact("phone", normalizedPhone, headers);
  }

  if (!contact) {
    return { statusCode: 404, body: JSON.stringify({ error: "Contact not found", email, phone }) };
  }

  // 3. Añadir etiqueta
  const tagRes  = await fetch(`${BASE}/contacts/${contact.id}/tags`, {
    method: "POST",
    headers,
    body: JSON.stringify({ tags: [TAG] }),
  });
  const tagData = await tagRes.json();

  console.log(`[ghl-tag] Tag status: ${tagRes.status} | response: ${JSON.stringify(tagData).slice(0, 200)}`);

  return { statusCode: 200, body: JSON.stringify({ ok: true, contactId: contact.id }) };
};
