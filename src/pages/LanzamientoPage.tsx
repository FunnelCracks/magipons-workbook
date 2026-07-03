import React from "react";
import { useNavigate } from "react-router-dom";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

if (!document.getElementById("launch-styles")) {
  const css = document.createElement("style");
  css.id = "launch-styles";
  css.textContent = `
    @keyframes blurIn {
      from { opacity: 0; filter: blur(10px); transform: translateY(12px); }
      to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
    }
    .bi { opacity: 0; animation: blurIn .7s cubic-bezier(.16,1,.3,1) forwards; }

    @keyframes rocketFloat {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-7px); }
    }
    .rocket-btn {
      animation: rocketFloat 2.2s ease-in-out infinite;
      display: inline-block;
      cursor: pointer;
      transition: filter .2s;
      user-select: none;
    }
    .rocket-btn:hover { filter: drop-shadow(0 0 14px rgba(38,150,106,.45)); }
    .rocket-btn:active { transform: scale(.93); }

    @keyframes zoomFadeOut {
      0%   { opacity: 1; transform: scale(1); }
      100% { opacity: 0; transform: scale(1.06); }
    }
    .zoom-fade-out {
      animation: zoomFadeOut .75s cubic-bezier(.4, 0, .2, 1) forwards;
    }

    .membresía-circle {
      display:inline-block; border:3px solid #111; border-radius:50%; padding:2px 14px;
      animation: circleIn .6s cubic-bezier(.16,1,.3,1) 1.4s both;
    }
    @keyframes circleIn {
      from { transform:scale(0) rotate(-20deg); opacity:0; }
      to   { transform:scale(1) rotate(0);      opacity:1; }
    }
  `;
  document.head.appendChild(css);
}

export const LanzamientoPage: React.FC = () => {
  const navigate  = useNavigate();
  const rocketRef = React.useRef<HTMLSpanElement>(null);
  const [zooming, setZooming] = React.useState(false);

  const handleLaunch = () => {
    if (zooming) return;
    setZooming(true);
    setTimeout(() => navigate("/workbook/day0"), 820);
  };

  return (
    <>
      <div className={zooming ? "zoom-fade-out" : ""} style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 24px", fontFamily: MONT }}>
        <div style={{ maxWidth: "520px", width: "100%" }}>

          <p className="bi" style={{ animationDelay: ".05s", fontSize: "11px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 20px" }}>
            Mapa · Reto 3K
          </p>
          <h1 className="bi" style={{ animationDelay: ".15s", fontSize: "clamp(18px,4.5vw,24px)", fontWeight: 900, color: "#111", letterSpacing: "-.02em", lineHeight: 1.35, margin: "0 0 18px" }}>
            El objetivo con este desafío es abrirte los ojos y que veas que{" "}
            <span style={{ color: ACCENT }}>no necesitas ser esclavo de tu tiempo para facturar.</span>
          </h1>
          <p className="bi" style={{ animationDelay: ".28s", fontSize: "14px", color: "#525252", lineHeight: 1.75, margin: "0 0 36px" }}>
            Que hay un modelo que te permite vivir mejor sin sacrificar tu vida.
            Crear un negocio que se adapte a ti y que sea escalable.
          </p>
          <div className="bi" style={{ animationDelay: ".42s", textAlign: "center", margin: "0 0 36px" }}>
            <p style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: 900, letterSpacing: ".04em", textTransform: "uppercase", color: "#111", margin: 0 }}>
              Vamos a crear una{" "}
              <span className="membresía-circle" style={{ fontStyle: "italic" }}>Membresía</span>
            </p>
          </div>
          <p className="bi" style={{ animationDelay: ".56s", fontSize: "14px", color: "#525252", lineHeight: 1.75, margin: "0 0 12px" }}>
            Y ya te adelanto que es posible y lo vamos a lograr. Los centenares de personas que lo han logrado antes lo avalan. Se puede para cualquier sector, pero no de cualquier manera.
          </p>
          <p className="bi" style={{ animationDelay: ".65s", fontSize: "14px", color: "#525252", lineHeight: 1.75, margin: "0 0 48px" }}>
            Quiero que cojas papel y boli (o escribas a ordenador) y te motives para llevarlo a cabo, porque lo haremos.
          </p>

          <div className="bi" style={{ animationDelay: ".78s", textAlign: "center", marginBottom: "12px" }}>
            <p style={{ fontSize: "clamp(18px,4.5vw,22px)", fontWeight: 900, letterSpacing: ".06em", textTransform: "uppercase", color: ACCENT, margin: "0 0 24px" }}>
              Prepárate que despegamos
            </p>
            <span
              ref={rocketRef}
              className="rocket-btn"
              onClick={handleLaunch}
              style={{ fontSize: "72px" }}
            >🚀</span>
            <p style={{ fontSize: "12px", color: "#B0B0A8", marginTop: "12px", fontStyle: "italic" }}>
              Pulsa el cohete para despegar
            </p>
          </div>

          <div className="bi" style={{ animationDelay: ".9s", height: "1px", background: "#E5E5E5", margin: "40px 0 32px" }} />
          <div className="bi" style={{ animationDelay: "1s", marginBottom: "40px" }}>
            <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.7, margin: "0 0 4px" }}>Y recuerda,</p>
            <p style={{ fontSize: "14px", fontStyle: "italic", fontWeight: 600, color: "#111", lineHeight: 1.6, margin: "0 0 20px" }}>
              Tanto si crees que puedes como si crees que no, estás en lo cierto.
            </p>
            <p style={{ fontSize: "18px", fontWeight: 900, color: "#111", letterSpacing: ".02em", margin: "0 0 6px" }}>MAGÍ</p>
            <div style={{ width: "40px", height: "2px", background: "#111" }} />
          </div>

        </div>
      </div>

    </>
  );
};
