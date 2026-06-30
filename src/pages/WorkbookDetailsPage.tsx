import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import type { Workbook } from "../services/types";

const COBALT = "#3751C4";
const BORDER = "#D8D9E4";

const s = {
  page: { minHeight: "100vh", background: "#EDEDF2", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" } as React.CSSProperties,
  header: { background: "#fff", borderBottom: `1.5px solid ${BORDER}`, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
  headerTitle: { fontSize: "20px", fontWeight: 900, color: "#111827", letterSpacing: "-.02em" } as React.CSSProperties,
  headerSub: { fontSize: "12px", color: "#6C739B", marginTop: "2px" } as React.CSSProperties,
  backBtn: { padding: "8px 16px", border: `1.5px solid ${BORDER}`, borderRadius: "8px", background: "transparent", color: "#6C739B", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" } as React.CSSProperties,
  body: { maxWidth: "800px", margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column" as const, gap: "16px" },
  card: { background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" } as React.CSSProperties,
  cardTitle: { fontSize: "13px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" as const, color: COBALT, marginBottom: "16px" } as React.CSSProperties,
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" } as React.CSSProperties,
  infoItem: {} as React.CSSProperties,
  infoLabel: { fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#6C739B", marginBottom: "4px" } as React.CSSProperties,
  infoVal: { fontSize: "14px", color: "#111827", fontWeight: 500 } as React.CSSProperties,
  pill: (done: boolean) => ({
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
    background: done ? "#DCFCE7" : "#FEF3C7",
    color: done ? "#0F7550" : "#A16207",
  }) as React.CSSProperties,
  pctWrap: { display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties,
  pctTrack: { flex: 1, height: "6px", background: "#E8E8F0", borderRadius: "3px", overflow: "hidden" } as React.CSSProperties,
  field: { marginBottom: "16px" } as React.CSSProperties,
  fieldLabel: { fontSize: "12px", fontWeight: 700, color: "#6C739B", marginBottom: "6px" } as React.CSSProperties,
  fieldVal: { background: "#F7F7FB", border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "10px 14px", fontSize: "13px", color: "#111827", lineHeight: 1.5, minHeight: "40px" } as React.CSSProperties,
  subGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } as React.CSSProperties,
  subItem: { background: "#F7F7FB", border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "10px 14px" } as React.CSSProperties,
  subLabel: { fontSize: "10px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#A8ADCA", marginBottom: "4px" } as React.CSSProperties,
  subVal: { fontSize: "13px", color: "#111827" } as React.CSSProperties,
  loading: { minHeight: "100vh", background: "#EDEDF2", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
};

function pctBarColor(p: number) {
  if (p >= 70) return "#0F7550";
  if (p >= 30) return "#A16207";
  return "#DC2626";
}

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div style={s.field}>
    <div style={s.fieldLabel}>{label}</div>
    <div style={s.fieldVal}>{value || <span style={{ color: "#A8ADCA" }}>Sin completar</span>}</div>
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

  if (loading) return <div style={s.loading}><p style={{ color: "#6C739B" }}>Cargando…</p></div>;
  if (!workbook) return null;

  const isDone = workbook.status === "submitted";
  const pct = workbook.completionPercentage || 0;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Detalle del Workbook</div>
          <div style={s.headerSub}>{workbook.userName || workbook.userEmail || "Participante"}</div>
        </div>
        <button
          style={s.backBtn}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = COBALT; e.currentTarget.style.color = COBALT; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#6C739B"; }}
          onClick={() => navigate("/admin/dashboard")}
        >
          ← Volver al Dashboard
        </button>
      </div>

      <div style={s.body}>
        {/* Info general */}
        <div style={s.card}>
          <div style={s.cardTitle}>Información General</div>
          <div style={s.infoGrid}>
            <div style={s.infoItem}>
              <div style={s.infoLabel}>Email</div>
              <div style={s.infoVal}>{workbook.userEmail || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoLabel}>Nombre</div>
              <div style={s.infoVal}>{workbook.userName || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoLabel}>Estado</div>
              <span style={s.pill(isDone)}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {isDone ? "Completado" : "En progreso"}
              </span>
            </div>
            <div style={s.infoItem}>
              <div style={s.infoLabel}>Completado</div>
              <div style={s.pctWrap}>
                <span style={{ fontWeight: 800, color: "#111827" }}>{pct}%</span>
                <div style={s.pctTrack}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pctBarColor(pct), borderRadius: "3px" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Día 0 */}
        <div style={s.card}>
          <div style={s.cardTitle}>Día 0 — Visión</div>
          <Field label="¿Por qué quieres tener una membresía?" value={workbook.data.day0.motivation} />
          <Field label="Monthly Recurring Happiness (MRH)" value={workbook.data.day0.mrh ? `$${workbook.data.day0.mrh}` : undefined} />
          <Field label="Día ideal en tu vida" value={workbook.data.day0.idealDay} />
        </div>

        {/* Día 1 */}
        <div style={s.card}>
          <div style={s.cardTitle}>Día 1 — Las Bases</div>
          <Field label="Nombre de la membresía" value={workbook.data.day1.membresiaName} />

          <div style={s.fieldLabel}>Avatar Psicológico</div>
          <div style={{ ...s.subGrid, marginBottom: "16px" }}>
            {[
              { label: "Edad", val: workbook.data.day1.avatar.age },
              { label: "Le preocupa", val: workbook.data.day1.avatar.concerns },
              { label: "Siente que", val: workbook.data.day1.avatar.feelings },
              { label: "Sueña con", val: workbook.data.day1.avatar.dreams },
            ].map(({ label, val }) => (
              <div key={label} style={s.subItem}>
                <div style={s.subLabel}>{label}</div>
                <div style={s.subVal}>{val || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
              </div>
            ))}
          </div>
          <Field label="Situación actual" value={workbook.data.day1.avatar.currentSituation} />
          <Field label="Frase del avatar" value={workbook.data.day1.avatarPhrase} />

          <div style={s.fieldLabel}>Promesa</div>
          <div style={{ ...s.subGrid, marginBottom: "16px" }}>
            <div style={s.subItem}>
              <div style={s.subLabel}>Transformación</div>
              <div style={s.subVal}>{workbook.data.day1.promise.transformation || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
            </div>
            <div style={s.subItem}>
              <div style={s.subLabel}>Statement</div>
              <div style={s.subVal}>{workbook.data.day1.promise.statement || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
            </div>
          </div>

          <div style={s.fieldLabel}>Estructura Mínima Viable</div>
          <div style={{ ...s.subGrid, marginBottom: "16px" }}>
            {[
              { label: "Soporte", val: workbook.data.day1.structure.support },
              { label: "Contenido", val: workbook.data.day1.structure.content },
              { label: "Comunidad", val: workbook.data.day1.structure.community },
              { label: "Bonus", val: workbook.data.day1.structure.bonus },
            ].map(({ label, val }) => (
              <div key={label} style={s.subItem}>
                <div style={s.subLabel}>{label}</div>
                <div style={s.subVal}>{val || <span style={{ color: "#A8ADCA" }}>—</span>}</div>
              </div>
            ))}
          </div>

          <Field label="Precio mensual" value={workbook.data.day1.price ? `$${workbook.data.day1.price}` : undefined} />
        </div>

        {/* Día 2 */}
        <div style={s.card}>
          <div style={s.cardTitle}>Día 2 — Estrategia de Venta</div>
          <Field label="Precio anual" value={workbook.data.day2.annualPrice ? `$${workbook.data.day2.annualPrice}` : undefined} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única" value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual" value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento" value={workbook.data.day2.launchStrategy} />
        </div>
      </div>
    </div>
  );
};
