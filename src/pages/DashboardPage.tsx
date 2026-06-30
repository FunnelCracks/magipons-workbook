import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

const ACCENT = "#26966a";
const BG     = "#0C0F0E";
const BORDER = "#263029";
const TEXT_H = "#E8F0EB";
const TEXT   = "#B8C4BE";
const TEXT_M = "#4A5F55";

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: TEXT_M, marginBottom: "6px" }}>
      {label}
    </div>
    <div style={{ fontSize: "14px", color: value ? TEXT : TEXT_M, lineHeight: 1.65 }}>
      {value || "Sin completar"}
    </div>
  </div>
);

const Divider = ({ label }: { label: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "36px 0 24px" }}>
    <div style={{ width: "20px", height: "1px", background: ACCENT, flexShrink: 0 }} />
    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, flexShrink: 0 }}>{label}</span>
    <div style={{ height: "1px", flex: 1, background: BORDER }} />
  </div>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workbook } = useWorkbook(user?.uid);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!workbook) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: TEXT_M, fontFamily: "system-ui, sans-serif", fontSize: "14px" }}>Cargando…</span>
      </div>
    );
  }

  const isDone = workbook.status === "submitted";
  const pct = workbook.completionPercentage || 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontSize: "14px" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: TEXT_M }}>Reto 3K · Workbook</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
              background: isDone ? "rgba(38,150,106,.15)" : "rgba(161,98,7,.15)",
              color: isDone ? ACCENT : "#A16207",
              border: `1px solid ${isDone ? "rgba(38,150,106,.3)" : "rgba(161,98,7,.3)"}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {isDone ? "Enviado" : "En progreso"}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: "7px 14px", background: "none", border: `1px solid ${BORDER}`, borderRadius: "3px", color: TEXT_M, fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Title + completion */}
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 300, color: TEXT_H, letterSpacing: "-.03em", margin: "0 0 20px" }}>
            Tu Workbook
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "2px", background: "#1A211E", borderRadius: "1px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, borderRadius: "1px", transition: "width .5s ease" }} />
            </div>
            <span style={{ fontSize: "12px", color: TEXT_M, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{pct}% completado</span>
          </div>
        </div>

        {/* Day 0 */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 400, color: TEXT_H, letterSpacing: "-.01em", margin: "0 0 4px" }}>Día 0</h2>
          <p style={{ fontSize: "12px", color: TEXT_M, margin: "0 0 4px" }}>Visión</p>
          <div style={{ height: "1px", background: BORDER, margin: "16px 0 24px" }} />

          <Field label="¿Por qué querés tener una membresía?" value={workbook.data.day0.motivation} />
          <Field label="Monthly Recurring Happiness" value={workbook.data.day0.mrh ? `$${workbook.data.day0.mrh}` : undefined} />
          <Field label="Día ideal en tu vida" value={workbook.data.day0.idealDay} />
        </div>

        {/* Day 1 */}
        <div style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 400, color: TEXT_H, letterSpacing: "-.01em", margin: "0 0 4px" }}>Día 1</h2>
          <p style={{ fontSize: "12px", color: TEXT_M, margin: "0 0 4px" }}>Las Bases</p>
          <div style={{ height: "1px", background: BORDER, margin: "16px 0 24px" }} />

          <Field label="Nombre de la membresía" value={workbook.data.day1.membresiaName} />

          <Divider label="Avatar Psicológico" />
          <Field label="Edad" value={workbook.data.day1.avatar.age} />
          <Field label="Le preocupa sobre todo" value={workbook.data.day1.avatar.concerns} />
          <Field label="Siente que" value={workbook.data.day1.avatar.feelings} />
          <Field label="Sueña con" value={workbook.data.day1.avatar.dreams} />
          <Field label="Pero ahora mismo" value={workbook.data.day1.avatar.currentSituation} />
          <Field label="Frase del Avatar" value={workbook.data.day1.avatarPhrase} />

          <Divider label="Promesa" />
          <Field label="Transformación prolongada" value={workbook.data.day1.promise.transformation} />
          <Field label="¿A quién ayudás a conseguir qué?" value={workbook.data.day1.promise.statement} />

          <Divider label="Estructura Mínima Viable" />
          <Field label="Soporte" value={workbook.data.day1.structure.support} />
          <Field label="Contenido" value={workbook.data.day1.structure.content} />
          <Field label="Comunidad" value={workbook.data.day1.structure.community} />
          <Field label="Bonus" value={workbook.data.day1.structure.bonus} />

          <Divider label="Precio" />
          <Field label="Precio mensual" value={workbook.data.day1.price ? `$${workbook.data.day1.price}` : undefined} />
        </div>

        {/* Day 2 */}
        <div style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 400, color: TEXT_H, letterSpacing: "-.01em", margin: "0 0 4px" }}>Día 2</h2>
          <p style={{ fontSize: "12px", color: TEXT_M, margin: "0 0 4px" }}>Estrategia de Venta</p>
          <div style={{ height: "1px", background: BORDER, margin: "16px 0 24px" }} />

          <Field label="Precio anual" value={workbook.data.day2.annualPrice} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única" value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual" value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento" value={workbook.data.day2.launchStrategy} />
        </div>

        {/* Actions */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/workbook/day0")}
            style={{ padding: "10px 24px", background: ACCENT, border: "none", borderRadius: "3px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Editar Workbook
          </button>
        </div>
      </div>
    </div>
  );
};
