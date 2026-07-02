import { useNavigate } from "react-router-dom";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

// Inject blur-in animation styles
const s = document.createElement("style");
s.textContent = `
  @keyframes blurIn {
    from { opacity: 0; filter: blur(10px); transform: translateY(12px); }
    to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
  }
  .bi { opacity: 0; animation: blurIn .7s cubic-bezier(.16,1,.3,1) forwards; }
`;
document.head.appendChild(s);

const bullets = [
  "Lo trabajas a lo largo de los 3 días del Reto. Cada día tiene su parte. El día 0 debes traerlo bien trabajado el primer día del evento.",
  "No es un test. Es una herramienta de claridad. Las respuestas son para ti, pero un asesor de negocios de mi equipo las lee y, si tiene sentido, te dará feedback.",
  "No te quedes en blanco. Si no sabes una respuesta, escribe lo que se te ocurra. Es preferible una respuesta imperfecta a un hueco.",
  "Vale para cualquier modelo: membresía mensual, programa grupal, ecosistema completo. El frame es 'modelo recurrente', la forma exacta la decides tú.",
];

export const MapaIntroPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", fontFamily: MONT }}>
      <div style={{ maxWidth: "560px", width: "100%" }}>

        {/* Header */}
        <div className="bi" style={{ animationDelay: ".05s", marginBottom: "40px" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 10px" }}>
            Workbook · Reto 3K
          </p>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, color: "#111111", letterSpacing: "-.02em", margin: 0, lineHeight: 1.2 }}>
            Cómo usar este MAPA
          </h1>
        </div>

        {/* Divider */}
        <div className="bi" style={{ animationDelay: ".2s", height: "1px", background: "#E5E5E5", marginBottom: "36px" }} />

        {/* Bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
          {bullets.map((text, i) => (
            <div key={i} className="bi" style={{ animationDelay: `${.3 + i * .12}s`, display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "18px", color: ACCENT, lineHeight: 1.4, flexShrink: 0, marginTop: "1px" }}>·</span>
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7, margin: 0 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Closing paragraph */}
        <div className="bi" style={{ animationDelay: ".82s", background: "#F0F7F4", border: "1px solid #C8E6D8", borderRadius: "10px", padding: "18px 20px", marginBottom: "40px" }}>
          <p style={{ fontSize: "14px", color: "#2D6A4F", lineHeight: 1.7, margin: 0 }}>
            Todo se queda registrado, puedes volver y rehacer las preguntas las veces que quieras.
            Cuando creas que está finalizado, pulsa el botón <strong>CERRAR MAPA</strong>.
            El equipo lo revisará y te dará feedback personalizado.
          </p>
        </div>

        {/* Quote */}
        <div className="bi" style={{ animationDelay: ".96s", borderLeft: `3px solid ${ACCENT}`, paddingLeft: "20px", marginBottom: "48px" }}>
          <p style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 600, color: "#111111", margin: "0 0 6px", lineHeight: 1.5 }}>
            "Tanto si crees que puedes como si crees que no, estás en lo cierto."
          </p>
          <p style={{ fontSize: "13px", color: "#A1A1AA", margin: 0, fontWeight: 700 }}>
            — Magi
          </p>
        </div>

        {/* CTA */}
        <div className="bi" style={{ animationDelay: "1.1s" }}>
          <button
            onClick={() => navigate("/launch")}
            style={{ width: "100%", padding: "14px", background: "#111111", border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: MONT, letterSpacing: ".02em", cursor: "pointer", transition: "background .2s, transform .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#222222")}
            onMouseLeave={e => (e.currentTarget.style.background = "#111111")}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(.98)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Comenzar el Workbook →
          </button>
          <p style={{ fontSize: "12px", color: "#B0B0A8", textAlign: "center", margin: "14px 0 0" }}>
            Solo para participantes del Reto 3K · Julio 2026
          </p>
        </div>

      </div>
    </div>
  );
};
