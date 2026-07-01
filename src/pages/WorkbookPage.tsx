import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useState, useCallback, useEffect } from "react";
import { FormField } from "../components/FormField";
import { debounce } from "../utils/debounce";
import { useNavigate } from "react-router-dom";
import { submitWorkbook, calculateCompletionPercentage } from "../services/firestoreService";

const INTER  = "'Montserrat', 'Inter', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

// ── Thin section divider ──────────────────────────────────────────────────────
const Section = ({ title, description }: { title: string; description?: string }) => (
  <div style={{ marginTop: "56px", marginBottom: "36px" }}>
    <div style={{ height: "1px", background: "#E5E5E5", marginBottom: "24px" }} />
    <p style={{ fontFamily: INTER, fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", margin: 0 }}>
      {title}
    </p>
    {description && (
      <p style={{ fontFamily: INTER, fontSize: "13px", color: "#A1A1AA", margin: "6px 0 0", lineHeight: 1.5 }}>
        {description}
      </p>
    )}
  </div>
);

// ── Workbook question with examples ──────────────────────────────────────────
interface QuestionProps {
  number: number;
  title: string;
  hint?: string;
  intro?: string;
  examples?: string[];
  outro?: string;
  children: React.ReactNode;
}
const Question = ({ number, title, hint, intro, examples, outro, children }: QuestionProps) => (
  <div style={{ marginBottom: "48px" }}>
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", gap: "10px", alignItems: "baseline", marginBottom: hint ? "6px" : "0" }}>
        <span style={{ fontSize: "12px", fontWeight: 800, color: ACCENT, fontFamily: INTER, flexShrink: 0 }}>{number}.</span>
        <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0, lineHeight: 1.4, fontFamily: INTER }}>
          {title}
        </p>
      </div>
      {hint && (
        <p style={{ fontSize: "13px", fontStyle: "italic", color: "#A1A1AA", margin: "4px 0 0 22px", lineHeight: 1.55, fontFamily: INTER }}>
          {hint}
        </p>
      )}
    </div>

    {(intro || examples?.length || outro) && (
      <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
        {intro && <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.6, fontFamily: INTER }}>{intro}</p>}
        {examples?.map((ex, i) => (
          <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 6px", lineHeight: 1.6, fontFamily: INTER }}>
            · "{ex}"
          </p>
        ))}
        {outro && <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: (intro || examples?.length) ? "12px 0 0" : "0", lineHeight: 1.6, fontFamily: INTER }}>{outro}</p>}
      </div>
    )}

    {children}
  </div>
);

export const WorkbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workbook, updateField } = useWorkbook(user?.uid);
  const [currentDay, setCurrentDay] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [localData, setLocalData] = useState(workbook?.data || null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const debouncedUpdate = useCallback(
    debounce((fieldPath: string, value: string, data: any) => {
      updateField(fieldPath, value, data);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 1000),
    [updateField]
  );

  useEffect(() => {
    if (workbook?.data && !localData) setLocalData(workbook.data);
  }, [workbook?.data, localData]);

  const handleFieldChange = (fieldPath: string, value: string) => {
    if (!localData) return;
    const keys = fieldPath.split(".");
    const newData = JSON.parse(JSON.stringify(localData));
    let cur: any = newData;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    setLocalData(newData);
    debouncedUpdate(`data.${fieldPath}`, value, newData);
  };

  const handleSubmit = async () => {
    if (!workbook) return;
    setSubmitting(true);
    try {
      await submitWorkbook(workbook.id);
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!workbook || !localData) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: INTER, color: "#3F3F46", fontSize: "14px" }}>Cargando…</span>
      </div>
    );
  }

  const pct = localData ? calculateCompletionPercentage(localData) : workbook.completionPercentage;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: INTER }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: BG }}>

        {/* 1px progress bar */}
        <div style={{ height: "2px", background: "#E5E5E5" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
        </div>

        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 32px" }}>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: ACCENT }}>Workbook</span>
              <span style={{ color: "#D4D4D0", fontSize: "14px" }}>·</span>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#111111" }}>Reto 3K</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", opacity: saveStatus === "saved" ? 1 : 0, transition: "opacity .3s" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke={ACCENT} strokeWidth="1.5" />
                <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "12px", color: ACCENT }}>Guardado</span>
            </div>
          </div>

          {/* Day tabs */}
          <div style={{ display: "flex", gap: "0", marginTop: "12px" }}>
            {[["Día 0", "Visión"], ["Día 1", "Las Bases"], ["Día 2", "Estrategia"]].map(([day, sub], i) => (
              <button
                key={i}
                onClick={() => setCurrentDay(i)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "10px 20px 10px 0",
                  marginRight: "8px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${currentDay === i ? ACCENT : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: INTER,
                  gap: "1px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: currentDay === i ? 700 : 500, color: currentDay === i ? "#111111" : "#A1A1AA", transition: "color .15s" }}>
                  {day}
                </span>
                <span style={{ fontSize: "11px", color: currentDay === i ? ACCENT : "#C4C4BC", transition: "color .15s" }}>
                  {sub}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Bottom border of header */}
        <div style={{ height: "1px", background: "#E5E5E5", marginTop: "0" }} />
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "56px 32px 120px" }}>

        {/* ── Day 0 ── */}
        {currentDay === 0 && (
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#111111", letterSpacing: "-.03em", margin: "0 0 8px" }}>
              Visión
            </h2>
            <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 48px", lineHeight: 1.6, fontFamily: INTER }}>
              El punto de partida. Cuanto más honesto seas aquí, más útil será todo lo demás.
            </p>

            <Question
              number={1}
              title="¿Por qué quieres construir un modelo recurrente?"
              hint="Cuanto más honesto seas aquí, más útil será todo lo demás."
              intro="Si te ayuda, así responden otros profesionales:"
              examples={[
                "Porque mi agenda está llena y no puedo coger más clientes sin trabajar más horas. Quiero ganar más sin tener que estar disponible todo el día.",
                "Porque facturo bien algunos meses pero otros caigo en picado. Quiero saber cuánto voy a ganar antes de que empiece el mes.",
                "Porque llevo dos años haciendo lanzamientos y cada uno me deja agotado. Necesito un modelo que no dependa de hacer un lanzamiento cada trimestre.",
                "Porque ya intenté lanzar una membresía y no funcionó. Quiero entender qué hice mal y hacerlo bien esta vez.",
                "Porque quiero más tiempo con mi familia y libertad real. Sin que el negocio dependa de que yo esté delante.",
              ]}
              outro="Tu respuesta no tiene que parecerse a ninguna. Pero si lees estas y reconoces algo, ya tienes por dónde empezar."
            >
              <FormField
                label="Tu respuesta"
                value={localData.day0.motivation}
                onChange={(v) => handleFieldChange("day0.motivation", v)}
                type="textarea"
              />
            </Question>

            <Question
              number={2}
              title="¿Cuánto te gustaría facturar de forma recurrente cada mes? (tu MRH soñado)"
              hint="MRH = Monthly Recurring Happiness = ingresos recurrentes cada mes. No la cifra que crees realista en tu situación actual, sino la que de verdad cambiaría tu vida."
              intro='Ejemplo: "5.000€ recurrentes al mes. No por el dinero en sí, sino porque a esa cifra puedo dejar de coger clientes que no me llenan, bloquear los viernes para mí, y saber que aunque me ponga enfermo/a una semana entera el ingreso entra igual. Es la cifra a la que dejo de vender mi tiempo por horas y empiezo a construir algo que es mío."'
              outro="Tu cifra puede ser 2.000€ o 20.000€. Lo importante no es el número, es qué pasa en tu vida cuando llega."
            >
              <FormField
                label="Tu MRH soñado"
                value={localData.day0.mrh || ""}
                onChange={(v) => handleFieldChange("day0.mrh", v)}
                type="textarea"
              />
            </Question>

            <Question
              number={3}
              title="¿Cómo sería un día tuyo cuando ya tengas ese MRH funcionando?"
              hint="A las 9:00 estoy haciendo... A las 12:00... Por la tarde... Por la noche... Quiero ver tu vida concreta cuando llegues ahí."
            >
              <FormField
                label="Tu día ideal"
                value={localData.day0.idealDay}
                onChange={(v) => handleFieldChange("day0.idealDay", v)}
                type="textarea"
              />
            </Question>
          </div>
        )}

        {/* ── Day 1 ── */}
        {currentDay === 1 && (
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: 300, color: "#111111", letterSpacing: "-.03em", margin: "0 0 8px" }}>
              Las Bases
            </h2>
            <p style={{ fontSize: "14px", color: "#52525B", margin: "0 0 48px", lineHeight: 1.6 }}>
              Claridad, promesa y estructura de tu membresía.
            </p>

            <FormField
              label="Nombre de la membresía"
              value={localData.day1.membresiaName || ""}
              onChange={(v) => handleFieldChange("day1.membresiaName", v)}
            />

            <Section title="Avatar Psicológico" description="¿A quién le estás hablando?" />
            <FormField label="Edad" value={localData.day1.avatar.age || ""} onChange={(v) => handleFieldChange("day1.avatar.age", v)} type="number" />
            <FormField label="Le preocupa sobre todo..." value={localData.day1.avatar.concerns || ""} onChange={(v) => handleFieldChange("day1.avatar.concerns", v)} type="textarea" />
            <FormField label="Siente que..." value={localData.day1.avatar.feelings || ""} onChange={(v) => handleFieldChange("day1.avatar.feelings", v)} type="textarea" />
            <FormField label="Sueña con..." value={localData.day1.avatar.dreams || ""} onChange={(v) => handleFieldChange("day1.avatar.dreams", v)} type="textarea" />
            <FormField label="Pero ahora mismo..." value={localData.day1.avatar.currentSituation || ""} onChange={(v) => handleFieldChange("day1.avatar.currentSituation", v)} type="textarea" />
            <FormField label="Frase del Avatar — una frase que lo representa" value={localData.day1.avatarPhrase || ""} onChange={(v) => handleFieldChange("day1.avatarPhrase", v)} type="textarea" />

            <Section title="Promesa" description="La transformación que ofrecés." />
            <FormField label="Transformación prolongada" value={localData.day1.promise.transformation || ""} onChange={(v) => handleFieldChange("day1.promise.transformation", v)} type="textarea" />
            <FormField label="¿A quién ayudás a conseguir qué?" value={localData.day1.promise.statement || ""} onChange={(v) => handleFieldChange("day1.promise.statement", v)} type="textarea" />

            <Section title="Estructura Mínima Viable" description="Lo mínimo necesario para arrancar." />
            <FormField label="Soporte — ¿cómo acompañarás a tus miembros?" value={localData.day1.structure.support || ""} onChange={(v) => handleFieldChange("day1.structure.support", v)} type="textarea" />
            <FormField label="Contenido — ¿qué entregás y cuándo?" value={localData.day1.structure.content || ""} onChange={(v) => handleFieldChange("day1.structure.content", v)} type="textarea" />
            <FormField label="Comunidad — ¿cómo conectás a los miembros?" value={localData.day1.structure.community || ""} onChange={(v) => handleFieldChange("day1.structure.community", v)} type="textarea" />
            <FormField label="Bonus — ¿cómo sabrán que están avanzando?" value={localData.day1.structure.bonus || ""} onChange={(v) => handleFieldChange("day1.structure.bonus", v)} type="textarea" />

            <Section title="Precio" />
            <FormField label="¿Qué precio mensual tiene sentido para vos y tu cliente?" value={localData.day1.price || ""} onChange={(v) => handleFieldChange("day1.price", v)} type="number" />
          </div>
        )}

        {/* ── Day 2 ── */}
        {currentDay === 2 && (
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: 300, color: "#111111", letterSpacing: "-.03em", margin: "0 0 8px" }}>
              Estrategia de Venta
            </h2>
            <p style={{ fontSize: "14px", color: "#52525B", margin: "0 0 48px", lineHeight: 1.6 }}>
              Precio anual, propuesta única y plan de lanzamiento.
            </p>

            <FormField label="¿Cuál será el precio anual de tu membresía? ¿Por qué?" value={localData.day2.annualPrice || ""} onChange={(v) => handleFieldChange("day2.annualPrice", v)} type="textarea" />
            <FormField label="Sabiendo todo lo que sabés ahora, ¿qué cambiarías del Día 1?" value={localData.day2.changes || ""} onChange={(v) => handleFieldChange("day2.changes", v)} type="textarea" />
            <FormField label="¿Por qué vos? ¿Qué hace única tu propuesta?" value={localData.day2.uniqueProposal || ""} onChange={(v) => handleFieldChange("day2.uniqueProposal", v)} type="textarea" />
            <FormField label="¿Cómo será la estrategia anual para vender la membresía?" value={localData.day2.annualStrategy || ""} onChange={(v) => handleFieldChange("day2.annualStrategy", v)} type="textarea" />
            <FormField label="Estrategia de lanzamiento — ¿cómo harás esa primera impresión?" value={localData.day2.launchStrategy || ""} onChange={(v) => handleFieldChange("day2.launchStrategy", v)} type="textarea" />
          </div>
        )}
      </div>

      {/* ── Bottom navigation ──────────────────────────────────────────────── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(250,250,249,.92)", backdropFilter: "blur(12px)", borderTop: "1px solid #E5E5E5", zIndex: 30 }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Left: completion */}
          <span style={{ fontSize: "12px", color: "#A1A1AA", fontVariantNumeric: "tabular-nums", fontFamily: INTER }}>
            {pct}% completado
          </span>

          {/* Right: nav buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              disabled={currentDay === 0}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "1px solid #E5E5E5",
                borderRadius: "6px",
                color: currentDay === 0 ? "#D4D4D0" : "#A1A1AA",
                fontSize: "13px",
                fontWeight: 600,
                cursor: currentDay === 0 ? "not-allowed" : "pointer",
                fontFamily: INTER,
                transition: "color .15s, border-color .15s",
              }}
            >
              Anterior
            </button>

            {currentDay < 2 ? (
              <button
                onClick={() => setCurrentDay(Math.min(2, currentDay + 1))}
                style={{
                  padding: "8px 20px",
                  background: "#111111",
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: INTER,
                  letterSpacing: ".01em",
                }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "8px 20px",
                  background: submitting ? "#E5E5E5" : ACCENT,
                  border: "none",
                  borderRadius: "6px",
                  color: submitting ? "#A1A1AA" : "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: INTER,
                  transition: "background .2s",
                }}
              >
                {submitting ? "Enviando…" : "Enviar Workbook"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
