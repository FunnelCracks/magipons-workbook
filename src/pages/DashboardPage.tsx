import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "6px", fontFamily: MONT }}>
      {label}
    </div>
    <div style={{ fontSize: "14px", color: value ? "#111111" : "#D1D1CB", lineHeight: 1.65, fontFamily: MONT }}>
      {value || "Sin completar"}
    </div>
  </div>
);

const SectionDivider = ({ label }: { label: string }) => (
  <div style={{ margin: "32px 0 20px" }}>
    <div style={{ height: "1px", background: "#E5E5E5", marginBottom: "12px" }} />
    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", fontFamily: MONT }}>
      {label}
    </span>
  </div>
);

const DayBlock = ({ day, subtitle, children }: { day: string; subtitle: string; children: React.ReactNode }) => (
  <div style={{ marginTop: "48px" }}>
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111111", margin: "0 0 2px", letterSpacing: "-.01em", fontFamily: MONT }}>{day}</h2>
      <p style={{ fontSize: "12px", color: "#A1A1AA", margin: 0, fontFamily: MONT }}>{subtitle}</p>
    </div>
    <div style={{ height: "1px", background: "#E5E5E5", margin: "0 0 24px" }} />
    {children}
  </div>
);

export const DashboardPage: React.FC = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { workbook } = useWorkbook(user?.uid);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!workbook) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: MONT, color: "#A1A1AA", fontSize: "14px" }}>Cargando…</p>
      </div>
    );
  }

  const isDone = workbook.status === "submitted";
  const pct    = workbook.completionPercentage || 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: MONT }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: BG, borderBottom: "1px solid #E5E5E5", zIndex: 10 }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#A1A1AA", letterSpacing: ".04em" }}>Reto 3K · Workbook</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
              background: isDone ? "rgba(38,150,106,.08)" : "rgba(0,0,0,.04)",
              color: isDone ? ACCENT : "#A1A1AA",
              border: `1px solid ${isDone ? "rgba(38,150,106,.25)" : "#E5E5E5"}`,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {isDone ? "Enviado" : "En progreso"}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: "7px 14px", background: "none", border: "1px solid #E5E5E5", borderRadius: "8px", color: "#A1A1AA", fontSize: "12px", cursor: "pointer", fontFamily: MONT, fontWeight: 600, transition: "color .15s, border-color .15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#525252"; e.currentTarget.style.borderColor = "#D1D1CB"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#A1A1AA"; e.currentTarget.style.borderColor = "#E5E5E5"; }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* Title + progress */}
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#111111", letterSpacing: "-.03em", margin: "0 0 20px", fontFamily: MONT }}>
            Tu Workbook
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "3px", background: "#E5E5E5", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, borderRadius: "99px", transition: "width .6s ease" }} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: pct > 0 ? ACCENT : "#A1A1AA", fontVariantNumeric: "tabular-nums", flexShrink: 0, fontFamily: MONT }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Day 0 */}
        <DayBlock day="Día 0" subtitle="Visión">
          <Field label="¿Por qué querés tener una membresía?" value={workbook.data.day0.motivation} />
          <Field label="Monthly Recurring Happiness" value={workbook.data.day0.mrh ? `$${workbook.data.day0.mrh}` : undefined} />
          <Field label="Día ideal en tu vida" value={workbook.data.day0.idealDay} />
        </DayBlock>

        {/* Day 1 */}
        <DayBlock day="Día 1" subtitle="Las Bases">
          <Field label="Nombre de la membresía" value={workbook.data.day1.membresiaName} />
          <SectionDivider label="Avatar Psicológico" />
          <Field label="Edad" value={workbook.data.day1.avatar.age} />
          <Field label="Le preocupa sobre todo" value={workbook.data.day1.avatar.concerns} />
          <Field label="Siente que" value={workbook.data.day1.avatar.feelings} />
          <Field label="Sueña con" value={workbook.data.day1.avatar.dreams} />
          <Field label="Pero ahora mismo" value={workbook.data.day1.avatar.currentSituation} />
          <Field label="Frase del Avatar" value={workbook.data.day1.avatarPhrase} />
          <SectionDivider label="Promesa" />
          <Field label="Transformación prolongada" value={workbook.data.day1.promise.transformation} />
          <Field label="¿A quién ayudás a conseguir qué?" value={workbook.data.day1.promise.statement} />
          <SectionDivider label="Estructura Mínima Viable" />
          <Field label="Soporte" value={workbook.data.day1.structure.support} />
          <Field label="Contenido" value={workbook.data.day1.structure.content} />
          <Field label="Comunidad" value={workbook.data.day1.structure.community} />
          <Field label="Bonus" value={workbook.data.day1.structure.bonus} />
          <SectionDivider label="Precio" />
          <Field label="Precio mensual" value={workbook.data.day1.price ? `$${workbook.data.day1.price}` : undefined} />
        </DayBlock>

        {/* Day 2 */}
        <DayBlock day="Día 2" subtitle="Estrategia de Venta">
          <Field label="Precio anual" value={workbook.data.day2.annualPrice} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única" value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual" value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento" value={workbook.data.day2.launchStrategy} />
        </DayBlock>

        {/* Actions */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #E5E5E5", display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/workbook/day0")}
            style={{ padding: "10px 22px", background: "#111111", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: MONT, letterSpacing: ".02em", transition: "background .2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#222222"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111111"; }}
          >
            Editar Workbook
          </button>
        </div>

      </div>
    </div>
  );
};
