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

// ── Checkbox / Radio options ──────────────────────────────────────────────────
const CheckboxOption = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div
    onClick={onChange}
    style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", border: `1px solid ${checked ? ACCENT : "#E5E5E5"}`, borderRadius: "8px", cursor: "pointer", marginBottom: "8px", background: checked ? "rgba(38,150,106,.05)" : "#fff", transition: "all .15s", userSelect: "none" }}
  >
    <div style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "1px", border: `2px solid ${checked ? ACCENT : "#D1D1CB"}`, borderRadius: "4px", background: checked ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 3L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
    <span style={{ fontSize: "13px", color: "#111111", lineHeight: 1.55, fontFamily: INTER }}>{label}</span>
  </div>
);

const RadioOption = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div
    onClick={onChange}
    style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", border: `1px solid ${checked ? ACCENT : "#E5E5E5"}`, borderRadius: "8px", cursor: "pointer", marginBottom: "8px", background: checked ? "rgba(38,150,106,.05)" : "#fff", transition: "all .15s", userSelect: "none" }}
  >
    <div style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "1px", border: `2px solid ${checked ? ACCENT : "#D1D1CB"}`, borderRadius: "4px", background: checked ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 3L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
    <span style={{ fontSize: "13px", color: "#111111", lineHeight: 1.55, fontFamily: INTER }}>{label}</span>
  </div>
);

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
  number: number | string;
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

  const handleFieldChange = (fieldPath: string, value: any) => {
    if (!localData) return;
    const keys = fieldPath.split(".");
    const newData = JSON.parse(JSON.stringify(localData));
    let cur: any = newData;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    setLocalData(newData);
    debouncedUpdate(`data.${fieldPath}`, value as string, newData);
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

  const d1f = [
    localData.day1?.modelName, localData.day1?.avatarDescription, localData.day1?.consciousnessLevel,
    localData.day1?.clientPhrases, localData.day1?.transformation, localData.day1?.formula,
    localData.day1?.modelType, localData.day1?.modelReason, localData.day1?.support,
    localData.day1?.content, localData.day1?.community, localData.day1?.progress, localData.day1?.price,
  ];
  const d2f = [
    localData.day2?.changes, localData.day2?.uniqueProposal, localData.day2?.annualStrategy,
    localData.day2?.launchStrategy, localData.day2?.migration,
    localData.day2?.firstClients?.find((c: any) => c?.name?.trim())?.name ?? "",
  ];
  const d3f = [
    localData.day3?.landingHero, localData.day3?.setterQuestions,
    (localData.day3?.tools?.length ?? 0) > 0 ? "yes" : "",
  ];
  const filled = (arr: any[]) => arr.filter(f => f && String(f).trim() !== "").length;
  const d1Pct = Math.round(filled(d1f) / d1f.length * 100);
  const d2Pct = Math.round(filled(d2f) / d2f.length * 100);
  const d3Pct = Math.round(filled(d3f) / d3f.length * 100);
  const allFields = [...d1f, ...d2f, ...d3f];
  const bonusProgress = Math.round(filled(allFields) / allFields.length * 100);
  const bonusUnlocked = bonusProgress === 100;

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
              <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: ACCENT }}>Mapa</span>
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
          <div style={{ display: "flex", gap: "0", marginTop: "12px", alignItems: "stretch" }}>
            {[["Día 0", "Visión"], ["Día 1", "Las Bases"], ["Día 2", "Estrategia"], ["Día 3", "IA/Funnel"]].map(([day, sub], i) => (
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

            {/* Separator */}
            <div style={{ width: "1px", background: "#E8E8E5", margin: "8px 10px 2px", flexShrink: 0 }} />

            {/* Bonus Track tab */}
            {bonusUnlocked ? (
              <button
                onClick={() => setCurrentDay(4)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "10px 12px 10px 0", background: "none", border: "none",
                  borderBottom: `2px solid ${currentDay === 4 ? "#D97706" : "transparent"}`,
                  cursor: "pointer", fontFamily: INTER, gap: "1px", transition: "all .15s",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: currentDay === 4 ? 700 : 500, color: "#D97706", display: "flex", alignItems: "center", gap: "5px", transition: "color .15s" }}>
                  <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M6.5 1L1.5 7.5H5L3 12.5L10 6H6.5L8.5 1Z" fill="#D97706"/></svg>
                  Bonus
                </span>
                <span style={{ fontSize: "11px", color: currentDay === 4 ? "#D97706" : "#E8A83A", transition: "color .15s" }}>Track</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentDay(4)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "10px 12px 10px 0", background: "none", border: "none",
                  borderBottom: `2px solid ${currentDay === 4 ? "#D97706" : "transparent"}`,
                  cursor: "pointer", fontFamily: INTER, gap: "1px", transition: "all .15s",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: currentDay === 4 ? 700 : 500, color: "#D97706", display: "flex", alignItems: "center", gap: "5px", transition: "color .15s" }}>
                  <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M6.5 1L1.5 7.5H5L3 12.5L10 6H6.5L8.5 1Z" fill="#D97706"/></svg>
                  Bonus
                </span>
                <span style={{ fontSize: "11px", color: currentDay === 4 ? "#D97706" : "#E8A83A", transition: "color .15s" }}>Track</span>
              </button>
            )}
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
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "4px", fontFamily: INTER }}>
                Día 0
              </div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: ACCENT, letterSpacing: "-.02em", fontFamily: INTER }}>
                Visión
              </div>
            </div>

            <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 6px", lineHeight: 1.6, fontFamily: INTER, fontWeight: 600 }}>
              Cuándo rellenarlo: antes de empezar el Reto, antes del 28 de julio.
            </p>
            <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 48px", lineHeight: 1.6, fontFamily: INTER }}>
              Antes de meternos en nada, vamos a poner foco en por qué estás aquí y qué quieres conseguir realmente. Es el ejercicio más importante del workbook.
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
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿por qué quieres construir un modelo recurrente?
              </p>
              <FormField
                label=""
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
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿cuánto te gustaría facturar cada mes de forma recurrente?
              </p>
              <FormField
                label=""
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
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿cómo sería tu día ideal cuando tengas MRH?
              </p>
              <FormField
                label=""
                value={localData.day0.idealDay}
                onChange={(v) => handleFieldChange("day0.idealDay", v)}
                type="textarea"
              />
            </Question>

            <Question
              number={4}
              title="¿Cuál es tu situación HOY?"
              hint="Marca lo que más se acerque a tu realidad ahora mismo. Si dudas entre dos, marca las dos."
            >
              {[
                "Trabajo 1 a 1 y mi agenda está saturada (sesiones, consultas, mentorías individuales)",
                "Tengo un negocio digital con ingresos irregulares (cursos, lanzamientos, picos de facturación)",
                "Ya tengo una membresía o programa grupal funcionando pero quiero escalarlo",
                "Estoy empezando, todavía no tengo clientes pagando",
                "Otra (especificar abajo)",
              ].map((option) => (
                <RadioOption
                  key={option}
                  label={option}
                  checked={(localData.day0.situacion || "") === option}
                  onChange={() => handleFieldChange("day0.situacion", option)}
                />
              ))}
            </Question>

            <Question
              number={5}
              title="¿En qué rango facturas hoy?"
              hint="Queremos entender tu punto de partida. No queremos evaluarte, queremos entenderte."
            >
              {[
                "Todavía no facturo nada",
                "Menos de 1.000€/mes",
                "Entre 1.000€ y 3.000€/mes",
                "Entre 3.000€ y 10.000€/mes",
                "Entre 10.000€ y 25.000€/mes",
                "Más de 25.000€/mes",
              ].map((option) => (
                <RadioOption
                  key={option}
                  label={option}
                  checked={(localData.day0.facturacionRango || "") === option}
                  onChange={() => handleFieldChange("day0.facturacionRango", option)}
                />
              ))}
            </Question>
          </div>
        )}

        {/* ── Day 1 ── */}
        {currentDay === 1 && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "4px", fontFamily: INTER }}>
                Día 1
              </div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: ACCENT, letterSpacing: "-.02em", fontFamily: INTER }}>
                Claridad y modelo
              </div>
            </div>

            <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 6px", lineHeight: 1.6, fontFamily: INTER, fontWeight: 600 }}>
              Cuándo rellenarlo: después de la Clase 1 (martes 28 julio)
            </p>
            <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 48px", lineHeight: 1.6, fontFamily: INTER }}>
              Hoy te ayudo a poner foco en quién es tu cliente, qué le prometes y qué modelo te conviene. Es el ejercicio más denso del workbook, tómate tu tiempo.
            </p>

            {/* Block label */}
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "40px", fontFamily: INTER }}>
              Bloque 1 · Tu cliente real
            </div>

            {/* 1.1 Nombre del modelo */}
            <Question
              number="1.1"
              title="Nombre tentativo de tu modelo (membresía / programa / ecosistema..)"
              hint='Si no tienes nombre todavía, escribe 3 posibles. Importante: el nombre nunca debería contener las palabras "membresía", "programa" ni "curso". Tu nombre vende el resultado, no el formato.'
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.6, fontFamily: INTER }}>
                  Te dejamos algunos ejemplos si te sirven como inspiración:
                </p>
                {[
                  ['"Cuerpo Estable"', 'nombre concepto: la promesa transformada en idea.'],
                  ['"Hábitos Reales"', 'nombre descriptivo: lo que la persona consigue.'],
                  ['"Plan 365"', 'nombre marca corta: fácil de recordar y de pronunciar.'],
                ].map(([name, desc], i) => (
                  <p key={i} style={{ fontSize: "13px", color: "#6B6B6B", margin: "0 0 6px", lineHeight: 1.6, fontFamily: INTER }}>
                    {i + 1}. <em>{name}</em> → {desc}
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "12px 0 0", lineHeight: 1.6, fontFamily: INTER }}>
                  Si todavía no lo tienes claro, no lo fuerces. Escribe lo que se te ocurra ahora y siempre podemos afinarlo.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿cómo se llamará tu modelo?
              </p>
              <FormField label="" value={localData.day1.modelName || ""} onChange={(v) => handleFieldChange("day1.modelName", v)} type="textarea" />
            </Question>

            {/* 1.2 Avatar psicológico */}
            <Question
              number="1.2"
              title="Avatar psicológico de tu cliente ideal"
              hint="Ayúdate respondiendo estos enunciados y añade todo lo que creas que lo completa."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.6, fontFamily: INTER }}>Ejemplo:</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 12px", lineHeight: 1.7, fontFamily: INTER }}>
                  Tiene 38 años. Le preocupa sobre todo no llegar a los 50 con la salud que ve en sus amigas. Siente que ha probado todas las dietas y todas le funcionan tres semanas. Sueña con un cuerpo que no le obligue a pensar en él cada mañana y con poder ir a una cena sin calcular qué pedir. Pero ahora mismo está atrapada entre el descontrol del fin de semana y la culpa del lunes y cada nuevo intento la deja más convencida de que el problema es ella, no el método.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: 0, lineHeight: 1.6, fontFamily: INTER }}>
                  No describas a tu cliente cómo lo describirías en un brief de marketing. Descríbelo como si tu mejor amiga te preguntara "¿pero cómo es esa persona de verdad?".
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, describe a tu cliente ideal:
              </p>
              <FormField
                label=""
                value={localData.day1.avatarDescription || ""}
                onChange={(v) => handleFieldChange("day1.avatarDescription", v)}
                type="textarea"
                placeholder={"Tiene ___ años.\nLe preocupa sobre todo...\nSiente que... Sueña con...\nPero ahora mismo está..."}
              />
            </Question>

            {/* 1.3 Niveles de consciencia */}
            <Question
              number="1.3"
              title="Los 4 niveles de consciencia de tu cliente"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                {[
                  ["Nivel 1", "ni siquiera sabe que tiene el problema"],
                  ["Nivel 2", "sabe que tiene el problema pero no busca solución"],
                  ["Nivel 3", "busca soluciones activamente"],
                  ["Nivel 4", "te conoce y considera comprarte"],
                ].map(([level, desc]) => (
                  <p key={level} style={{ fontSize: "13px", color: "#525252", margin: "0 0 4px", lineHeight: 1.6, fontFamily: INTER }}>
                    <strong>{level}:</strong> {desc}
                  </p>
                ))}
                <p style={{ fontSize: "13px", color: "#525252", margin: "14px 0 10px", lineHeight: 1.6, fontFamily: INTER, fontWeight: 600 }}>
                  Ejemplo: Misma persona (mujer, 38 años, relación complicada con la comida) en los 4 niveles:
                </p>
                {[
                  ["Nivel 1 — Ni siquiera sabe que tiene el problema.",
                   '"Yo soy así, de buen comer, como mi padre. Lo que pasa es que el metabolismo cambia con la edad." Justifica su situación como genética, edad o vida ajetreada. Si le hablas de "trastornos con la comida" se ofende. No te va a comprar nada, primero hay que mostrarle que su normalidad no es normal.'],
                  ["Nivel 2 — Sabe que tiene el problema pero no busca solución.",
                   '"Sí, tengo que ponerme en serio, pero ahora no es el momento. Cuando pase el verano / cuando los niños empiecen el cole / en enero." Hace bromas sobre su descontrol en las cenas. Posterga. Lo aplaza. Aquí no compite tu producto contra otros productos, compite contra "ya empezaré".'],
                  ["Nivel 3 — Busca soluciones activamente.",
                   '"He probado Noom, ayuno intermitente, la nutricionista del barrio y dos retos en Instagram. Todo me ha funcionado al principio y luego nada." Está cansada del bucle método-fracaso. Ya no compara precios, compara confianza. Aquí no le hables de quién eres, háblale de por qué lo que probó no funcionó y la razón de por qué tú sí.'],
                  ["Nivel 4 — Te conoce y considera comprarte.",
                   '"Llevo dos meses siguiéndote, he visto el caso de Marta y me siento muy identificada. Solo me frena pensar si esta vez voy a poder." No duda de ti, duda de ella. Aquí no necesita más contenido educativo, necesita un empujón: prueba social, garantía, llamada gratuita, algo que neutralice su miedo, no el tuyo a vender.'],
                ].map(([title, text]) => (
                  <div key={title as string} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 4px", lineHeight: 1.5, fontFamily: INTER }}>{title as string}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{text as string}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 4px", lineHeight: 1.6, fontFamily: INTER }}>
                ¿Dónde está la mayoría de tu audiencia? Si no lo sabes con certeza puedes ponerlo en porcentaje. Recuerda que aquí no hay respuestas correctas o incorrectas.
              </p>
              <p style={{ fontSize: "13px", fontStyle: "italic", color: "#A1A1AA", margin: "0 0 14px", lineHeight: 1.6, fontFamily: INTER }}>
                Ejemplo: Nivel 1: 30% · Nivel 2: 30% · Nivel 3: 20% · Nivel 4: 20%
              </p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿en qué nivel de consciencia está tu cliente?
              </p>
              <FormField label="" value={localData.day1.consciousnessLevel || ""} onChange={(v) => handleFieldChange("day1.consciousnessLevel", v)} type="textarea" />
            </Question>

            {/* 1.4 Frases del cliente */}
            <Question
              number="1.4"
              title="3 frases que tu cliente te diría si te escribiera por WhatsApp"
              hint="Las palabras exactas que usaría. No las tuyas, las suyas."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                {[
                  '"Hola, perdona la hora. Llevo dos semanas viendo tu contenido. Tengo 38, dos hijos, y ya he probado de todo. ¿Cómo sé si esto va a ser diferente esta vez?"',
                  '"Oye, una pregunta un poco tonta… ¿cuánto cuesta? Lo vi en el directo pero no encuentro el precio por ningún lado y me da apuro preguntar."',
                  '"Hola, no sé si te lo escribirá mucha gente pero… ¿esto funciona también si una no tiene tiempo? Trabajo, niños, casa. No quiero apuntarme y dejarlo a la semana otra vez."',
                ].map((phrase, i) => (
                  <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                    {i + 1}. {phrase}
                  </p>
                ))}
                <p style={{ fontSize: "13px", color: "#525252", margin: "12px 0 0", lineHeight: 1.6, fontFamily: INTER }}>
                  <strong>Bonus:</strong> estas 3 frases que escribas las vas a usar tal cual en tu próximo ad, en tu próxima landing y en tu próximo email. Cuanto más reales suenen, menos tendrás que escribir desde cero el resto del año.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿cómo te escribe tu cliente?
              </p>
              <FormField label="" value={localData.day1.clientPhrases || ""} onChange={(v) => handleFieldChange("day1.clientPhrases", v)} type="textarea" />
            </Question>
            {/* Block 2 label */}
            <div style={{ height: "1px", background: "#E5E5E5", margin: "56px 0 40px" }} />
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "40px", fontFamily: INTER }}>
              Bloque 2 · Tu promesa
            </div>

            {/* 2.1 Transformación prolongada */}
            <Question
              number="2.1"
              title="Tu transformación prolongada"
              hint="De qué punto a qué punto llevas a tu cliente. No es un beneficio, es un viaje."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 12px", lineHeight: 1.6, fontFamily: INTER }}>
                  Te pongo un ejemplo de un viaje que podría ocurrir:
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 6px", lineHeight: 1.65, fontFamily: INTER }}>
                  <strong>DE:</strong> <em>Una mujer que cada lunes empieza una dieta nueva con la promesa de "esta sí". Que come contando calorías mentalmente mientras come. Que siente que el descontrol del sábado borra todo lo que hizo de lunes a viernes. Y que ha llegado a creer, en silencio, que el problema es ella, no el método.</em>
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  <strong>A:</strong> <em>Una mujer que come sin pensar en comer. Que se acuerda de su peso solo cuando se compra ropa. Que ha dejado de discutir consigo misma cada mañana frente al espejo. Y que sabe que aunque tenga una semana mala, el sistema sigue funcionando porque entiende por qué funciona, no porque alguien se lo esté recordando.</em>
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", lineHeight: 1.6, fontFamily: INTER }}>
                  EL VIAJE PASA POR 3 MOMENTOS:
                </p>
                {[
                  ["Mes 1–2 · Soltar.", 'Dejar de luchar contra la comida. Bajar el ruido mental. La gente le dice "te veo más tranquila" antes de notarle nada físico.'],
                  ["Mes 3–6 · Construir.", 'Aparecen los hábitos invisibles. Los cambios físicos llegan sin sufrimiento. La gente le pregunta qué está haciendo distinto.'],
                  ["Mes 7–12 · Encarnar.", 'La transformación deja de ser "lo que hace" y pasa a ser quien es. Aquí es cuando se convierte en testimonio.'],
                ].map(([phase, desc]) => (
                  <p key={phase as string} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 6px", lineHeight: 1.65, fontFamily: INTER }}>
                    <strong style={{ fontStyle: "normal" }}>{phase as string}</strong> {desc as string}
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "14px 0 6px", lineHeight: 1.6, fontFamily: INTER }}>
                  Por qué este ejemplo enseña algo crítico para el modelo recurrente:
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Esta pregunta es el examen real de si tu producto puede ser membresía o solo curso. Si tu transformación se puede entregar en 8 semanas, no necesitas membresía, necesitas un programa cerrado, y también te ayudamos a crearlo.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", lineHeight: 1.6, fontFamily: INTER }}>
                  Las tres marcas de una transformación prolongada bien construida son:
                </p>
                {[
                  ["El punto de partida es un estado, no un síntoma.", '"Hace dieta cada lunes" es un comportamiento. "Cree que el problema es ella" es un estado interno. Lo segundo justifica meses de acompañamiento; lo primero se soluciona con un programa.'],
                  ["El punto de llegada describe identidad, no resultado.", '"Pesa 10 kg menos" es un resultado y cuando llega, la persona se va. "Es quien come sin pensar en comer" es identidad y la identidad no caduca, se mantiene.'],
                  ["El viaje tiene fases con cambios visibles.", "Si no puedes describir qué pasa el mes 2, el 5 y el 9, tu transformación no es prolongada, es un evento. Y los eventos no se cobran de forma recurrente."],
                ].map(([title, desc], i) => (
                  <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                    {i + 1}. <em><strong>{title as string}</strong></em> {desc as string}
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "12px 0 0", lineHeight: 1.65, fontFamily: INTER }}>
                  <strong style={{ fontStyle: "normal" }}>Bonus:</strong> si tu transformación cabe en 6-8 semanas, todavía no tienes membresía, tienes un programa cerrado. La pregunta no es "qué consigue mi cliente conmigo". La pregunta es "qué se le rompe el día que deja de tenerme". Si la respuesta es "nada porque ya está transformado", tu modelo es de pago único. Si la respuesta es "vuelve al sitio de antes", tu modelo es recurrente. Además siempre está la opción de comenzar con un programa, que te ayudamos a construir, y crear una membresía de continuación para toda esa gente que no quiera perder el resultado logrado. Esto ocurre en más de un 50% de las veces.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿cuál es la transformación prolongada de tu cliente?
              </p>
              <FormField label="" value={localData.day1.transformation || ""} onChange={(v) => handleFieldChange("day1.transformation", v)} type="textarea" />
            </Question>

            {/* 2.2 Fórmula */}
            <Question
              number="2.2"
              title="Tu fórmula de promesa"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                {[
                  ["El «a conseguir» tiene que ser un mecanismo, no un resultado.", '"Perder peso" es lo que prometen 50.000 cuentas. "Construir una forma de comer que se sostenga sola" es lo único que esa mujer todavía no ha probado. Y por eso es lo único que puede vender.'],
                  ["El «para que puedan» tiene que ser lo que la persona se atreve a decir solo en voz baja.", '"Sentirse mejor con su cuerpo" es lo que pondría en una bio. "Dejar de empezar cada lunes una vida nueva" es lo que llora una madrugada de domingo. Lo segundo convierte; lo primero se ignora.'],
                ].map(([title, desc], i) => (
                  <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                    {i + 2}. <em><strong>{title as string}</strong></em> {desc as string}
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "12px 0 6px", lineHeight: 1.6, fontFamily: INTER }}>
                  El test rápido para saber si tu fórmula está hecha:
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 6px", lineHeight: 1.65, fontFamily: INTER }}>
                  Pista: léela en voz alta y cronometra 7 segundos. Si en ese tiempo no se entiende a quién ayudas, qué consigue y por qué le importa profundamente, todavía no está.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                  Una fórmula bien construida es la frase que pegas en tu bio de Instagram, encabeza tu landing y abre tu llamada de venta. Si tienes una distinta para cada cosa, todavía no la tienes.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, escribe tu fórmula
              </p>
              <FormField label="" value={localData.day1.formula || ""} onChange={(v) => handleFieldChange("day1.formula", v)} type="textarea" />
            </Question>

            {/* Block 3 label */}
            <div style={{ height: "1px", background: "#E5E5E5", margin: "56px 0 40px" }} />
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "40px", fontFamily: INTER }}>
              Bloque 3 · ¿Qué modelo te conviene?
            </div>

            {/* 3.1 Modelo */}
            <Question
              number="3.1"
              title="Marca el modelo que mejor encaja con tu nicho y tu situación"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Antes de elegir, vuelve por un segundo a tu respuesta de la pregunta 2.1 (Transformación prolongada). Ahí tienes la respuesta.
                </p>
                {[
                  ['→ Marca "Programa grupal de alto valor" si:', 'Tu transformación se completa en 6-12 semanas y, cuando llega, tu cliente se va satisfecho y 100% transformado. Ejemplos típicos: programas de venta concreta, sistemas de captación, transformaciones físicas con metodología cerrada, certificaciones.'],
                  ['→ Marca "Membresía" si:', 'Tu transformación se sostiene mejor con presencia continua. Tiene fases que se suceden durante meses, requiere ajustes constantes, o el cliente recae si se queda solo. Aquí vendes acompañamiento + comunidad de forma indefinida. Ejemplos típicos: hábitos saludables, mindset, idiomas, escritura, parenting, gestión emocional, comunidades profesionales, música, baile, adiestramiento...'],
                  ['→ Marca "Ecosistema" si:', 'Necesitas que la persona haga primero un proceso intensivo (un programa de 6-12 semanas que la transforme) y después se quede en una membresía para no recaer y seguir avanzando. Vendes dos cosas distintas en momentos distintos del viaje.'],
                  ['→ Marca "Todavía no lo tengo claro" si:', 'Es lo más honesto que puedes responder si no tienes claridad aún. Te ayudaremos a darle forma. No es un suspenso, es el atajo.'],
                ].map(([label, desc]) => (
                  <p key={label as string} style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                    <strong>{label as string}</strong> {desc as string}
                  </p>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "14px", paddingTop: "14px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Bonus — la trampa más frecuente:</p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                    El error más común es marcar &ldquo;ecosistema&rdquo; para no tener que elegir. Si todavía no tienes UNO solo de los dos modelos funcionando con clientes pagando, no eres ecosistema. Eres alguien con buenas ideas. Empieza por uno.
                  </p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                    La segunda trampa: marcar &ldquo;membresía&rdquo; porque suena más a ingreso recurrente, cuando en realidad tu transformación cabe en 8 semanas. Si la metes en formato membresía, la gente se va al mes 3 porque ya consiguió lo que vino a buscar, y tu churn te mata el negocio antes de despegar.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿qué modelo encaja mejor con tu negocio?
              </p>
              {[
                "Membresía mensual (cuota recurrente, comunidad activa, contenido continuo)",
                "Programa grupal de alto valor (pago único, transformación intensiva con grupo)",
                "Ecosistema (combinación: programa de entrada + membresía de continuidad)",
                "Todavía no tengo claro cuál — quiero que me ayudéis con eso",
              ].map((opt) => (
                <RadioOption
                  key={opt}
                  label={opt}
                  checked={localData.day1.modelType === opt}
                  onChange={() => handleFieldChange("day1.modelType", localData.day1.modelType === opt ? "" : opt)}
                />
              ))}
            </Question>

            {/* 3.2 Por qué ese modelo */}
            <Question
              number="3.2"
              title="¿Por qué ese modelo y no otro?"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Si has marcado &lsquo;Todavía no tengo claro&rsquo;, no escribas &ldquo;no sé&rdquo;. Más abajo te explico cómo formular tu duda para que sea útil.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Antes de escribir, vuelve a tu respuesta de 2.1 (Transformación prolongada) y 1.2 (Avatar). El modelo no se elige por preferencia, se cae por su propio peso cuando las capas anteriores están claras.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>El test raíz que decide el modelo:</p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  Hay una sola pregunta que separa un modelo recurrente de uno de pago único:
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 700, color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  &ldquo;¿Qué se le rompe a tu cliente el día que deja de tenerte?&rdquo;
                </p>
                {[
                  ['Si la respuesta es "nada, porque ya está transformado"', '→ tu modelo es programa grupal (pago único, transformación cerrada).'],
                  ['Si la respuesta es "vuelve al sitio donde estaba antes"', '→ tu modelo es membresía (pertenencia continuada).'],
                  ['Si la respuesta cambia según en qué mes del viaje esté tu cliente', '→ tu modelo es ecosistema (programa que transforma + membresía que sostiene).'],
                ].map(([cond, result]) => (
                  <p key={cond as string} style={{ fontSize: "13px", color: "#525252", margin: "0 0 6px", lineHeight: 1.65, fontFamily: INTER }}>
                    · <em>{cond as string}</em> <strong>{result as string}</strong>
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "12px 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Esta pregunta la respondes en 5 segundos. Si tardas más, no es que no sepas el modelo, es que aún no tienes claro qué transformación vendes. Vuelve a 2.1 antes de seguir aquí.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta para que veas dónde estás:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Preferencia personal (no convence):", quote: '"He marcado membresía porque me gusta más la idea de los ingresos recurrentes."', note: "Habla de ti, no de tu cliente. El modelo se elige en la capa estratégica (cliente + transformación + posicionamiento), no en la capa personal (tus ganas)." },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Razón razonable (defendible, pero blanda):", quote: '"He marcado membresía porque quiero ingresos estables y mi audiencia me lo pide."', note: 'Ya hay mención al cliente. Pero "mi audiencia me lo pide" no es una razón, es un dato sin filtrar.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Razón anclada en el cliente y la transformación:", quote: '"Membresía. Mi transformación con la comida no se cierra, se sostiene. De 4 clientas 1 a 1, todas recayeron entre el mes 3 y el 5 cuando dejamos de trabajar. Necesitan la pertenencia y el estatus del grupo para no volver al descontrol del sábado."', note: "Una buena duda es la que el equipo puede ayudarte a resolver en 10 minutos en la llamada. Una mala duda es la que ni tú entiendes qué te falta para resolverla." },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "14px", paddingTop: "14px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>Si has marcado &ldquo;Todavía no lo tengo claro&rdquo;:</p>
                  <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                    Está bien. Pero tu respuesta aquí tiene que ser específica, no un &ldquo;no sé&rdquo;.
                  </p>
                  <p style={{ fontSize: "13px", color: "#DC2626", margin: "0 0 4px", fontFamily: INTER }}>✗ &ldquo;No sé qué modelo elegir.&rdquo;</p>
                  <p style={{ fontSize: "13px", color: ACCENT, margin: 0, lineHeight: 1.65, fontFamily: INTER }}>✓ &ldquo;Dudo entre membresía y programa. Mi transformación dura 4-6 meses con un sistema cerrado, pero un 30% de mis clientas 1 a 1 me piden seguir conmigo después. No sé si eso significa que necesito programa + membresía de continuación (ecosistema), o membresía desde el principio.&rdquo;</p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                Ahora te toca a ti, ¿por qué has elegido este modelo?
              </p>
              <FormField label="" value={localData.day1.modelReason || ""} onChange={(v) => handleFieldChange("day1.modelReason", v)} type="textarea" />
            </Question>

            {/* Block 4 label */}
            <div style={{ height: "1px", background: "#E5E5E5", margin: "56px 0 40px" }} />
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "40px", fontFamily: INTER }}>
              Bloque 4 · Estructura mínima viable
            </div>

            {/* 4.1 Soporte */}
            <Question
              number="4.1"
              title="Soporte · ¿Cómo acompañarás a tus miembros?"
              hint="Sesiones grupales, comunidad, soporte por email, directos mensuales, voice notes…"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Esta es la pregunta que separa una membresía de un curso grabado con cobro mensual. Si un usuario puede conseguir exactamente lo que tú ofreces bajándose un curso en Hotmart, no tienes una membresía, tienes un pool de contenido con recurrencia. El soporte es el acceso a ti. Es lo único que no se puede piratear ni copiar.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Por qué esta pregunta pesa más de lo que parece:</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 6px", lineHeight: 1.65, fontFamily: INTER }}>
                  El soporte hace dos cosas que ninguna otra pieza del producto puede hacer:
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  · Genera la confianza que sostiene la renovación. El miembro no renueva por lo que ya consumió, renueva porque la próxima vez que tenga una duda, sabe que estarás para resolverla.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Si el soporte queda pobre, la retención se hunde aunque tu contenido sea brillante.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta para que veas dónde estás:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Genérico o insostenible:", quote: '"Estaré disponible para responder cualquier duda por WhatsApp."', note: 'Sin formato, sin frecuencia, sin canal claro. Es una promesa que en el mes 3 no vas a poder cumplir. El miembro se lo cree, escribe fuera de horario, no respondes a tiempo, y se va con la sensación de que le has engañado.' },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Definido pero blando:", quote: '"Una sesión grupal al mes y un grupo de WhatsApp para dudas."', note: 'Ya hay algo de estructura, pero un grupo de WhatsApp abierto sin reglas es un pozo negro que se llena de ruido en dos semanas. Y estás mezclando soporte (contacto contigo) con comunidad (contacto entre miembros), que son cosas distintas.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Estructurado, escalable y sostenible:", quote: '"2 Q&A grupales al mes de 60 minutos (2º y 4º jueves). Cada sesión abre con un hot seat de 10 min para una miembra que haya enviado su caso con 72h de antelación, así garantizo trabajo profundo, no solo respuestas genéricas. Feedback async por email dentro de 48h para dudas escritas al canal privado. Cero soporte por DM personal, todo pasa por los espacios oficiales para que el grupo aprenda de cada consulta."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de un soporte bien pensado:</p>
                  {[
                    ["Tiene formato, no promesas.", '"Estaré disponible" no es soporte, es una expectativa imposible de sostener. Un buen soporte se define en tres coordenadas: frecuencia, canal y duración. Sin las tres, cada miembro nuevo llega con una idea distinta de lo que le vas a dar. Y cuando la realidad no coincide con su expectativa, se va.'],
                    ["Es escalable.", 'Lo que ofreces a 20 miembros tienes que poder ofrecerlo a 200. Si tu formato exige respuesta individualizada a cada miembro, ya no es membresía es 1 a 1 disfrazado, y muere el día que superas la capacidad de tu agenda.'],
                    ["Hace sentir al miembro que hay alguien detrás, sin obligarte a estar delante 24/7.", 'El soporte no es estar disponible siempre. Es estar disponible cuando dijiste que estarías, y cumplirlo religiosamente. Un Q&A quincenal que se celebra sin fallo genera más confianza que un "escríbeme cuando quieras" al que dejas de contestar a los 3 meses.'],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo darás soporte?</p>
              <FormField label="" value={localData.day1.support || ""} onChange={(v) => handleFieldChange("day1.support", v)} type="textarea" />
            </Question>

            {/* 4.2 Contenido */}
            <Question
              number="4.2"
              title="Contenido · ¿Qué contenido entregas y cuándo?"
              hint="1 vídeo + recursos descargables al mes, masterclass mensual, retos trimestrales…"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  El contenido de una membresía no es un curso partido a cachos, tiene otro ritmo, otra duración y otra intención. <strong>La membresía que se consume es la que retiene.</strong> Todo lo que no consuman, no sirve.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>El formato que funciona: microlearning.</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Pieza corta (5-20 min), un solo concepto por vídeo, aplicable el mismo día. La lógica es simple: tu miembro tiene la vida que tú tienes. No tiene 90 min para una masterclass, tiene 15 min entre reuniones. Si tus vídeos duran 45 min, no los ve nadie. Si nadie los ve, nadie se transforma. Si nadie se transforma, nadie renueva.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Contenido infinito, sin criterio:", quote: '"Iré subiendo material según me vaya surgiendo. Cuanto más, mejor."', note: 'Este es literalmente el segundo error más caro: comprometerte con contenido infinito. Te quema en 3 meses y no genera retención, genera fatiga tuya y del miembro. "Cuanto más" nunca es la respuesta correcta en una membresía.' },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Estructura correcta, ritmo excesivo:", quote: '"1 clase semanal de 60 min + newsletter diaria + directo mensual."', note: 'Ritmo estructurado, pero desproporcionado. 4 clases al mes de 60 min = 4 horas de consumo pasivo. Tu miembro no las va a ver. Tú te vas a matar grabándolas. En 6 meses te preguntas por qué has montado un negocio que te agota más que el 1 a 1.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Microlearning con ritmo sostenible:", quote: '"1 masterclass mensual de 20-25 min sobre UN concepto core (uno solo, no tres empaquetados). 1 recurso práctico descargable ese mismo mes (checklist, plantilla, guía). 1 reto trimestral de 4-5 días para activar la comunidad. Y una biblioteca inicial de 6 vídeos base para que el miembro que entre nuevo tenga sitio donde aterrizar desde el minuto uno."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de un plan de contenido que se sostiene:</p>
                  {[
                    ["Cada pieza enseña UNA sola cosa.", 'Si tu vídeo cubre 4 conceptos, no cubre ninguno es una masterclass mal editada. Una idea por pieza, aplicable el mismo día. Es la única forma de que se consuma, y consumir es la única forma de que renueven.'],
                    ["El ritmo lo puedes producir tú, sin equipo, en tu peor semana.", 'Si tu plan requiere que grabes 8 vídeos al mes para arrancar, se cae en el segundo mes. Piensa el ritmo pensando en ti dentro de 6 meses cansada, no en ti motivada en la semana 1.'],
                    ["Hay contenido pilar y retos periódicos, no todo es rutina.", 'Los retos trimestrales (4 al año son suficientes) son el motor que activa a los miembros pasivos y renueva la energía del grupo. Sin retos, la biblioteca se queda mirando al techo.'],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                  <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "10px", paddingTop: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                      Convertir el contenido en el eje del producto. &ldquo;Cada semana subo algo nuevo&rdquo; suena a valor, pero es al revés. El contenido es el <strong>50% del producto</strong>, no el 100%. El otro 50% es soporte (30%) y comunidad (20%). Si toda tu propuesta de valor es contenido, has vuelto a construir un curso disfrazado de membresía. Y los cursos se cancelan tranquilamente cuando el cliente ya vio lo que le interesaba.
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo será tu contenido?</p>
              <FormField label="" value={localData.day1.content || ""} onChange={(v) => handleFieldChange("day1.content", v)} type="textarea" />
            </Question>

            {/* 4.3 Comunidad */}
            <Question
              number="4.3"
              title="Comunidad · ¿Cómo conectas a tus miembros entre ellos?"
              hint="Grupo privado, canal exclusivo, dinámica de presentación, llamadas en grupo…"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  La comunidad puede ser el 20% del producto, pero es el 60% de la retención. Y es también <strong>el único activo que no se puede copiar</strong>: alguien puede piratear tu contenido, replicar tu formato, imitar tu discurso pero no puede reproducir a las personas que están en tu comunidad.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", fontWeight: 700, color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Quédate con esta idea: las personas no se van de los sitios donde sienten que pertenecen.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>El ejemplo que decide todo:</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  CrossFit no vende entrenos. Vende tu tribu. Si mañana un miembro pudiera hacer los mismos entrenos gratis en su casa, no lo haría porque no perdería el contenido, perdería a sus personas. Esa es la diferencia entre membresía y suscripción, y esa es la única razón por la que un cliente paga cada mes durante 4 años.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Grupo sin diseño:", quote: '"Habrá un grupo de WhatsApp donde todos podrán hablar."', note: "Sin plataforma pensada, sin reglas, sin ritual de entrada. En 2 semanas hay 30 stickers, 5 mensajes al día, tres cuñadas discutiendo, y el resto ha silenciado el grupo. La comunidad ha muerto antes de arrancar." },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Espacio, sin dinámica:", quote: '"Canal privado en Circle donde comparto novedades y respondo dudas cuando puedo."', note: "Hay plataforma, pero el flujo es unidireccional (tú → miembros). Los miembros no hablan entre ellos, no se conocen, no tienen razón para volver. Y estás confundiendo soporte (tú respondes) con comunidad (ellos se conectan entre sí)." },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Comunidad con estructura viva:", quote: '"Espacio privado en Luxora con 3 zonas: bienvenidas, práctica y Q&A. Al entrar, cada miembro graba un vídeo de presentación de 90 segundos es el ritual obligatorio. Formato dúos: cada mes se crean parejas rotativas de acompañamiento para no dejar a nadie flotando. Cada miembro tiene un rol visible según antigüedad (\'Nueva\', \'6+ meses\', \'Fundadora\'). 1 reto trimestral con estructura de 4-5 días para activar a las pasivas. Regla básica: pregunta pública, dolor privado."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de una comunidad que se sostiene:</p>
                  {[
                    ["Hay un ritual de entrada.", "El miembro que entra sin presentarse nunca vuelve a hablar. La presentación (vídeo corto, texto estructurado, lo que sea) crea el primer compromiso que hace que participe. Sin ritual de entrada, la comunidad es un salón lleno de gente que no se saluda."],
                    ["Los miembros hablan entre ellos, no solo contigo.", "Si toda la conversación pasa por ti, no es comunidad es un fan club. Diseña formatos donde los miembros se conecten sin ti en medio: dúos, cuartetos, subgrupos temáticos, reviews entre pares."],
                    ["Hay estatus visible.", "Un miembro veterano tiene que verse distinto de un miembro nuevo. Badge, color, rol, mención en directos, lo que sea. Sin estatus visible, no hay incentivo para llevar 2 años dentro."],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                  <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "10px", paddingTop: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      Confundir comunidad con grupo de WhatsApp abierto. Grupo abierto = ruido sin señal. Necesitas plataforma con estructura (Luxora, Circle, Skool, Discord con canales, Slack) donde cada conversación tenga su sitio. La plataforma no es el activo pero sin una plataforma pensada, el activo no llega a existir.
                    </p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                      <strong style={{ fontStyle: "normal" }}>La segunda trampa:</strong> Ignorar a la comunidad una vez creada. La comunidad es tu mejor fuente de información sobre qué contenido crear, qué precio poner, qué problemas resolver. Si pasas 3 meses sin entrar, dejas de saber qué necesitan tus miembros y empiezas a producir contenido que no le importa a nadie.
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo conectarás a tus miembros entre ellos?</p>
              <FormField label="" value={localData.day1.community || ""} onChange={(v) => handleFieldChange("day1.community", v)} type="textarea" />
            </Question>

            {/* 4.4 Progreso */}
            <Question
              number="4.4"
              title="Progreso · ¿Cómo sabrán tus miembros que están avanzando?"
              hint="Rutas, niveles, checklists, feedback personalizado, hitos visibles…"
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Esta pregunta parece la más &ldquo;técnica&rdquo; del bloque, pero es la palanca invisible de la retención. El miembro que no ve su avance no se queda, aunque tu contenido sea bueno y tu comunidad esté viva. <strong>El estatus visible es lo que hace que un miembro de 2 años tenga una razón real para renovar.</strong> Sin hitos visibles, la membresía se convierte en una cuota mensual sin sentido.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Los primeros 30 días son donde se decide si alguien se queda o se va. Si en las primeras semanas el miembro no ve un hito claro que le confirme que está avanzando, se va antes del mes 3 — y muy probablemente ni te lo dice. Simplemente cancela.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Sin sistema:", quote: '"Cada uno irá viendo su avance según lo que le funcione."', note: "Sin hitos, sin señales, sin marco. El miembro no sabe si progresa. En el mes 3 se pregunta \"¿esto me sirve?\" y cancela sin drama, porque no hay nada que le indique lo contrario." },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Progreso solo cuantitativo:", quote: '"Tendrán una lista de contenidos con checkboxes para marcar lo que ya vieron."', note: "Estás midiendo consumo, no transformación. Es una playlist de Netflix. Y el día que un miembro marca el 100% de los checks, se pregunta \"¿y ahora qué?\" y se va, porque no le has dado ningún destino más allá del contenido." },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Progreso identitario + hitos visibles:", quote: '"3 niveles con nombres propios (\'Explora\' → \'Aterriza\' → \'Sostiene\') según antigüedad y participación. Onboarding de 30 días con 4 hitos concretos: bienvenida grabada, primer Q&A asistido, presentación en comunidad, primer reto completado. Cada hito activa un badge visible en el perfil. A los 3, 6 y 12 meses, cada miembro graba una micro-reseña de 60 seg sobre dónde está y la comparte con el grupo. Retos trimestrales completados suman a un \'muro de logros\' visible para todos."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de un sistema de progreso que sostiene:</p>
                  {[
                    ["Es visible para el grupo, no solo para el miembro.", "El progreso que solo tú ves no genera estatus y sin estatus no hay incentivo para llevar 2 años dentro. El progreso público hace dos cosas a la vez: al que lo consigue le confirma que avanza, y al que aún no lo ha conseguido le muestra que se puede."],
                    ["Combina hitos objetivos con identidad.", 'No es "he visto 10 vídeos" (cuantitativo), es "he pasado del nivel Explora al nivel Aterriza" (identidad). Los hitos cuantitativos son el mapa; los identitarios son el destino.'],
                    ["Arranca el día 1, no en el mes 3.", "Los primeros 30 días son la ventana crítica de retención. Si en las primeras 4 semanas el miembro no cruza al menos 2 hitos claros, no llega al trimestre. Tu sistema tiene que estar pensado para dar señales de avance desde la semana 1."],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo sabrán tus miembros que están avanzando?</p>
              <FormField label="" value={localData.day1.progress || ""} onChange={(v) => handleFieldChange("day1.progress", v)} type="textarea" />
            </Question>

            {/* Block 5 label */}
            <div style={{ height: "1px", background: "#E5E5E5", margin: "56px 0 40px" }} />
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "40px", fontFamily: INTER }}>
              Bloque 5 · Precio
            </div>

            {/* 5.1 Precio */}
            <Question
              number="5.1"
              title="Precio de tu modelo mensual/anual (si es membresía) o precio total (si es programa)"
              hint="Piensa en lo que tu cliente ahorra, gana o transforma estando contigo cada mes. Si no valoras tu trabajo, nadie lo valorará por ti."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  El precio no es un cálculo tuyo, es una fórmula del valor que le entregas al cliente. Cuando lo calculas mirando a la competencia, siempre acabas bajo. Cuando lo calculas mirando la transformación que produces, acabas donde debes.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>
                  PRECIO = (Resultado que obtiene el cliente × Probabilidad de éxito percibida) / Esfuerzo que le supone al cliente
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  Cuanto mayor sea el resultado y menor el esfuerzo para conseguirlo, más puedes cobrar. Es la única fórmula que sirve, porque no habla de ti, habla de lo que le pasa a quien te compra.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Ejemplo aplicado: si tu membresía transforma la relación con la comida (resultado alto), tienes 12 casos previos exitosos (probabilidad de éxito alta) y le pides al miembro 2h a la semana (esfuerzo bajo), tu precio está entre 99-199€/mes sin problema. Si tu transformación es difusa, sin casos previos y exige 6h semanales, no importa lo mucho que trabajes: no puedes cobrar 199€. Y si lo intentas, no vendes.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Precio por comparación:", quote: '"Voy a poner 29€/mes porque he visto que otros de mi sector cobran eso."', note: 'Estás copiando el precio del otro sin saber por qué él lo pone. Y el otro probablemente lo pone porque también miró al de al lado. La comparación siempre lleva a la baja: nadie sube precio por comparar. Y "barato" atrae al peor perfil: el que aún no está en nivel 3.' },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Precio intuitivo, sin fórmula:", quote: '"Creo que puedo cobrar 79€/mes. Es lo que la gente estaría dispuesta a pagar."', note: 'Ya piensas en el cliente, pero adivinas. "La gente" no es un dato es un promedio inventado. Y sin fórmula, cambias el precio cada dos meses según tu ansiedad. Eso mata la credibilidad más rápido que un precio equivocado.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Precio justificado con la fórmula:", quote: '"149€/mes con opción anual de 1.490€ (10 meses × 149 — los 2 meses restantes son el descuento del anual). Justificación con la fórmula: la transformación que ofrezco (dejar de vivir en dieta) le ahorra a mi cliente ~800€/año entre dietas, sesiones sueltas y libros que no le funcionan. Tengo 12 casos de 1 a 1 completados con resultado, la probabilidad de éxito percibida es alta. El esfuerzo del miembro es 2h/semana. Precio fundadores (primeras 20 miembros): 99€/mes con congelación 12 meses. Cuando cierre esas 20 plazas, sube a 149€ y no vuelve a bajar."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de un precio bien pensado:</p>
                  {[
                    ["Está justificado con la fórmula, no con la competencia.", "La competencia te empuja a la baja. La fórmula te lleva al valor real que entregas. Si tu precio necesita justificarse comparándose con otro, todavía no lo tienes."],
                    ["Ofrece mensual Y anual, con incentivo claro al anual.", "Fórmula: precio anual = 10 × precio mensual (los 2 meses restantes son el descuento). Un miembro anual paga 12 meses el primer día, se compromete de otra forma, consigue mejores resultados, y su LTV está asegurado. Un miembro mensual, en cambio, se va en 3-6 meses en promedio. Sin opción anual, tu negocio nunca escala."],
                    ["Tiene precio de lanzamiento con fecha de caducidad clara — y cuando dices que sube, sube.", "La credibilidad lo es todo. Si anuncias que el precio sube el día X y ese día no sube, la próxima vez nadie te cree. Precio de fundador es una sola vez y se acabó."],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                  <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "10px", paddingTop: "10px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                      Precio ridículamente bajo &ldquo;para que entre gente al principio&rdquo;. Es un error. La psicología es implacable: <strong style={{ fontStyle: "normal" }}>barato = no vale</strong>. Atraes al peor perfil (nivel 1-2, sin compromiso), consumen poco, no se transforman, se van hablando mal y usan su boca-oreja contra ti. Precio bajo no reduce fricción, la desplaza al peor sitio (el cliente que ni sabe por qué compró).
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La segunda trampa:</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                      Ofrecer 7 días gratis para &ldquo;reducir la barrera&rdquo;. No funciona. Atrae exactamente a quien no quieres: el que entra sin compromiso, no consigue resultados en 7 días (nadie los consigue), y se va hablando mal. Si tienes que reducir barrera, ofrece <strong style={{ fontStyle: "normal" }}>paid trial</strong> (14 días por 14€, por ejemplo) filtra al que no está listo y compromete al que sí.
                    </p>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La filosofía del libro sobre precio:</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                      El precio bajo no vende más, vende peor. Compras más cansancio, más devoluciones, más críticas, y ninguna posibilidad de escalar. El precio alto no es arrogancia: es la única forma de tener un cliente que se toma en serio la transformación que le vendes.
                    </p>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿qué precio le pondrías a tu modelo?</p>
              <FormField label="" value={localData.day1.price || ""} onChange={(v) => handleFieldChange("day1.price", v)} type="textarea" />
            </Question>

          </div>
        )}

        {/* ── Day 2 ── */}
        {currentDay === 2 && (
          <div>
            {/* Day 2 header */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "13px", color: "#A1A1AA", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: INTER, marginBottom: "6px" }}>Día 2</div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: ACCENT, letterSpacing: "-.02em", fontFamily: INTER }}>Estrategia de venta</div>
            </div>
            <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: "#111111", margin: "0 0 10px", lineHeight: 1.6, fontFamily: INTER }}>
              Cuándo rellenarlo: después de la Clase 2 (miércoles 29 julio)
            </p>
            <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 48px", lineHeight: 1.6, fontFamily: INTER }}>
              Hoy bajamos del &lsquo;qué&rsquo; al &lsquo;cómo lo vendes&rsquo;. Si el Día 1 era de claridad, el Día 2 es de acción concreta.
            </p>

            {/* Q1 - Cambios del Día 1 */}
            <Question number={1} title="Sabiendo todo lo que sabes ahora, ¿qué cambiarías del Día 1?">
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Es momento de dar un paso atrás para dar dos hacia delante. Si no cambiarías nada, también es válido — escríbelo.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Recuerda, no debes esperar que todo sea perfecto: se lanza al 70% y se mejora en marcha. Nunca vas a tener el 100% de claridad por eso te doy el permiso explícito de mover cosas ahora, cuando aún estamos a tiempo de ajustar el modelo antes de bajar a estrategia de venta.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Dónde te toca cambiar (y dónde no):</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  Los cambios útiles viven en la <strong style={{ fontStyle: "normal" }}>capa estratégica</strong> — avatar, promesa, modelo, estructura de tu membresía. Son los que mueven el negocio.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                  Los cambios cosméticos: nombre, color, un pequeño ajuste de precio no cambian nada real. Son lo que hace la gente que quiere sentir que ha avanzado sin haber trabajado en profundidad. Si tu única revisión es &ldquo;voy a cambiar el nombre&rdquo;, no has revisado nada, has procrastinado con estética.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿necesitas cambiar algo del Día 1?</p>
              <FormField label="" value={localData.day2.changes || ""} onChange={(v) => handleFieldChange("day2.changes", v)} type="textarea" />
            </Question>

            {/* Q2 - Propuesta única */}
            <Question number={2} title="¿Por qué tú? ¿Qué hace única tu propuesta?">
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  Experiencia, enfoque, método, energía, filosofía… No me digas &lsquo;soy auténtica&rsquo;, dime el dato concreto que te diferencia.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  La diferenciación se demuestra, no se declara. Si tu respuesta puede escribirla otra persona sin cambiar una palabra, todavía no la has encontrado.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  El generalista compite a la baja y se pierde en el ruido. <strong>El rey de su parcela</strong> cobra premium, es referente y crece por recomendación. Y para ser el rey de tu parcela, la parcela tiene que ser lo suficientemente pequeña como para ser tuya.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  La forma de llegar ahí es una sola: <strong>anchar hasta que duela.</strong> Empiezas amplio y afinas hasta que sientes que estás dejando gente fuera. Cuando duela un poco, vas por buen camino. Si tu diferenciación puede servirle a &ldquo;todo el mundo&rdquo;, no diferencia solo describe.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Adjetivos vacíos:", quote: '"Soy auténtica y cercana. Doy un trato personalizado. Tengo pasión por lo que hago."', note: 'Todos los adjetivos. Cero diferenciación real. Estas palabras las usa el 90% del sector: no separan, uniforman. Y una diferenciación que la usan miles ya no es diferenciación.' },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Credencial sin filo:", quote: '"Tengo 10 años de experiencia como nutricionista y he trabajado con muchas mujeres."', note: 'Correcto pero blando. Otros 500 profesionales de tu sector podrían escribir exactamente lo mismo. Falta el ángulo único: qué has aprendido en esos 10 años que otros no, y por qué eso importa para tu cliente.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Dato + método + cliente:", quote: '"Soy la única nutricionista de habla hispana con un método específico para mujeres en restricción-descontrol crónico. Vengo de 10 años en clínica privada acompañando trastornos de conducta alimentaria, y salté al online cuando entendí que el 80% de las mujeres que llegaban a consulta no necesitaban terapia necesitaban un sistema. Mi método, Cuerpo Estable, es la traducción práctica de ese aprendizaje: no cuenta calorías, no restringe, y no funciona para todo el mundo. Funciona específicamente para mujeres que ya han probado 3+ dietas. Tengo 47 casos completados con seguimiento a 12 meses. Y para todo lo demás, derivo a otro profesional."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de una diferenciación que se sostiene:</p>
                  {[
                    ["Es un dato, no un adjetivo.", '"Soy la única X que Y" o "he hecho Z veces esto" o "vengo de A y por eso B". Los adjetivos ("auténtica", "cercana", "apasionada") son ruido — todos los usan, ninguno separa. Sustituye cada adjetivo por un hecho verificable. Si no puedes, ese adjetivo no aguanta.'],
                    ["Tiene un método o marco propio con nombre.", 'No es "mi enfoque personalizado" — es "el sistema Cuerpo Estable" o "el método Mantrailing" o "la comunicación no agresiva". El libro es claro: el rey de su parcela tiene un método reconocible. Sin nombre, no hay marca — hay servicio anónimo.'],
                    ["Termina en el cliente, no en ti.", '"Vengo de terapia clínica" es tu credencial. Lo importante viene después: "...y eso significa que sé cuándo alguien necesita sistema y cuándo necesita terapia — y hago solo lo que puedo hacer bien". Tu diferencia se justifica por lo que le aporta al cliente, no por lo que dice de ti.'],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "12px 0 0", lineHeight: 1.65, fontFamily: INTER }}>
                    <strong style={{ fontStyle: "normal" }}>Regla operativa:</strong> Si al describir por qué eres única sientes que estás dejando gente fuera, vas por buen camino. Si tu respuesta a esta pregunta puede pegarla otra persona de tu sector en su propia landing y funcionar igual, no es tuya es del sector. Reescribe hasta que sea impecable.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿qué hace tu propuesta única?</p>
              <FormField label="" value={localData.day2.uniqueProposal || ""} onChange={(v) => handleFieldChange("day2.uniqueProposal", v)} type="textarea" />
            </Question>

            {/* Q3 - Estrategia anual */}
            <Question number={3} title="¿Cuál será tu estrategia anual de captación?">
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                  Cómo vas a conseguir leads y clientes durante todo el año, no solo en lanzamientos.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>
                  &ldquo;El evergreen paga las facturas. Los lanzamientos son la casa en la playa.&rdquo;
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Si tu estrategia depende 100% de picos, los meses en los que no lanzas facturas cero y en el 4º mes ya vives con el estrés del próximo lanzamiento. Si tu estrategia es solo evergreen sin activaciones, dejas fuera a toda la demanda reprimida (los que te conocen pero no actúan). Necesitas las dos patas.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>Pata 1 · Evergreen (base constante).</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>
                  Capta al cliente que está listo AHORA, nivel 3-4 de conciencia. Sistema siempre activo: lead magnet + nutrición + oferta.
                </p>
                {[
                  'Si tu precio anual está por debajo de 350-400€ → tráfico directo a página de venta.',
                  'Si tu precio anual supera esa cifra → VSL o taller gratuito previo.',
                  'Siempre con opción anual. El anual es lo que asegura LTV.',
                ].map((line, i) => (
                  <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>· {line}</p>
                ))}
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "12px 0 6px", fontFamily: INTER }}>Pata 2 · Estacionales (demanda reprimida).</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>
                  Para el que te conoce, te sigue, y aún no da el paso. Momentos concretos del año donde activas urgencia con estructura:
                </p>
                {[
                  'Retos abiertos (3-5 días).',
                  'Aperturas de plazas fundadoras.',
                  'Paid trial de 14 días por 14€ (nunca 7 días gratis — atrae al peor perfil).',
                ].map((line, i) => (
                  <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>· {line}</p>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Las 3 marcas de una estrategia anual que se sostiene:</p>
                  {[
                    ["Tiene evergreen que funciona sin ti.", "Un sistema que capta leads y vende mientras duermes. Sin evergreen dependes de tu energía y tu energía no da para 12 meses seguidos de captación manual."],
                    ["Tiene estacionales para activar la demanda reprimida.", "El nivel 2 (te conoce, no actúa) es el segmento más grande de tu audiencia. Solo lo activas con momentos concretos y estructurados. Sin estacionales, ese segmento se queda mirando para siempre."],
                    ["La proporción evergreen:estacional es real, no wishful thinking.", "Un objetivo sano es 70% evergreen / 30% estacional. Si tu 90% depende de lanzamientos, no has diseñado un negocio has diseñado un ciclo de agotamiento."],
                  ].map(([title, desc], i) => (
                    <p key={i} style={{ fontSize: "13px", color: "#525252", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                      {i + 1}. <strong><em>{title as string}</em></strong> {desc as string}
                    </p>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cuál será tu estrategia anual de captación?</p>
              <FormField label="" value={localData.day2.annualStrategy || ""} onChange={(v) => handleFieldChange("day2.annualStrategy", v)} type="textarea" />
            </Question>

            {/* Q4 Estrategia de lanzamiento */}
            <Question
              number={4}
              title="Estrategia de lanzamiento. ¿Cómo será esa primera apertura?"
              hint="Webinar gratuito, reto de 5 días, masterclass, comunidad fundadores… Define qué harás."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  El primer lanzamiento no es donde presentas un producto terminado — es donde <strong>vendes antes de tener</strong>. Lanzas al 70% y mejoras en marcha. Esperar a tenerlo todo listo es la forma más elegante de no lanzar nunca.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  <strong>500 seguidores son suficientes</strong> para arrancar. No necesitas audiencia grande — necesitas oferta clara, fecha clara y condiciones fundadoras que compensen el riesgo del que entra sin prueba social.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>Los 3 ingredientes de un primer lanzamiento que funciona:</p>
                {[
                  ["1 · Evento gratuito de activación", "(reto de 3-5 días, masterclass, taller intensivo). Activa a los niveles 3-4 de conciencia y filtra al que no encaja."],
                  ["2 · Condiciones fundadoras con caducidad real.", "Los primeros que entran sin prueba social merecen recompensa: precio congelado, bonus exclusivos o acceso extra. Cuando dices que las condiciones caducan el domingo, caducan el domingo. La credibilidad lo es todo."],
                  ["3 · Ventana corta de venta.", "3-5 días. Ni un mes de campaña floja, ni una tarde. Suficiente para que quien está listo actúe, suficientemente corto para generar urgencia real."],
                ].map(([label, desc], i) => (
                  <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                    <strong style={{ fontStyle: "normal", color: "#525252" }}>{label}</strong> {desc}
                  </p>
                ))}
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "14px 0 10px", fontFamily: INTER }}>Tres niveles de respuesta:</p>
                {[
                  { icon: "✗", color: "#DC2626", label: 'Nivel 1 — Sin fecha, sin evento:', quote: '"Haré una apertura cuando esté todo listo."', note: 'Nunca vas a lanzar. Sin fecha, sin evento gatillo, sin urgencia. Y sobre todo: sin el permiso mental para lanzar antes de tenerlo perfecto.' },
                  { icon: "◑", color: "#D97706", label: 'Nivel 2 — Formato correcto, sin estructura:', quote: '"Un webinar gratuito y después abro la membresía."', note: 'Formato adecuado pero sin condiciones fundadoras, sin ventana, sin caducidad de precio. Sin incentivo para actuar el día del webinar, la gente asiente, dice "qué interesante" y no compra hasta "más adelante". Y "más adelante" no llega nunca.' },
                  { icon: "✓", color: ACCENT, label: 'Nivel 3 — Formato + condiciones fundadoras + calendario:', quote: '"Reto de 3 días (martes-miércoles-jueves) con contenido diario en directo + workbook para trabajar en casa. Al cierre del reto, apertura Fundadoras: 20 plazas con precio congelado 12 meses (99€/mes vs 149€/mes que será el precio final). Bonus fundadoras: sesión de kickoff privada con las 20 y participación en la definición de los próximos módulos. Ventana de venta: viernes a lunes 23:59. Precio sube automáticamente el martes. Anuncio del reto 6 semanas antes en Instagram + email, más paid en Meta (600€ de presupuesto). Objetivo: 20 fundadoras. Si consigo 12, sigo. Si no llego a 8, revisamos oferta antes del siguiente lanzamiento."', note: "" },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                    Perfeccionismo. &ldquo;Cuando tenga los módulos grabados, los emails automatizados, la comunidad montada y la landing perfecta, lanzo.&rdquo; Nunca ocurre. Y cuando ocurre, es 8 meses después y ya has perdido dinero, tiempo y momentum. Lanza al 70%. Los primeros miembros son parte del proceso de construcción, no clientes de un producto acabado.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo será tu primera apertura?</p>
              <FormField label="" value={localData.day2.launchStrategy || ""} onChange={(v) => handleFieldChange("day2.launchStrategy", v)} type="textarea" />
            </Question>

            {/* Sección migración */}
            <Section title="Migración · si trabajas 1 a 1 actualmente" />

            {/* Q5 Migración 1 a 1 */}
            <Question
              number={5}
              title="¿Qué haces con tus clientes 1 a 1 actuales cuando lances el modelo grupal?"
              hint="Los mantienes en paralelo · los conviertes en miembros fundadores con precio especial · subes precios para reducir cartera · paras nueva captación 1 a 1… Qué plan tienes."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Esta pregunta es solo para uno de los 3 perfiles que encajan en membresía según el libro: <strong>el experto en servicios</strong>. Si vienes del 1 a 1, tu cartera actual no es un lastre — es tu mayor ventaja competitiva. Son clientes que ya te compraron una vez con éxito. Son la audiencia más cualificada que vas a tener nunca. Si los ignoras en la migración, estás desperdiciando tu mejor recurso.
                </p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  Si paras de vender una semana, el 1 a 1 se frena. Ese es el techo exacto que la membresía viene a romper.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 10px", fontFamily: INTER }}>El principio de la migración: no cortas ni compaginas, transicionas.</p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  Los dos extremos matan. Cortar el 1 a 1 de golpe = ingreso cero durante 6 meses hasta que la membresía facture. Mantenerlo todo en paralelo = nunca liberas tiempo y la membresía nunca crece porque compite con tu atención.
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  La ruta que funciona es en fases, con umbral de ingreso mínimo que nunca bajas y cierre inmediato de nueva captación 1 a 1 para no seguir alimentando el modelo que quieres dejar atrás.
                </p>
                {[
                  ["· Fase 1 (mes 0-3):", "paro nueva captación 1 a 1 desde hoy. De mis 8 clientes actuales, identifico las 4 más alineadas con la promesa de la membresía y les propongo entrar como fundadoras (precio 99€/mes + 1 sesión 1:1 de continuidad al mes durante 6 meses). Las otras 4 terminan su paquete pactado sin renovación automática. La membresía arranca con 4 fundadoras internas + captación externa."],
                  ["· Fase 2 (mes 4-6):", "subo precio de sesiones sueltas 1 a 1 en un 50% para que quede como servicio premium residual, no como oferta principal. Foco 80% en membresía, 20% residual en 1 a 1 selecto."],
                  ["· Fase 3 (mes 7+):", "sesiones 1 a 1 solo como upsell interno para miembras existentes que necesiten intensivos puntuales. Membresía como único producto de captación externa."],
                ].map(([label, desc], i) => (
                  <p key={i} style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 8px", lineHeight: 1.65, fontFamily: INTER }}>
                    <strong style={{ fontStyle: "normal", color: "#525252" }}>{label}</strong> {desc}
                  </p>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                    Sobrevalorar la resistencia de tus clientes 1 a 1 a moverse al grupo. Muchos profesionales asumen que &ldquo;sus clientes son de 1 a 1 y no van a querer entrar en un grupo&rdquo;. Suelen equivocarse — muchos entran encantados de mantener el vínculo pagando menos y con más comunidad. Pero solo si se lo ofreces con condición específica de fundadora, no como opción difusa.
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 4px", fontFamily: INTER }}>Regla operativa:</p>
                  <p style={{ fontSize: "13px", color: "#525252", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                    No eres el primer profesional que migra. Tenemos decenas de casos que hicieron esta transición.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cómo pasarás del individual al grupal?</p>
              <FormField label="" value={localData.day2.migration || ""} onChange={(v) => handleFieldChange("day2.migration", v)} type="textarea" />
            </Question>

            {/* Q6 Tus primeros 10 clientes */}
            <Question
              number={6}
              title="Tus primeros 10 clientes"
              hint="Lista las personas reales que podrían ser tus 10 primeros clientes cuando abras. Con nombre. Si no tienes 10, escribe los que tengas."
            >
              <div style={{ border: "1px solid #E5E5E5", borderRadius: "8px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F5F5F3" }}>
                      <th style={{ width: "36px", padding: "10px 12px", fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textAlign: "center", borderBottom: "1px solid #E5E5E5", fontFamily: INTER, letterSpacing: ".06em", textTransform: "uppercase" }}>#</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textAlign: "left", borderBottom: "1px solid #E5E5E5", borderLeft: "1px solid #E5E5E5", fontFamily: INTER, letterSpacing: ".06em", textTransform: "uppercase" }}>Nombre</th>
                      <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: 700, color: "#A1A1AA", textAlign: "left", borderBottom: "1px solid #E5E5E5", borderLeft: "1px solid #E5E5E5", fontFamily: INTER, letterSpacing: ".06em", textTransform: "uppercase" }}>Por qué crees que entrarían</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(localData.day2.firstClients || Array.from({ length: 10 }, () => ({ name: "", reason: "" }))).map((client: { name: string; reason: string }, i: number) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAF9" }}>
                        <td style={{ padding: "6px 12px", fontSize: "12px", color: "#A1A1AA", fontWeight: 700, textAlign: "center", borderBottom: "1px solid #F0F0EE", fontFamily: INTER }}>{i + 1}</td>
                        <td style={{ padding: "4px 8px", borderBottom: "1px solid #F0F0EE", borderLeft: "1px solid #E5E5E5" }}>
                          <input
                            value={client.name}
                            onChange={(e) => {
                              const updated = [...(localData.day2.firstClients || Array.from({ length: 10 }, () => ({ name: "", reason: "" })))];
                              updated[i] = { ...updated[i], name: e.target.value };
                              handleFieldChange("day2.firstClients", updated);
                            }}
                            className="client-input"
                            style={{ width: "100%", border: "none", background: "transparent", fontSize: "13px", color: "#111111", fontFamily: INTER, outline: "none", padding: "7px 10px", boxSizing: "border-box" }}
                            placeholder="Nombre..."
                          />
                        </td>
                        <td style={{ padding: "4px 8px", borderBottom: "1px solid #F0F0EE", borderLeft: "1px solid #E5E5E5" }}>
                          <input
                            value={client.reason}
                            onChange={(e) => {
                              const updated = [...(localData.day2.firstClients || Array.from({ length: 10 }, () => ({ name: "", reason: "" })))];
                              updated[i] = { ...updated[i], reason: e.target.value };
                              handleFieldChange("day2.firstClients", updated);
                            }}
                            className="client-input"
                            style={{ width: "100%", border: "none", background: "transparent", fontSize: "13px", color: "#111111", fontFamily: INTER, outline: "none", padding: "7px 10px", boxSizing: "border-box" }}
                            placeholder="Por qué entraría..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Question>

          </div>
        )}

        {/* ── Bonus Track ── */}
        {currentDay === 4 && !bonusUnlocked && (
          <div style={{ textAlign: "center", padding: "48px 0 0" }}>
            {/* Lock icon */}
            <div style={{ marginBottom: "20px" }}>
              <svg width="44" height="52" viewBox="0 0 44 52" fill="none">
                <rect x="4" y="22" width="36" height="28" rx="6" fill="#F5F5F3" stroke="#D1D1CB" strokeWidth="2"/>
                <path d="M12 22V16C12 9.37 16.48 4 22 4s10 5.37 10 12v6" stroke="#D1D1CB" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="36" r="4" fill="#D1D1CB"/>
                <rect x="20.5" y="38" width="3" height="5" rx="1.5" fill="#D1D1CB"/>
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "8px", fontFamily: INTER }}>Bonus Track</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#111111", letterSpacing: "-.02em", fontFamily: INTER, marginBottom: "10px" }}>Completa el workbook para desbloquear</div>
            <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 40px", lineHeight: 1.6, fontFamily: INTER }}>
              Responde todas las preguntas de los 3 días para acceder al contenido exclusivo.
            </p>

            {/* Barra de progreso */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "14px", padding: "28px 32px", textAlign: "left", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252", fontFamily: INTER }}>Progreso total</span>
                <span style={{ fontSize: "24px", fontWeight: 900, color: bonusProgress >= 80 ? ACCENT : "#111111", fontFamily: INTER, fontVariantNumeric: "tabular-nums" }}>{bonusProgress}%</span>
              </div>
              <div style={{ background: "#F0F0EE", height: "10px", borderRadius: "99px", overflow: "hidden", marginBottom: "28px" }}>
                <div style={{ height: "100%", width: `${bonusProgress}%`, background: bonusProgress >= 80 ? ACCENT : "#D97706", borderRadius: "99px", transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
              </div>

              {/* Estado por día */}
              {[
                { label: "Día 1 · Las Bases", pct: d1Pct, day: 1 },
                { label: "Día 2 · Estrategia de venta", pct: d2Pct, day: 2 },
                { label: "Día 3 · IA y funnel", pct: d3Pct, day: 3 },
              ].map(({ label, pct: p, day }) => (
                <div key={day} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: p === 100 ? "rgba(38,150,106,.12)" : "rgba(217,119,6,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {p === 100
                        ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 3L9 1" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" stroke="#D97706" strokeWidth="1.5"/></svg>
                      }
                    </div>
                    <span style={{ fontSize: "13px", color: "#525252", fontFamily: INTER }}>{label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "80px", height: "4px", background: "#F0F0EE", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p}%`, background: p === 100 ? ACCENT : "#D97706", borderRadius: "99px" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: p === 100 ? ACCENT : "#D97706", fontVariantNumeric: "tabular-nums", fontFamily: INTER, minWidth: "32px", textAlign: "right" }}>{p}%</span>
                    <button onClick={() => setCurrentDay(day)} style={{ fontSize: "11px", color: "#A1A1AA", background: "none", border: "none", cursor: "pointer", fontFamily: INTER, textDecoration: "underline", padding: 0 }}>
                      {p === 100 ? "ver" : "completar →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentDay === 4 && bonusUnlocked && (
          <div>
            {/* Hero */}
            <div style={{ background: "#111111", borderRadius: "14px", padding: "40px 32px", marginBottom: "32px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                <svg width="20" height="24" viewBox="0 0 18 22" fill="none"><path d="M10.5 1L2 13H8.5L5.5 21L16.5 9H10L13 1Z" fill="#D97706"/></svg>
              </div>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "#D97706", marginBottom: "12px", fontFamily: INTER }}>Bonus Track</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-.02em", fontFamily: INTER, lineHeight: 1.25 }}>¿Quieres construirlo con nosotros?</div>
            </div>

            {/* Intro */}
            <div style={{ marginBottom: "32px" }}>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.7, margin: "0 0 14px", fontFamily: INTER }}>
                Si has llegado hasta aquí y has llenado el workbook con honestidad, ya tienes 80% de claridad sobre tu modelo recurrente.
              </p>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.7, margin: 0, fontFamily: INTER }}>
                Si quieres el otro 20%, el que viene de tener al lado a alguien que ya ha pasado por esto y a un equipo que te acompaña en la ejecución, <strong>Lanzadera de Membresías está abierta.</strong>
              </p>
            </div>

            {/* Testimonios */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "18px", fontFamily: INTER }}>
                Lo que tienen en común quienes ya están dentro:
              </div>
              {[
                { quote: "Tenía pensado sacar una suscripción, pero en Lanzadera me di cuenta de que lo mío necesitaba una membresía. Cambia todo.", name: "Marga Hope", stat1: "Inversión publi: 1.530€", stat2: "Facturación: 65.000€" },
                { quote: "Buscábamos cómo ofrecer una membresía a nuestros seguidores. Apareció Magí. El trato tú a tú es de un valor brutal.", name: "fimeltraib", stat1: "Inversión publi: 2.500€", stat2: "Facturación: 33.804€" },
              ].map((t, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "10px", padding: "20px 24px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "14px", fontStyle: "italic", color: "#111111", lineHeight: 1.65, margin: "0 0 14px", fontFamily: INTER }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" as const }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111", fontFamily: INTER }}>— {t.name}</span>
                    <span style={{ fontSize: "11px", color: "#D1D1CB", fontFamily: INTER }}>·</span>
                    <span style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: INTER }}>{t.stat1}</span>
                    <span style={{ fontSize: "11px", color: "#D1D1CB", fontFamily: INTER }}>·</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: ACCENT, fontFamily: INTER }}>{t.stat2}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Qué es Lanzadera */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "10px", padding: "24px 28px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "16px", fontFamily: INTER }}>
                Qué es Lanzadera de Membresías
              </div>
              {[
                "10 semanas de acompañamiento intensivo.",
                "4 mentores especializados + Magí + Eric en sesiones en directo.",
                "Tutor personal con seguimiento semanal.",
                "Garantía de éxito firmada por contrato.",
                "+83% de alumnos recuperan su inversión antes de terminar el programa.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: i < 4 ? "10px" : 0 }}>
                  <span style={{ color: ACCENT, flexShrink: 0, fontWeight: 700 }}>·</span>
                  <span style={{ fontSize: "14px", color: "#111111", lineHeight: 1.55, fontFamily: INTER }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Bonus especial */}
            <div style={{ background: "rgba(217,119,6,.05)", border: "1px solid rgba(217,119,6,.2)", borderRadius: "10px", padding: "24px 28px", marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#D97706", marginBottom: "12px", fontFamily: INTER }}>
                Bonus especial — solo para los que agenden el miércoles
              </div>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.65, margin: "0 0 12px", fontFamily: INTER }}>
                Quien agende su llamada el miércoles 29 (día del W2) y entre a Lanzadera antes del fin de semana, se lleva una sesión individual conmigo de 60 minutos.
              </p>
              <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 700, color: "#111111", margin: 0, fontFamily: INTER }}>
                Esto no lo he hecho nunca antes. Y probablemente no lo vuelva a hacer.
              </p>
            </div>

            {/* Bootcamp IA */}
            <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "10px", padding: "24px 28px", marginBottom: "48px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, marginBottom: "12px", fontFamily: INTER }}>
                Bootcamp de IA · Inicio el 5 de agosto
              </div>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.65, margin: "0 0 8px", fontFamily: INTER }}>
                Aprende a crear con activos impulsados por IA todo lo que tu negocio necesita.
              </p>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.65, margin: 0, fontFamily: INTER }}>
                Reduce equipo, acelera resultados y ponte tú y a tu negocio a la vanguardia.
              </p>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", paddingBottom: "16px" }}>
              <p style={{ fontSize: "15px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.6, fontFamily: INTER }}>
                Si tu mapa 3k + tu situación encajan,
              </p>
              <p style={{ fontSize: "20px", fontWeight: 900, color: ACCENT, margin: "0 0 8px", fontFamily: INTER, letterSpacing: "-.01em" }}>
                te invitamos a una llamada de 30 minutos.
              </p>
              <p style={{ fontSize: "12px", fontStyle: "italic", color: "#A1A1AA", margin: "0 0 28px", lineHeight: 1.6, fontFamily: INTER }}>
                Si no encajas con el programa, te lo decimos sin rodeos. No vendemos a quien no podemos ayudar.
              </p>
              <a
                href="#"
                style={{ display: "inline-block", padding: "14px 40px", background: "#111111", color: "#fff", borderRadius: "8px", textDecoration: "none", fontFamily: INTER, fontSize: "12px", fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" as const }}
              >
                Agendar Llamada
              </a>
            </div>
          </div>
        )}

        {/* ── Day 3 ── */}
        {currentDay === 3 && (
          <div>
            <div style={{ fontSize: "13px", color: "#A1A1AA", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: INTER, marginBottom: "6px" }}>Día 3</div>
            <div style={{ fontSize: "26px", fontWeight: 900, color: ACCENT, letterSpacing: "-.02em", fontFamily: INTER }}>IA y funnel · Make it real</div>
            <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: "#111111", margin: "10px 0 6px", lineHeight: 1.5, fontFamily: INTER }}>
              Cuándo rellenarlo: después de la Clase 3 (jueves 30 julio)
            </p>
            <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 48px", lineHeight: 1.6, fontFamily: INTER }}>
              Hoy es el día del &lsquo;hacer&rsquo;. Eric y yo te enseñamos a montar la parte técnica con IA. Tu workbook de hoy es ligero — son 3 preguntas para que aterrices lo que has visto en directo.
            </p>

            {/* Q1 Landing hero */}
            <Question
              number={1}
              title="Tu landing en UNA frase: ¿qué prometes en el primer scroll?"
              hint="Una frase. La que pondrías como hero de tu landing. Si te sale larga, recorta."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  El headline de tu landing no explica, engancha. Su único trabajo es hacer que el que llegó frío decida seguir leyendo. Si no lo consigue en 7 segundos, has perdido a esa persona para siempre.
                </p>
                {[
                  { icon: "✗", color: "#DC2626", label: "Nivel 1 — Describes formato o demografía:", quote: '"Curso online de nutrición emocional para mujeres."', note: 'Estás describiendo lo que vendes, no lo que le pasa al que lo compra. El lector piensa "vale, y a mí qué" y cierra la pestaña. El formato (curso, membresía, programa) NUNCA es headline — es información de segundo scroll.' },
                  { icon: "◑", color: "#D97706", label: "Nivel 2 — Correcto pero genérico:", quote: '"Aprende a tener una relación sana con la comida."', note: 'Podría ser el headline de otras 200 landings del mismo sector. Si la frase sirve a cualquier profesional de tu nicho, no es tuya, es del sector. Y las frases del sector se ignoran porque el lector ya las ha leído mil veces.' },
                  { icon: "✓", color: ACCENT, label: "Nivel 3 — Promesa específica + audiencia auto-reconocible:", quote: '"Deja de empezar dieta cada lunes. Para mujeres que llevan años atrapadas en el ciclo restricción-descontrol."', note: 'Esto es un espejo, no un anuncio. La lectora se ve en la primera línea antes de leer la segunda. Y la segunda filtra: si no llevas años en ese ciclo, no eres para esto y ya lo sabes en 3 segundos.' },
                ].map(({ icon, color, label, quote, note }) => (
                  <div key={label} style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 700, color, margin: "0 0 4px", fontFamily: INTER }}>{icon} {label}</p>
                    <p style={{ fontSize: "13px", fontStyle: "italic", color: "#525252", margin: "0 0 4px", lineHeight: 1.65, fontFamily: INTER }}>{quote}</p>
                    {note && <p style={{ fontSize: "13px", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>{note}</p>}
                  </div>
                ))}
                <div style={{ borderTop: "1px solid #E8E8E5", marginTop: "12px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 6px", fontFamily: INTER }}>La trampa más frecuente:</p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                    Describir el formato en el headline. &ldquo;Membresía mensual con...&rdquo;, &ldquo;Programa de 12 semanas para...&rdquo;, &ldquo;Comunidad exclusiva de...&rdquo; El lector no compra formato — compra transformación. El formato se explica dos scrolls más abajo, cuando el interés ya está capturado. En el hero solo caben cliente + promesa.
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 4px", fontFamily: INTER }}>Regla operativa:</p>
                  <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                    Lee tu headline en voz alta y cronometra 7 segundos. Si en ese tiempo alguien que no te conoce entiende <strong style={{ fontStyle: "normal" }}>a quién ayudas, qué consigue y por qué le importa profundamente</strong> — está. Si necesita releerlo, no está.
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cuál es el hero de landing?</p>
              <FormField label="" value={localData.day3?.landingHero || ""} onChange={(v) => handleFieldChange("day3.landingHero", v)} type="textarea" />
            </Question>

            {/* Q2 Setter IA */}
            <Question
              number={2}
              title="Tu setter IA: ¿cuáles serían las dos primeras preguntas que harías a un lead que entra a tu WhatsApp?"
              hint="Lo que quieres saber primero para clasificar si esa persona encaja con tu modelo."
            >
              <div style={{ background: "#F5F5F3", border: "1px solid #E8E8E5", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>El principio del setter que funciona:</p>
                <p style={{ fontSize: "13px", color: "#525252", margin: "0 0 14px", lineHeight: 1.65, fontFamily: INTER }}>
                  El setter no vende, cualifica. Las preguntas iniciales no persuaden, no venden, no seducen. Recogen información que permite al closer conducir una <strong>compra premeditada</strong>, no impulsiva. Y la conversación por WhatsApp es íntima: tus preguntas tienen que sonar a persona, no a formulario de Typeform.
                </p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Te dejo lo que sería un buen modelo para que tomes inspiración:</p>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: "#6B6B6B", margin: "0 0 10px", lineHeight: 1.65, fontFamily: INTER }}>
                  &ldquo;1. Cuéntame en qué punto estás ahora con [tu tema específico], ¿qué es lo que te ha traído a escribirme? 2. ¿Qué has probado antes y por qué crees que no te ha terminado de funcionar?&rdquo;
                </p>
                <p style={{ fontSize: "13px", color: "#525252", margin: 0, lineHeight: 1.65, fontFamily: INTER }}>
                  La primera revela situación actual + urgencia (por qué HOY). La segunda revela fricción específica + patrones de intento anterior. Con esas dos respuestas, el closer llega a la llamada con: nivel de conciencia estimado, fatiga acumulada, objeción principal probable, y palancas emocionales. Todo en 2 turnos.
                </p>
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#525252", margin: "0 0 8px", fontFamily: INTER }}>Ahora te toca a ti, ¿cuáles serían las dos primeras preguntas que harías a un lead que entra a tu WhatsApp?</p>
              <FormField label="" value={localData.day3?.setterQuestions || ""} onChange={(v) => handleFieldChange("day3.setterQuestions", v)} type="textarea" />
            </Question>

            {/* Q3 Herramientas */}
            <Question
              number={3}
              title="Las 3 herramientas mínimas que vas a usar para arrancar:"
              hint="Cuanto más simple sea tu stack, menos tiempo pierdes orquestando y más tiempo dedicas a lo importante: hablar con clientes, mejorar tu producto, vender. La tecnología tiene que estar detrás, no delante."
            >
              {[
                "Landing builder (Wordpress, Webflow, etc.)",
                "Email marketing (ActiveCampaign, ConvertKit, Brevo, etc.)",
                "Pasarela de pago (Stripe, Hotmart, PayPal, etc.)",
                "Setter IA / chatbot",
                "Comunidad (Circle, Discord, WhatsApp, Skool...)",
                "Plataforma de contenido (Vimeo, Memberkit, Hotmart...)",
                "1 única herramienta con todo lo que vas a necesitas y crm incluido (Luxora)",
              ].map((tool) => (
                <CheckboxOption
                  key={tool}
                  label={tool}
                  checked={(localData.day3?.tools || []).includes(tool)}
                  onChange={() => {
                    const current = localData.day3?.tools || [];
                    const updated = current.includes(tool)
                      ? current.filter((t: string) => t !== tool)
                      : [...current, tool];
                    handleFieldChange("day3.tools", updated);
                  }}
                />
              ))}
            </Question>

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

            {currentDay < 3 ? (
              <button
                onClick={() => setCurrentDay(Math.min(3, currentDay + 1))}
                style={{ padding: "8px 20px", background: "#111111", border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: INTER, letterSpacing: ".01em" }}
              >
                Siguiente →
              </button>
            ) : currentDay === 3 ? (
              <button
                onClick={() => setCurrentDay(4)}
                style={{ padding: "8px 20px", background: bonusUnlocked ? "#D97706" : "transparent", border: `1px solid ${bonusUnlocked ? "#D97706" : "#D1D1CB"}`, borderRadius: "6px", color: bonusUnlocked ? "#fff" : "#A1A1AA", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: INTER, letterSpacing: ".01em", display: "flex", alignItems: "center", gap: "6px" }}
              >
                {bonusUnlocked && <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M6 1L1.5 7H5L3 11.5L9.5 5.5H6L7.5 1Z" fill="#fff"/></svg>}
                {bonusUnlocked ? "Bonus Track" : `Bonus Track · ${bonusProgress}%`}
              </button>
            ) : currentDay === 4 && bonusUnlocked ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: "8px 20px", background: submitting ? "#E5E5E5" : ACCENT, border: "none", borderRadius: "6px", color: submitting ? "#A1A1AA" : "#fff", fontSize: "13px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: INTER, transition: "background .2s" }}
              >
                {submitting ? "Enviando…" : "Enviar Workbook"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
