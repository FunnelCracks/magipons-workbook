import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useState, useCallback, useEffect } from "react";
import { FormField } from "../components/FormField";
import { debounce } from "../utils/debounce";
import { useNavigate } from "react-router-dom";
import { submitWorkbook } from "../services/firestoreService";

const ACCENT  = "#26966a";
const BG      = "#0C0F0E";
const BORDER  = "#263029";
const TEXT_H  = "#E8F0EB";
const TEXT_M  = "#4A5F55";

const Section = ({ label, subtitle }: { label: string; subtitle?: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "14px", margin: "44px 0 28px" }}>
    <div style={{ width: "20px", height: "1px", background: ACCENT, flexShrink: 0 }} />
    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: ACCENT, flexShrink: 0 }}>
      {label}
    </span>
    <div style={{ height: "1px", flex: 1, background: BORDER }} />
    {subtitle && (
      <span style={{ fontSize: "12px", color: TEXT_M, flexShrink: 0, letterSpacing: ".02em" }}>{subtitle}</span>
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
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000),
    [updateField]
  );

  useEffect(() => {
    if (workbook?.data && !localData) {
      setLocalData(workbook.data);
    }
  }, [workbook?.data, localData]);

  const handleFieldChange = (fieldPath: string, value: string) => {
    if (localData) {
      const keys = fieldPath.split(".");
      const newData = JSON.parse(JSON.stringify(localData));
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      setLocalData(newData);
      debouncedUpdate(`data.${fieldPath}`, value, newData);
    }
  };

  const handleSubmit = async () => {
    if (!workbook) return;
    setSubmitting(true);
    try {
      await submitWorkbook(workbook.id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting workbook:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!workbook || !localData) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: TEXT_M, fontFamily: "system-ui, sans-serif", fontSize: "14px" }}>Cargando…</span>
      </div>
    );
  }

  const pct = workbook.completionPercentage;
  const days = ["Día 0", "Día 1", "Día 2"];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#B8C4BE", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", fontSize: "14px" }}>

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: BG, borderBottom: `1px solid ${BORDER}` }}>

        {/* 2px progress strip */}
        <div style={{ height: "2px", background: "#1A211E" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, transition: "width .5s ease" }} />
        </div>

        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: TEXT_M }}>Reto 3K</span>
              <span style={{ color: BORDER, fontSize: "16px", lineHeight: 1 }}>·</span>
              <span style={{ fontSize: "11px", fontWeight: 400, letterSpacing: ".06em", textTransform: "uppercase", color: "#2E4038" }}>Workbook</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: saveStatus === "saved" ? ACCENT : "#1E2B24",
                boxShadow: saveStatus === "saved" ? `0 0 6px ${ACCENT}` : "none",
                transition: "background .3s, box-shadow .3s",
              }} />
              <span style={{ fontSize: "11px", color: saveStatus === "saved" ? ACCENT : TEXT_M, transition: "color .3s" }}>
                {saveStatus === "saved" ? "Guardado" : `${pct}% completado`}
              </span>
            </div>
          </div>

          {/* Day tabs */}
          <div style={{ display: "flex" }}>
            {days.map((label, i) => (
              <button
                key={i}
                onClick={() => setCurrentDay(i)}
                style={{
                  padding: "10px 20px 10px 0",
                  marginRight: "20px",
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${currentDay === i ? ACCENT : "transparent"}`,
                  color: currentDay === i ? TEXT_H : TEXT_M,
                  fontSize: "13px",
                  fontWeight: currentDay === i ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "color .15s, border-color .15s",
                  letterSpacing: ".01em",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px 120px" }}>

        {currentDay === 0 && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 300, color: TEXT_H, letterSpacing: "-.02em", margin: "0 0 6px" }}>Visión</h2>
            <p style={{ fontSize: "13px", color: TEXT_M, margin: "0 0 40px", lineHeight: 1.6 }}>
              El punto de partida: por qué estás acá y hacia dónde vas.
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

        {currentDay === 1 && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 300, color: TEXT_H, letterSpacing: "-.02em", margin: "0 0 6px" }}>Las Bases</h2>
            <p style={{ fontSize: "13px", color: TEXT_M, margin: "0 0 8px", lineHeight: 1.6 }}>
              Claridad, promesa y estructura de tu membresía.
            </p>

            <Section label="Bloque 1" subtitle="Claridad" />
            <FormField
              label="Nombre de la membresía"
              value={localData.day1.membresiaName || ""}
              onChange={(v) => handleFieldChange("day1.membresiaName", v)}
            />

            <Section label="Avatar Psicológico" />
            <FormField label="Edad" value={localData.day1.avatar.age || ""} onChange={(v) => handleFieldChange("day1.avatar.age", v)} type="number" />
            <FormField label="Le preocupa sobre todo..." value={localData.day1.avatar.concerns || ""} onChange={(v) => handleFieldChange("day1.avatar.concerns", v)} type="textarea" />
            <FormField label="Siente que..." value={localData.day1.avatar.feelings || ""} onChange={(v) => handleFieldChange("day1.avatar.feelings", v)} type="textarea" />
            <FormField label="Sueña con..." value={localData.day1.avatar.dreams || ""} onChange={(v) => handleFieldChange("day1.avatar.dreams", v)} type="textarea" />
            <FormField label="Pero ahora mismo..." value={localData.day1.avatar.currentSituation || ""} onChange={(v) => handleFieldChange("day1.avatar.currentSituation", v)} type="textarea" />
            <FormField label="Frase del Avatar — una frase que lo representa" value={localData.day1.avatarPhrase || ""} onChange={(v) => handleFieldChange("day1.avatarPhrase", v)} type="textarea" />

            <Section label="Bloque 2" subtitle="Promesa" />
            <FormField label="Transformación prolongada" value={localData.day1.promise.transformation || ""} onChange={(v) => handleFieldChange("day1.promise.transformation", v)} type="textarea" />
            <FormField label="¿A quién ayudás a conseguir qué?" value={localData.day1.promise.statement || ""} onChange={(v) => handleFieldChange("day1.promise.statement", v)} type="textarea" />

            <Section label="Bloque 3" subtitle="Estructura Mínima Viable" />
            <FormField label="Soporte — ¿cómo acompañarás a tus miembros?" value={localData.day1.structure.support || ""} onChange={(v) => handleFieldChange("day1.structure.support", v)} type="textarea" />
            <FormField label="Contenido — ¿qué entregás y cuándo?" value={localData.day1.structure.content || ""} onChange={(v) => handleFieldChange("day1.structure.content", v)} type="textarea" />
            <FormField label="Comunidad — ¿cómo conectás a los miembros?" value={localData.day1.structure.community || ""} onChange={(v) => handleFieldChange("day1.structure.community", v)} type="textarea" />
            <FormField label="Bonus — ¿cómo sabrán que están avanzando?" value={localData.day1.structure.bonus || ""} onChange={(v) => handleFieldChange("day1.structure.bonus", v)} type="textarea" />

            <Section label="Bloque 4" subtitle="Precio" />
            <FormField label="¿Qué precio mensual tiene sentido para vos y tu cliente?" value={localData.day1.price || ""} onChange={(v) => handleFieldChange("day1.price", v)} type="number" />
          </div>
        )}

        {currentDay === 2 && (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 300, color: TEXT_H, letterSpacing: "-.02em", margin: "0 0 6px" }}>Estrategia de Venta</h2>
            <p style={{ fontSize: "13px", color: TEXT_M, margin: "0 0 40px", lineHeight: 1.6 }}>
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

      {/* ── Bottom nav ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: BG, borderTop: `1px solid ${BORDER}`, zIndex: 20 }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
            disabled={currentDay === 0}
            style={{
              padding: "9px 20px",
              background: "none",
              border: `1px solid ${currentDay === 0 ? "#1A211E" : BORDER}`,
              borderRadius: "3px",
              color: currentDay === 0 ? "#1E2B24" : TEXT_M,
              fontSize: "13px",
              cursor: currentDay === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "border-color .15s, color .15s",
            }}
          >
            ← Anterior
          </button>

          {currentDay < 2 ? (
            <button
              onClick={() => setCurrentDay(Math.min(2, currentDay + 1))}
              style={{
                padding: "9px 28px",
                background: ACCENT,
                border: "none",
                borderRadius: "3px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
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
                padding: "9px 28px",
                background: submitting ? "#1A211E" : ACCENT,
                border: `1px solid ${submitting ? BORDER : ACCENT}`,
                borderRadius: "3px",
                color: submitting ? TEXT_M : "#fff",
                fontSize: "13px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background .2s",
              }}
            >
              {submitting ? "Enviando…" : "Enviar Workbook"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
