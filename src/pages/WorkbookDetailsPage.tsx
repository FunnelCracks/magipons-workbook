import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import type { Workbook } from "../services/types";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";
const BORDER = "#E5E5E5";

function pctBarColor(p: number) {
  if (p >= 70) return ACCENT;
  if (p >= 30) return "#D97706";
  return "#E5E5E5";
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div style={{ marginBottom: "14px" }}>
    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "6px", fontFamily: MONT }}>
      {label}
    </div>
    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#111111", lineHeight: 1.55, minHeight: "40px", fontFamily: MONT }}>
      {value || <span style={{ color: "#D1D1CB" }}>Sin completar</span>}
    </div>
  </div>
);


export const WorkbookDetailsPage: React.FC = () => {
  const { workbookId } = useParams<{ workbookId: string }>();
  const navigate = useNavigate();
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workbookId) { navigate("/admin/dashboard"); return; }
    getDoc(doc(db, "workbooks", workbookId)).then((snap) => {
      if (snap.exists()) setWorkbook({ id: snap.id, ...snap.data() } as Workbook);
      else navigate("/admin/dashboard");
    }).catch(() => navigate("/admin/dashboard"))
      .finally(() => setLoading(false));
  }, [workbookId, navigate]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: MONT, color: "#A1A1AA", fontSize: "14px" }}>Cargando…</p>
    </div>
  );
  if (!workbook) return null;

  const isDone = workbook.status === "submitted";
  const pct    = workbook.completionPercentage || 0;
  const fullName = (workbook.userFirstName && workbook.userLastName)
    ? `${workbook.userFirstName} ${workbook.userLastName}`
    : (workbook.userName || workbook.userEmail || "Participante");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: MONT }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#111111", letterSpacing: "-.02em" }}>Detalle del Workbook</div>
          <div style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "2px", fontWeight: 600 }}>{fullName}</div>
        </div>
        <button
          onClick={() => navigate("/admin/dashboard")}
          style={{ padding: "7px 14px", border: `1px solid ${BORDER}`, borderRadius: "8px", background: "transparent", color: "#A1A1AA", fontSize: "12px", cursor: "pointer", fontFamily: MONT, fontWeight: 600, transition: "color .15s, border-color .15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#525252"; e.currentTarget.style.borderColor = "#D1D1CB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#A1A1AA"; e.currentTarget.style.borderColor = BORDER; }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* Info general */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Información General</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "4px" }}>Email</div>
              <div style={{ fontSize: "14px", color: "#111111", fontWeight: 600 }}>{workbook.userEmail || <span style={{ color: "#D1D1CB" }}>—</span>}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "4px" }}>Nombre</div>
              <div style={{ fontSize: "14px", color: "#111111", fontWeight: 600 }}>{fullName}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "6px" }}>Estado</div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                background: isDone ? "rgba(38,150,106,.1)" : "rgba(217,119,6,.1)",
                color: isDone ? ACCENT : "#D97706",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {isDone ? "Completado" : "En progreso"}
              </span>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "6px" }}>Completado</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontWeight: 800, color: pct > 0 ? "#111111" : "#A1A1AA", fontVariantNumeric: "tabular-nums", fontSize: "14px" }}>{pct}%</span>
                <div style={{ flex: 1, height: "4px", background: BORDER, borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pctBarColor(pct), borderRadius: "99px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Día 0 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 0 — Visión</div>
          <Field label="¿Por qué quieres tener una membresía?" value={workbook.data.day0.motivation} />
          <Field label="Monthly Recurring Happiness (MRH)" value={workbook.data.day0.mrh ? `$${workbook.data.day0.mrh}` : undefined} />
          <Field label="Día ideal en tu vida" value={workbook.data.day0.idealDay} />
          <Field label="Situación actual" value={workbook.data.day0.situacion || undefined} />
          <Field label="¿En qué rango facturas hoy?" value={workbook.data.day0.facturacionRango || undefined} />
        </div>

        {/* Día 1 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 1 — Las Bases</div>
          <Field label="Nombre del modelo" value={workbook.data.day1.modelName} />
          <Field label="Avatar psicológico" value={workbook.data.day1.avatarDescription} />
          <Field label="Nivel de consciencia" value={workbook.data.day1.consciousnessLevel} />
          <Field label="Frases del cliente" value={workbook.data.day1.clientPhrases} />
          <Field label="Transformación prolongada" value={workbook.data.day1.transformation} />
          <Field label="Fórmula de promesa" value={workbook.data.day1.formula} />
          <Field label="Modelo elegido" value={workbook.data.day1.modelType} />
          <Field label="¿Por qué ese modelo?" value={workbook.data.day1.modelReason} />
          <Field label="Soporte" value={workbook.data.day1.support} />
          <Field label="Contenido" value={workbook.data.day1.content} />
          <Field label="Comunidad" value={workbook.data.day1.community} />
          <Field label="Progreso" value={workbook.data.day1.progress} />
          <Field label="Precio" value={workbook.data.day1.price} />
        </div>

        {/* Día 2 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 2 — Estrategia de Venta</div>
          <Field label="Precio anual"              value={workbook.data.day2.annualPrice ? `$${workbook.data.day2.annualPrice}` : undefined} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única"            value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual"           value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento"  value={workbook.data.day2.launchStrategy} />
          <Field label="Migración 1 a 1"            value={workbook.data.day2.migration} />
          {/* Primeros 10 clientes */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#A1A1AA", marginBottom: "8px", fontFamily: MONT }}>Primeros 10 clientes</div>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F5F5F3" }}>
                    <th style={{ width: "32px", padding: "8px 10px", fontSize: "10px", fontWeight: 700, color: "#A1A1AA", textAlign: "center", borderBottom: `1px solid ${BORDER}`, fontFamily: MONT, textTransform: "uppercase" as const }}>#</th>
                    <th style={{ padding: "8px 12px", fontSize: "10px", fontWeight: 700, color: "#A1A1AA", textAlign: "left", borderBottom: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}`, fontFamily: MONT, textTransform: "uppercase" as const }}>Nombre</th>
                    <th style={{ padding: "8px 12px", fontSize: "10px", fontWeight: 700, color: "#A1A1AA", textAlign: "left", borderBottom: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}`, fontFamily: MONT, textTransform: "uppercase" as const }}>Por qué entraría</th>
                  </tr>
                </thead>
                <tbody>
                  {(workbook.data.day2.firstClients || []).map((c: { name: string; reason: string }, i: number) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : BG }}>
                      <td style={{ padding: "7px 10px", fontSize: "11px", color: "#A1A1AA", fontWeight: 700, textAlign: "center", borderBottom: `1px solid #F0F0EE`, fontFamily: MONT }}>{i + 1}</td>
                      <td style={{ padding: "7px 12px", fontSize: "13px", color: c.name ? "#111111" : "#D1D1CB", borderBottom: `1px solid #F0F0EE`, borderLeft: `1px solid ${BORDER}`, fontFamily: MONT }}>{c.name || "—"}</td>
                      <td style={{ padding: "7px 12px", fontSize: "13px", color: c.reason ? "#111111" : "#D1D1CB", borderBottom: `1px solid #F0F0EE`, borderLeft: `1px solid ${BORDER}`, fontFamily: MONT }}>{c.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Día 3 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 3 — IA y Funnel</div>
          <Field label="Hero de landing" value={workbook.data.day3?.landingHero} />
          <Field label="Preguntas setter IA" value={workbook.data.day3?.setterQuestions} />
          <Field label="Herramientas elegidas" value={(workbook.data.day3?.tools || []).join(", ") || undefined} />
        </div>

      </div>
    </div>
  );
};
