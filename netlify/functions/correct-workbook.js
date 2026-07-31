const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let workbook;
  try {
    ({ workbook } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  if (!workbook) return { statusCode: 400, body: "Missing workbook" };

  const d = workbook.data || {};
  const d0 = d.day0 || {};
  const d1 = d.day1 || {};
  const d2 = d.day2 || {};
  const d3 = d.day3 || {};

  const userContent = `
DATOS DEL WORKBOOK
==================
Nombre: ${workbook.userFirstName || ""} ${workbook.userLastName || ""}
Email: ${workbook.userEmail || ""}
Teléfono: ${workbook.userPhone || ""}
Completado: ${workbook.completionPercentage || 0}%

--- DÍA 0: VISIÓN ---
Motivación / Por qué: ${d0.motivation || "(sin rellenar)"}
MRH soñado (ingresos mensuales): ${d0.mrh || "(sin rellenar)"}
Día ideal: ${d0.idealDay || "(sin rellenar)"}
Situación hoy: ${d0.situacion || "(sin rellenar)"}
Rango de facturación: ${d0.facturacionRango || "(sin rellenar)"}

--- DÍA 1: CLARIDAD Y MODELO ---
Nombre del modelo: ${d1.modelName || "(sin rellenar)"}
Descripción del avatar: ${d1.avatarDescription || "(sin rellenar)"}
Nivel de conciencia del cliente: ${d1.consciousnessLevel || "(sin rellenar)"}
Frases del cliente: ${d1.clientPhrases || "(sin rellenar)"}
Transformación prometida: ${d1.transformation || "(sin rellenar)"}
Fórmula: ${d1.formula || "(sin rellenar)"}
Tipo de modelo: ${d1.modelType || "(sin rellenar)"}
Razón del modelo: ${d1.modelReason || "(sin rellenar)"}
Soporte: ${d1.support || "(sin rellenar)"}
Contenido: ${d1.content || "(sin rellenar)"}
Comunidad: ${d1.community || "(sin rellenar)"}
Progreso del cliente: ${d1.progress || "(sin rellenar)"}
Precio: ${d1.price || "(sin rellenar)"}

--- DÍA 2: ESTRATEGIA DE VENTA ---
Precio anual: ${d2.annualPrice || "(sin rellenar)"}
Cambios del Día 1: ${d2.changes || "(sin rellenar)"}
Propuesta única: ${d2.uniqueProposal || "(sin rellenar)"}
Estrategia anual: ${d2.annualStrategy || "(sin rellenar)"}
Estrategia de lanzamiento: ${d2.launchStrategy || "(sin rellenar)"}
Migración de clientes: ${d2.migration || "(sin rellenar)"}
Primeros clientes: ${(d2.firstClients || []).filter((c) => c?.name?.trim()).map((c) => `${c.name} (${c.reason || ""})`).join(", ") || "(sin rellenar)"}

--- DÍA 3: IA Y FUNNEL ---
Hero de landing: ${d3.landingHero || "(sin rellenar)"}
Herramientas elegidas: ${(d3.tools || []).join(", ") || "(sin rellenar)"}
`.trim();

  const systemPrompt = `Eres un consultor senior de Funnel Cracks (FC), formación de Magí Pons especializada en membresías y programas recurrentes.

Tu tarea es analizar el workbook del Reto 3K de un potencial cliente y generar un BRIEF PARA EL SETTER antes de la llamada de corrección. El setter usará este brief para llevar la conversación.

METODOLOGÍA FC QUE APLICAS:
- El avatar debe ser psicológico, no solo demográfico. Un avatar por rol de vida, no por datos demográficos.
- El modelo debe ser sostenible: membresías 97€-497€/mes o programas 997€-3.000€+. Evitar precios muy bajos (<50€/mes) o modelos insostenibles.
- La promesa debe ser específica y medible, no genérica.
- La transformación debe ser el resultado externo (tangible) + el estado interno (cómo se sentirá).
- La fórmula de venta: a quién ayudas + a hacer qué + cómo + en qué tiempo.
- El precio debe estar justificado por el valor entregado, no por el miedo a vender caro.
- Los primeros clientes deben ser reales y concretos (nombres de personas reales).
- La estrategia de lanzamiento debe ser realista para su nivel de audiencia.

ESTRUCTURA DEL BRIEF (usa este formato exacto con estos encabezados en markdown):

## 📋 Resumen del proyecto
[2-3 frases que resuman quién es, qué vende y a quién. Lo que el setter necesita saber en 30 segundos.]

## ✅ Lo que está bien definido
[Puntos fuertes concretos del workbook. Sé específico. Máximo 3-4 bullets.]

## ⚠️ Gaps y errores detectados
[Errores o partes flojas identificados contra la metodología FC. Sé concreto y directo. Máximo 4-5 bullets. Si algo no está rellenado, indícalo.]

## 🎯 Preguntas clave para la llamada
[5-7 preguntas concretas que el setter debe hacer en la llamada para profundizar en los gaps o cerrar el plan de acción. Preguntas abiertas, en segunda persona.]

## 💡 Contexto adicional para el setter
[1-2 observaciones de tono o approach recomendado para la llamada basándote en su perfil y motivación.]

Sé directo, concreto y útil. Evita generalidades. Si un campo está vacío, menciónalo como un gap. Escribe en español de España.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("[correct-workbook] Claude error:", JSON.stringify(data));
      return { statusCode: 500, body: JSON.stringify({ error: data.error?.message || "Claude error" }) };
    }

    const brief = data.content?.[0]?.text || "";
    return { statusCode: 200, body: JSON.stringify({ brief }) };
  } catch (err) {
    console.error("[correct-workbook] Error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
  }
};
