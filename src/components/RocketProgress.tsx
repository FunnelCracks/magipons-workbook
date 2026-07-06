import { useEffect } from "react";

const MONT  = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";

const PAGES = [
  { label: "Intro",      step: 4 },
  { label: "Onboarding", step: 3 },
  { label: "Login",      step: 2 },
  { label: "Landing",    step: 1 },
] as const;

const inject = () => {
  if (document.getElementById("rocket-progress-styles")) return;
  const s = document.createElement("style");
  s.id = "rocket-progress-styles";
  s.textContent = `
    @keyframes rocketFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes rocketFlame {
      0%,100% { transform: scaleX(.85) scaleY(1); opacity:.85; }
      50%      { transform: scaleX(1.15) scaleY(.8); opacity:1; }
    }
    .rp-rocket { animation: rocketFloat 2s ease-in-out infinite; }
    .rp-flame  { animation: rocketFlame .2s ease-in-out infinite alternate; }
    @media (max-width: 900px) { .rp-wrap { display: none !important; } }
  `;
  document.head.appendChild(s);
};

type Step = 1 | 2 | 3 | 4;

export const RocketProgress: React.FC<{ current: Step }> = ({ current }) => {
  useEffect(() => { inject(); }, []);

  return (
    <div className="rp-wrap" style={{
      position: "fixed",
      right: "28px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      pointerEvents: "none",
    }}>

      {/* Destination label */}
      <div style={{
        fontFamily: MONT, fontSize: "9px", fontWeight: 800,
        letterSpacing: ".12em", textTransform: "uppercase",
        color: current === 4 ? ACCENT : "#C8C8C4",
        marginBottom: "6px", transition: "color .4s",
      }}>
        Día 0
      </div>

      {/* Top connector to destination */}
      <div style={{
        width: 2, height: 16,
        background: current >= 4 ? ACCENT : "#E0E0DC",
        borderRadius: 1, transition: "background .4s",
      }} />

      {PAGES.map(({ label, step }, i) => {
        const done   = current > step;
        const active = current === step;
        const isLast = i === PAGES.length - 1;
        // Connector below this dot is green when this dot is done (current > step)
        const connectorFilled = current > step;

        return (
          <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* Dot row */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22 }}>

              {/* Rocket above active dot */}
              {active && (
                <div className="rp-rocket" style={{
                  position: "absolute",
                  bottom: "22px",
                  fontSize: "18px",
                  lineHeight: 1,
                  filter: "drop-shadow(0 0 8px rgba(38,150,106,.5))",
                }}>
                  🚀
                </div>
              )}

              {/* Dot */}
              <div style={{
                width:  active ? 12 : done ? 9 : 7,
                height: active ? 12 : done ? 9 : 7,
                borderRadius: "50%",
                background: done ? ACCENT : active ? "#fff" : "#DDDDD8",
                border: active ? `2px solid ${ACCENT}` : "none",
                boxShadow: active
                  ? `0 0 0 4px rgba(38,150,106,.15), 0 0 14px rgba(38,150,106,.35)`
                  : done ? `0 0 6px rgba(38,150,106,.3)` : "none",
                transition: "all .35s ease",
              }} />

              {/* Label to the left */}
              <span style={{
                position: "absolute",
                right: "20px",
                fontFamily: MONT,
                fontSize: "9px",
                fontWeight: active ? 800 : 600,
                color: active ? ACCENT : done ? "#A8A8A4" : "#CCCCC8",
                whiteSpace: "nowrap",
                letterSpacing: ".08em",
                textTransform: "uppercase",
                transition: "color .3s",
              }}>
                {label}
              </span>
            </div>

            {/* Connector below (except last dot) */}
            {!isLast && (
              <div style={{
                width: 2, height: 38,
                borderRadius: 1,
                background: connectorFilled ? ACCENT : "transparent",
                backgroundImage: connectorFilled
                  ? "none"
                  : "repeating-linear-gradient(to bottom, #D4D4D0 0px, #D4D4D0 4px, transparent 4px, transparent 9px)",
                transition: "background .4s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};
