import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

const INTER  = "'Inter', system-ui, -apple-system, sans-serif";
const ACCENT = "#26966a";
const BG     = "#0D0D0D";

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div style={{ marginBottom: "20px" }}>
    <div style={{ fontSize: "11px", fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: "#3F3F46", marginBottom: "6px", fontFamily: INTER }}>
      {label}
    </div>
    <div style={{ fontSize: "14px", color: value ? "#A1A1AA" : "#3F3F46", lineHeight: 1.65, fontFamily: INTER }}>
      {value || "Sin completar"}
    </div>
  </div>
);

const SectionDivider = ({ label }: { label: string }) => (
  <div style={{ margin: "36px 0 24px" }}>
    <div style={{ height: "1px", background: "#1C1C1C", marginBottom: "14px" }} />
    <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#3F3F46", fontFamily: INTER }}>
      {label}
    </span>
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
        <span style={{ fontFamily: INTER, color: "#3F3F46", fontSize: "14px" }}>Cargando…</span>
      </div>
    );
  }

  const isDone = workbook.status === "submitted";
  const pct = workbook.completionPercentage || 0;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: INTER }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: BG, borderBottom: "1px solid #161616", zIndex: 10 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "#3F3F46" }}>Reto 3K · Workbook</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "2px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
              background: isDone ? "rgba(38,150,106,.08)" : "rgba(255,255,255,.04)",
              color: isDone ? ACCENT : "#52525B",
              border: `1px solid ${isDone ? "rgba(38,150,106,.2)" : "#262626"}`,
              fontFamily: INTER,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
              {isDone ? "Enviado" : "En progreso"}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ padding: "7px 14px", background: "none", border: "1px solid #262626", borderRadius: "6px", color: "#52525B", fontSize: "12px", cursor: "pointer", fontFamily: INTER, transition: "color .15s, border-color .15s" }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "56px 32px 80px" }}>

        {/* Title + completion */}
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-.03em", margin: "0 0 20px" }}>
            Tu Workbook
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "#1A1A1A", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, transition: "width .5s ease" }} />
            </div>
            <span style={{ fontSize: "12px", color: "#3F3F46", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{pct}%</span>
          </div>
        </div>

        {/* Day 0 */}
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 400, color: "#FFFFFF", margin: "0 0 2px" }}>Día 0</h2>
            <p style={{ fontSize: "12px", color: "#3F3F46", margin: 0 }}>Visión</p>
          </div>
          <div style={{ height: "1px", background: "#1C1C1C", margin: "16px 0 24px" }} />
          <Field label="¿Por qué querés tener una membresía?" value={workbook.data.day0.motivation} />
          <Field label="Monthly Recurring Happiness" value={workbook.data.day0.mrh ? `$${workbook.data.day0.mrh}` : undefined} />
          <Field label="Día ideal en tu vida" value={workbook.data.day0.idealDay} />
        </div>

        {/* Day 1 */}
        <div style={{ marginTop: "48px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 400, color: "#FFFFFF", margin: "0 0 2px" }}>Día 1</h2>
            <p style={{ fontSize: "12px", color: "#3F3F46", margin: 0 }}>Las Bases</p>
          </div>
          <div style={{ height: "1px", background: "#1C1C1C", margin: "16px 0 24px" }} />
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
        </div>

        {/* Day 2 */}
        <div style={{ marginTop: "48px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 400, color: "#FFFFFF", margin: "0 0 2px" }}>Día 2</h2>
            <p style={{ fontSize: "12px", color: "#3F3F46", margin: 0 }}>Estrategia de Venta</p>
          </div>
          <div style={{ height: "1px", background: "#1C1C1C", margin: "16px 0 24px" }} />
          <Field label="Precio anual" value={workbook.data.day2.annualPrice} />
          <Field label="¿Qué cambiarías del Día 1?" value={workbook.data.day2.changes} />
          <Field label="Propuesta única" value={workbook.data.day2.uniqueProposal} />
          <Field label="Estrategia anual" value={workbook.data.day2.annualStrategy} />
          <Field label="Estrategia de lanzamiento" value={workbook.data.day2.launchStrategy} />
        </div>

        {/* Actions */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #1C1C1C", display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/workbook/day0")}
            style={{ padding: "9px 20px", background: ACCENT, border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: INTER }}
          >
            Editar Workbook
          </button>
        </div>
      </div>
    </div>
  );
};
