import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef } from "react";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

const injectStyles = () => {
  if (document.getElementById("landing-styles")) return;
  const s = document.createElement("style");
  s.id = "landing-styles";
  s.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes titleIn {
      from { opacity: 0; transform: scale(1.1) translateY(20px); filter: blur(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
    }
    @keyframes lineExpand {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes glow {
      0%,100% { box-shadow: 0 0 0 0 rgba(38,150,106,0); }
      50%      { box-shadow: 0 0 0 10px rgba(38,150,106,.15); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .a-date  { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: .05s; }
    .a-label { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: .2s; }
    .a-title { opacity:0; animation: titleIn 1s cubic-bezier(.16,1,.3,1) forwards; animation-delay: .35s; }
    .a-sub   { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: .7s; }
    .a-hr    { transform: scaleX(0); transform-origin: left; animation: lineExpand .9s cubic-bezier(.16,1,.3,1) forwards; animation-delay: .9s; }
    .a-p1    { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: 1.05s; }
    .a-p2    { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: 1.2s; }
    .a-btn   { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: 1.35s; }
    .a-micro { opacity:0; animation: fadeUp .7s ease forwards; animation-delay: 1.5s; }
    .btn-pulse { animation: glow 2.8s ease-in-out 2.2s infinite; }
    .btn-hover:hover {
      background: linear-gradient(90deg, #26966a, #34b87f, #26966a) !important;
      background-size: 200% !important;
      animation: shimmer .8s linear infinite, glow 2.8s ease-in-out 2.2s infinite !important;
    }
  `;
  document.head.appendChild(s);
};

export const LandingPage: React.FC = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const glowRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectStyles();
    if (user) navigate("/workbook/day0");
  }, [user, navigate]);

  // cursor glow
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top  = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: MONT, overflow: "hidden", position: "relative" }}>

      {/* Cursor glow */}
      <div ref={glowRef} style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.06) 0%, transparent 70%)", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0, transition: "left .12s ease, top .12s ease" }} />

      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        <p className="a-date" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#B0B0A8", margin: "0 0 10px" }}>
          Julio 2026
        </p>

        <p className="a-label" style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 16px" }}>
          Workbook
        </p>

        <h1 className="a-title" style={{ fontSize: "clamp(52px, 10vw, 88px)", fontWeight: 900, color: "#111111", letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 16px", textTransform: "uppercase" }}>
          Reto 3K
        </h1>

        <p className="a-sub" style={{ fontSize: "clamp(14px, 2vw, 17px)", fontWeight: 600, color: "#A1A1AA", letterSpacing: ".01em", margin: "0 0 48px" }}>
          Construye tu modelo recurrente en 60 días
        </p>

        <div className="a-hr" style={{ height: "1px", background: "#E5E5E5", margin: "0 0 40px" }} />

        <p className="a-p1" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 400, color: "#525252", lineHeight: 1.75, margin: "0 0 16px" }}>
          Para profesionales que ya saben que el modelo de cambiar tiempo por dinero tiene un techo.
        </p>

        <p className="a-p2" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 600, color: ACCENT, lineHeight: 1.75, margin: "0 0 56px" }}>
          Y han decidido que este verano va a ser el último así.
        </p>

        <div className="a-btn">
          <button
            className="btn-pulse btn-hover"
            onClick={() => navigate("/login")}
            style={{ padding: "14px 36px", background: ACCENT, border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: MONT, letterSpacing: ".02em", cursor: "pointer", transition: "transform .15s ease, opacity .15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            Comenzar mi Workbook
          </button>
        </div>

        <p className="a-micro" style={{ fontSize: "12px", color: "#B0B0A8", margin: "14px 0 0", letterSpacing: ".02em" }}>
          Solo para participantes del Reto 3K
        </p>

      </div>
    </div>
  );
};
