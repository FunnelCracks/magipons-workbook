import { useEffect } from "react";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";

const STEPS = [
  { label: "Registro" },
  { label: "Acceso" },
  { label: "Datos" },
  { label: "Intro" },
];

function injectStyles() {
  if (document.getElementById("rp-styles")) return;
  const s = document.createElement("style");
  s.id = "rp-styles";
  s.textContent = `
    @keyframes rpFloat {
      0%,100% { transform: translateY(0) rotate(45deg); }
      50%      { transform: translateY(-2px) rotate(45deg); }
    }
    .rp-rocket { animation: rpFloat 2s ease-in-out infinite; }
  `;
  document.head.appendChild(s);
}

type Step = 1 | 2 | 3 | 4;

export const RocketProgress: React.FC<{ current: Step }> = ({ current }) => {
  useEffect(() => { injectStyles(); }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 4px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", maxWidth: "360px", width: "100%" }}>
        {STEPS.map(({ label }, i) => {
          const step   = (i + 1) as Step;
          const done   = current > step;
          const active = current === step;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", flexShrink: 0 }}>
                {active && (
                  <div className="rp-rocket" style={{
                    position: "absolute", bottom: "calc(100% + 3px)",
                    fontSize: "13px", lineHeight: 1,
                    filter: "drop-shadow(0 0 6px rgba(38,150,106,.55))",
                  }}>🚀</div>
                )}
                <div style={{
                  width:  active ? 10 : done ? 8 : 7,
                  height: active ? 10 : done ? 8 : 7,
                  borderRadius: "50%",
                  background: done ? ACCENT : active ? "#fff" : "#DEDAD5",
                  border: active ? `2px solid ${ACCENT}` : "none",
                  boxShadow: active
                    ? `0 0 0 3px rgba(38,150,106,.15), 0 0 10px rgba(38,150,106,.35)`
                    : done ? `0 0 5px rgba(38,150,106,.25)` : "none",
                  transition: "all .3s", flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: MONT, fontSize: "7px",
                  fontWeight: active ? 800 : 600,
                  color: active ? ACCENT : done ? "#A8A8A4" : "#C8C8C4",
                  letterSpacing: ".07em", textTransform: "uppercase",
                  marginTop: "4px", whiteSpace: "nowrap",
                }}>{label}</span>
              </div>
              {!isLast && (
                <div style={{
                  flex: 1, height: 2, margin: "0 6px", marginBottom: "15px", borderRadius: 1,
                  background: done ? ACCENT : "transparent",
                  backgroundImage: done ? "none" : "repeating-linear-gradient(to right, #DEDAD5 0, #DEDAD5 4px, transparent 4px, transparent 9px)",
                  transition: "background .4s",
                }} />
              )}
            </div>
          );
        })}

        {/* Connector → Día 0 */}
        <div style={{
          width: 24, height: 2, margin: "0 6px", marginBottom: "15px", borderRadius: 1,
          backgroundImage: "repeating-linear-gradient(to right, #DEDAD5 0, #DEDAD5 4px, transparent 4px, transparent 9px)",
        }} />

        {/* Día 0 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#DEDAD5" }} />
          <span style={{
            fontFamily: MONT, fontSize: "7px", fontWeight: 800,
            color: "#C8C8C4", letterSpacing: ".07em", textTransform: "uppercase",
            marginTop: "4px", whiteSpace: "nowrap",
          }}>Día 0 🔥</span>
        </div>
      </div>
    </div>
  );
};
