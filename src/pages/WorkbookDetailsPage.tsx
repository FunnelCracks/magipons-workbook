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

const SubGrid = ({ items }: { items: { label: string; val?: string }[] }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
    {items.map(({ label, val }) => (
      <div key={label} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "10px 14px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#A1A1AA", marginBottom: "4px", fontFamily: MONT }}>{label}</div>
        <div style={{ fontSize: "13px", color: val ? "#111111" : "#D1D1CB", fontFamily: MONT }}>{val || "—"}</div>
      </div>
    ))}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#A1A1AA", marginBottom: "8px", marginTop: "4px", fontFamily: MONT }}>
    {children}
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
        </div>

        {/* Día 1 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 1 — Las Bases</div>
          <Field label="Nombre de la membresía" value={workbook.data.day1.membresiaName} />
          <SectionLabel>Avatar Psicológico</SectionLabel>
          <SubGrid items={[
            { label: "Edad",        val: workbook.data.day1.avatar.age },
            { label: "Le preocupa", val: workbook.data.day1.avatar.concerns },
            { label: "Siente que",  val: workbook.data.day1.avatar.feelings },
            { label: "Sueña con",   val: workbook.data.day1.avatar.dreams },
          ]} />
          <Field label="Situación actual" value={workbook.data.day1.avatar.currentSituation} />
          <Field label="Frase del avatar" value={workbook.data.day1.avatarPhrase} />
          <SectionLabel>Promesa</SectionLabel>
          <SubGrid items={[
            { label: "Transformación", val: workbook.data.day1.promise.transformation },
            { label: "Statement",      val: workbook.data.day1.promise.statement },
          ]} />
          <SectionLabel>Estructura Mínima Viable</SectionLabel>
          <SubGrid items={[
            { label: "Soporte",   val: workbook.data.day1.structure.support },
            { label: "Contenido", val: workbook.data.day1.structure.content },
            { label: "Comunidad", val: workbook.data.day1.structure.community },
            { label: "Bonus",     val: workbook.data.day1.structure.bonus },
          ]} />
          <Field label="Precio mensual" value={workbook.data.day1.price ? `$${workbook.data.day1.price}` : undefined} />
        </div>

        {/* Día 2 */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px" }}>Día 2 — Estrategia de Venta</div>
          <Field label="Precio anual"              value={workbook.data.day2.annualPrice ? `$${workbook.data.day2.annualPrice}` : undefined} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única"            value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual"           value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento"  value={workbook.data.day2.launchStrategy} />
        </div>

      </div>
    </div>
  );
};
