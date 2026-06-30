import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useState, useCallback, useEffect } from "react";
import { FormField } from "../components/FormField";
import { debounce } from "../utils/debounce";
import { useNavigate } from "react-router-dom";
import { submitWorkbook } from "../services/firestoreService";

const INTER  = "'Inter', system-ui, -apple-system, sans-serif";
const ACCENT = "#26966a";
const BG     = "#0D0D0D";

// ── Thin section divider ──────────────────────────────────────────────────────
const Section = ({ title, description }: { title: string; description?: string }) => (
  <div style={{ marginTop: "56px", marginBottom: "36px" }}>
    <div style={{ height: "1px", background: "#1C1C1C", marginBottom: "24px" }} />
    <p style={{ fontFamily: INTER, fontSize: "11px", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#3F3F46", margin: 0 }}>
      {title}
    </p>
    {description && (
      <p style={{ fontFamily: INTER, fontSize: "13px", color: "#52525B", margin: "6px 0 0", lineHeight: 1.5 }}>
        {description}
      </p>
    )}
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

  const pct = workbook.completionPercentage;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: INTER }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: BG }}>

        {/* 1px progress bar */}
        <div style={{ height: "1px", background: "#1A1A1A" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
        </div>

        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 32px" }}>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#3F3F46" }}>Reto 3K</span>
              <span style={{ color: "#262626", fontSize: "14px" }}>·</span>
              <span style={{ fontSize: "12px", color: "#27272A" }}>Workbook</span>
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
                  borderBottom: `1px solid ${currentDay === i ? ACCENT : "transparent"}`,
                  cursor: "pointer",
                  fontFamily: INTER,
                  gap: "1px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: currentDay === i ? 500 : 400, color: currentDay === i ? "#FFFFFF" : "#52525B", transition: "color .15s" }}>
                  {day}
                </span>
                <span style={{ fontSize: "11px", color: currentDay === i ? ACCENT : "#3F3F46", transition: "color .15s" }}>
                  {sub}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* Bottom border of header */}
        <div style={{ height: "1px", background: "#161616", marginTop: "0" }} />
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "56px 32px 120px" }}>

        {/* ── Day 0 ── */}
        {currentDay === 0 && (
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-.03em", margin: "0 0 8px" }}>
              Visión
            </h2>
            <p style={{ fontSize: "14px", color: "#52525B", margin: "0 0 48px", lineHeight: 1.6 }}>
              El punto de partida. ¿Por qué estás acá y hacia dónde vas?
            </p>

            <FormField
              label="¿Por qué querés tener una membresía?"
              value={localData.day0.motivation}
              onChange={(v) => handleFieldChange("day0.motivation", v)}
              type="textarea"
            />
            <FormField
              label="Monthly Recurring Happiness — ¿cuánto querés facturar por mes?"
              value={localData.day0.mrh || ""}
              onChange={(v) => handleFieldChange("day0.mrh", v)}
              type="number"
            />
            <FormField
              label="¿Qué harías con ese dinero? Describí un día ideal en tu vida"
              value={localData.day0.idealDay}
              onChange={(v) => handleFieldChange("day0.idealDay", v)}
              type="textarea"
            />
          </div>
        )}

        {/* ── Day 1 ── */}
        {currentDay === 1 && (
          <div>
            <h2 style={{ fontSize: "26px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-.03em", margin: "0 0 8px" }}>
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
            <h2 style={{ fontSize: "26px", fontWeight: 300, color: "#FFFFFF", letterSpacing: "-.03em", margin: "0 0 8px" }}>
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
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(13,13,13,.92)", backdropFilter: "blur(12px)", borderTop: "1px solid #161616", zIndex: 30 }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Left: completion */}
          <span style={{ fontSize: "12px", color: "#3F3F46", fontVariantNumeric: "tabular-nums" }}>
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
                border: "1px solid #262626",
                borderRadius: "6px",
                color: currentDay === 0 ? "#27272A" : "#A1A1AA",
                fontSize: "13px",
                fontWeight: 500,
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
                  background: ACCENT,
                  border: "none",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: INTER,
                  letterSpacing: ".01em",
                }}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: "8px 20px",
                  background: submitting ? "#1A1A1A" : ACCENT,
                  border: `1px solid ${submitting ? "#262626" : ACCENT}`,
                  borderRadius: "6px",
                  color: submitting ? "#52525B" : "#fff",
                  fontSize: "13px",
                  fontWeight: 500,
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
