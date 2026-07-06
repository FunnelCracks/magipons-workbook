import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";
const TEXT   = "#111111";
const MUTED  = "#A1A1AA";
const TARGET = new Date("2026-07-28T09:00:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const injectStyles = () => {
  if (document.getElementById("landing-styles")) return;
  const s = document.createElement("style");
  s.id = "landing-styles";
  s.textContent = `
    @keyframes marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track { animation: marquee 18s linear infinite; }
    .marquee-wrap:hover .marquee-track { animation-play-state: paused; }
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
      50%      { box-shadow: 0 0 0 16px rgba(38,150,106,.2); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-7px); }
    }
    @keyframes orb {
      0%   { transform: translate(0,0) scale(1); }
      33%  { transform: translate(30px,-20px) scale(1.06); }
      66%  { transform: translate(-20px,15px) scale(.96); }
      100% { transform: translate(0,0) scale(1); }
    }
    @keyframes dotPulse {
      0%,100% { opacity:.4; transform:scale(1); }
      50%      { opacity:1;  transform:scale(1.3); }
    }
    @keyframes gradFlow {
      0%,100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    .a-badge { opacity:0; animation: fadeUp .6s ease forwards .05s; }
    .a-date  { opacity:0; animation: fadeUp .7s ease forwards .15s; }
    .a-label { opacity:0; animation: fadeUp .7s ease forwards .25s; }
    .a-title {
      opacity: 0;
      background: linear-gradient(120deg, #111 0%, #26966a 42%, #34b87f 58%, #111 90%);
      background-size: 300% 300%;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: titleIn 1s cubic-bezier(.16,1,.3,1) forwards .38s, gradFlow 4s ease 1.38s infinite;
    }
    .a-sub   { opacity:0; animation: fadeUp .7s ease forwards .72s; }
    .a-count { opacity:0; animation: fadeUp .7s ease forwards .88s; }
    .a-hr    { transform: scaleX(0); transform-origin: left; animation: lineExpand .9s cubic-bezier(.16,1,.3,1) forwards .95s; }
    .a-p1    { opacity:0; animation: fadeUp .7s ease forwards 1.08s; }
    .a-p2    { opacity:0; animation: fadeUp .7s ease forwards 1.22s; }
    .a-social{ opacity:0; animation: fadeUp .7s ease forwards 1.3s; }
    .a-phrase{ opacity:0; animation: fadeUp .7s ease forwards 1.36s; }
    .a-btn   { opacity:0; animation: fadeUp .7s ease forwards 1.42s; }
    .a-micro { opacity:0; animation: fadeUp .7s ease forwards 1.56s; }
    .btn-pulse { animation: glow 2.6s ease-in-out 2s infinite; }
    .btn-float { animation: float 3.2s ease-in-out infinite; }
    @keyframes arrowBounce {
      0%, 100% { transform: translateX(0); }
      50%       { transform: translateX(6px); }
    }
    .btn-arrow { display: inline-block; margin-left: 8px; font-size: 1.2em; animation: arrowBounce 1.2s cubic-bezier(.45,0,.55,1) infinite; }
    .btn-hover:hover {
      filter: brightness(1.08);
      transform: scale(1.05) !important;
    }
    .orb1 { animation: orb 14s ease-in-out infinite; }
    .orb2 { animation: orb 18s ease-in-out 5s infinite reverse; }
    .live-dot { animation: dotPulse 1.8s ease-in-out infinite; }
    @media (max-width: 600px) {
      .a-social { display: block !important; }
      .a-count  { margin-bottom: 18px !important; }
      .a-hr     { margin-bottom: 18px !important; }
    }
  `;
  document.head.appendChild(s);
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const glowRef   = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const { d, h, m, s } = useCountdown(TARGET);

  useEffect(() => {
    injectStyles();
    if (user) navigate("/workbook/day0");
  }, [user, navigate]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top  = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 24px 40px", fontFamily: MONT, overflow: "hidden", position: "relative" }}>

      {/* Cursor glow */}
      <div ref={glowRef} style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.07) 0%, transparent 70%)", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0, transition: "left .12s ease, top .12s ease" }} />

      {/* Ambient orbs */}
      <div className="orb1" style={{ position: "fixed", top: "8%", right: "6%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div className="orb2" style={{ position: "fixed", bottom: "12%", left: "4%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Live badge */}
        <div className="a-badge" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(52,184,127,.1)", border: "1px solid rgba(52,184,127,.25)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
          <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: ACCENT }}>En vivo · 28 julio</span>
        </div>

        <p className="a-date" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>
          Julio 2026
        </p>

        <p className="a-label" style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 16px" }}>
          Mapa
        </p>

        <h1 className="a-title" style={{ fontSize: "clamp(52px, 10vw, 88px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 16px", textTransform: "uppercase" }}>
          Reto 3K
        </h1>

        <p className="a-sub" style={{ fontSize: "clamp(14px, 2vw, 17px)", fontWeight: 600, color: MUTED, letterSpacing: ".01em", margin: "0 0 22px" }}>
          Construye tu modelo recurrente en 60 días
        </p>

        {/* Countdown */}
        <div className="a-count" style={{ display: "inline-flex", alignItems: "flex-start", gap: "0", marginBottom: "44px" }}>
          {[
            { val: d, label: "días" },
            { val: h, label: "horas" },
            { val: m, label: "min" },
            { val: s, label: "seg" },
          ].map(({ val, label }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start" }}>
              {i > 0 && <span style={{ fontSize: "clamp(28px,6vw,40px)", fontWeight: 300, color: "#D4D4CE", lineHeight: 1, margin: "0 6px", paddingTop: "2px" }}>·</span>}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(32px,7vw,48px)", fontWeight: 900, color: TEXT, fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: "-.03em" }}>{pad(val)}</div>
                <div style={{ fontSize: "9px", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: MUTED, marginTop: "2px" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>


        {/* Marquee */}
        <div className="a-p1 marquee-wrap" style={{ position: "relative", overflow: "hidden", width: "100vw", marginLeft: "calc(-50vw + 50%)", marginBottom: "36px" }}>
          <div className="marquee-track" style={{ display: "flex", alignItems: "center", gap: "12px", width: "max-content" }}>
            {[...Array(2)].flatMap(() =>
              [
                { icon: "🎯", label: "3 días en vivo" },
                { icon: "💬", label: "Feedback personalizado" },
                { icon: "⚡", label: "Modelo recurrente" },
                { icon: "🤝", label: "Comunidad exclusiva" },
                { icon: "🎯", label: "3 días en vivo" },
                { icon: "💬", label: "Feedback personalizado" },
                { icon: "⚡", label: "Modelo recurrente" },
                { icon: "🤝", label: "Comunidad exclusiva" },
              ].map(({ icon, label }, i) => (
                <span key={`${label}-${i}`} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "#fff", border: "1px solid #E8E8E4",
                  borderRadius: "20px", padding: "7px 16px",
                  fontSize: "12px", fontWeight: 700, color: "#525252",
                  boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  whiteSpace: "nowrap", fontFamily: MONT,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: "13px" }}>{icon}</span>{label}
                </span>
              ))
            )}
          </div>
          {/* Fade edges */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #FAFAF9, transparent)", pointerEvents: "none", zIndex: 1 }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, #FAFAF9, transparent)", pointerEvents: "none", zIndex: 1 }} />
        </div>

        <p className="a-p1" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 400, color: "#525252", lineHeight: 1.75, margin: "0 0 20px" }}>
          Para profesionales que ya saben que el modelo de cambiar tiempo por dinero tiene un techo.
        </p>

        <p className="a-p2" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 600, color: ACCENT, lineHeight: 1.75, margin: "0 0 40px" }}>
          Y han decidido que este verano va a ser el último así.
        </p>

        {/* CTA */}
        <div className="a-btn">
          <div className="btn-float">
            <button
              className="btn-pulse btn-hover"
              onClick={() => navigate("/login")}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                position: "relative", overflow: "hidden",
                width: "260px", height: "58px",
                background: ACCENT, border: "none", borderRadius: "10px",
                color: "#fff", fontFamily: MONT, cursor: "pointer",
                transform: hovering ? "scale(1.06)" : "scale(1)",
                transition: "transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s, filter .25s",
              }}
            >
              <span style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: 900, letterSpacing: ".02em",
                pointerEvents: "none",
              }}>
                Comenzar mi Mapa{" "}<span className="btn-arrow">→</span>
              </span>
            </button>
          </div>
        </div>

        <p className="a-micro" style={{ fontSize: "11px", color: "#D97706", margin: "14px 0 4px", letterSpacing: ".02em", fontWeight: 700 }}>
          ⚡ Acceso gratuito · Solo hasta el 27 de julio
        </p>
        <p style={{ fontSize: "11px", color: MUTED, margin: 0, letterSpacing: ".02em" }}>
          Solo para participantes del Reto 3K
        </p>

      </div>
    </div>
  );
};
