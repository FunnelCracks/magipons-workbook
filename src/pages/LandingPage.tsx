import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";
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
    .a-badge { opacity:0; animation: fadeUp .6s ease forwards .05s; }
    .a-date  { opacity:0; animation: fadeUp .7s ease forwards .15s; }
    .a-label { opacity:0; animation: fadeUp .7s ease forwards .25s; }
    .a-title { opacity:0; animation: titleIn 1s cubic-bezier(.16,1,.3,1) forwards .38s; }
    .a-sub   { opacity:0; animation: fadeUp .7s ease forwards .72s; }
    .a-count { opacity:0; animation: fadeUp .7s ease forwards .88s; }
    .a-hr    { transform: scaleX(0); transform-origin: left; animation: lineExpand .9s cubic-bezier(.16,1,.3,1) forwards .95s; }
    .a-p1    { opacity:0; animation: fadeUp .7s ease forwards 1.08s; }
    .a-p2    { opacity:0; animation: fadeUp .7s ease forwards 1.22s; }
    .a-social{ opacity:0; animation: fadeUp .7s ease forwards 1.3s; }
    .a-btn   { opacity:0; animation: fadeUp .7s ease forwards 1.42s; }
    .a-micro { opacity:0; animation: fadeUp .7s ease forwards 1.56s; }
    .btn-pulse { animation: glow 2.6s ease-in-out 2s infinite; }
    .btn-float { animation: float 3.2s ease-in-out infinite; }
    .btn-hover:hover {
      background: linear-gradient(90deg, #26966a, #34b87f, #26966a) !important;
      background-size: 200% !important;
      animation: shimmer .8s linear infinite, glow 2.6s ease-in-out infinite !important;
    }
    .btn-hover:hover { transform: scale(1.05) !important; }
    .orb1 { animation: orb 14s ease-in-out infinite; }
    .orb2 { animation: orb 18s ease-in-out 5s infinite reverse; }
    .live-dot { animation: dotPulse 1.8s ease-in-out infinite; }
    @keyframes rocketShake {
      0%,100% { transform: scale(1.1) rotate(0deg) translateY(0); }
      20%      { transform: scale(1.15) rotate(-10deg) translateY(-3px); }
      40%      { transform: scale(1.18) rotate(10deg) translateY(-5px); }
      60%      { transform: scale(1.15) rotate(-7deg) translateY(-3px); }
      80%      { transform: scale(1.2) rotate(6deg) translateY(-6px); }
    }
    .rocket-shake { animation: rocketShake .45s ease-in-out infinite; }
    @keyframes chipFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    .chip { animation: chipFloat 3.4s ease-in-out infinite; }
    .chip:nth-child(2) { animation-delay: .7s; }
    .chip:nth-child(3) { animation-delay: 1.4s; }
    .chip:nth-child(4) { animation-delay: .35s; }
    .chip:nth-child(5) { animation-delay: 1.05s; }
    .side-chips-left {
      position: absolute; left: 32px; top: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 14px;
      z-index: 2; opacity: 0; animation: fadeUp .8s ease forwards .6s;
    }
    .side-chips-right {
      position: absolute; right: 32px; top: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 14px;
      z-index: 2; opacity: 0; animation: fadeUp .8s ease forwards .7s;
    }
    .side-chips-left .chip:nth-child(2) { margin-left: 20px; }
    .side-chips-right .chip:nth-child(1) { margin-left: 12px; }
    @media (max-width: 1100px) {
      .side-chips-left, .side-chips-right { display: none; }
    }
    .mobile-chips { display: none; flex-wrap: wrap; justify-content: center; gap: 7px; margin-bottom: 28px; opacity: 0; animation: fadeUp .7s ease forwards .58s; }
    @media (max-width: 1100px) {
      .mobile-chips { display: flex; }
    }
  `;
  document.head.appendChild(s);
};

const AVATARS = [
  { bg: "#26966a", letter: "M" },
  { bg: "#1a7a52", letter: "A" },
  { bg: "#34b87f", letter: "J" },
  { bg: "#0f5c3e", letter: "C" },
];

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
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: MONT, overflow: "hidden", position: "relative" }}>

      {/* Cursor glow */}
      <div ref={glowRef} style={{ position: "fixed", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.07) 0%, transparent 70%)", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0, transition: "left .12s ease, top .12s ease" }} />

      {/* Ambient orbs */}
      <div className="orb1" style={{ position: "fixed", top: "8%", right: "6%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div className="orb2" style={{ position: "fixed", bottom: "12%", left: "4%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(38,150,106,.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Side chips — desktop only */}
      <div className="side-chips-left">
        {[
          { icon: "🎯", label: "3 días en vivo" },
          { icon: "🗺️", label: "Acceso al Mapa" },
          { icon: "💬", label: "Feedback personalizado" },
        ].map(({ icon, label }) => (
          <span key={label} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: "#525252", boxShadow: "0 2px 8px rgba(0,0,0,.06)", whiteSpace: "nowrap", fontFamily: MONT }}>
            <span style={{ fontSize: "13px" }}>{icon}</span>{label}
          </span>
        ))}
      </div>
      <div className="side-chips-right">
        {[
          { icon: "⚡", label: "Modelo recurrente" },
          { icon: "🤝", label: "Comunidad exclusiva" },
        ].map(({ icon, label }) => (
          <span key={label} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "20px", padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: "#525252", boxShadow: "0 2px 8px rgba(0,0,0,.06)", whiteSpace: "nowrap", fontFamily: MONT }}>
            <span style={{ fontSize: "13px" }}>{icon}</span>{label}
          </span>
        ))}
      </div>

      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Live badge */}
        <div className="a-badge" style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(38,150,106,.1)", border: "1px solid rgba(38,150,106,.28)", borderRadius: "20px", padding: "6px 16px", marginBottom: "20px" }}>
          <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
          <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: ACCENT }}>En vivo · 28 julio</span>
        </div>

        <p className="a-date" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "#B0B0A8", margin: "0 0 8px" }}>
          Julio 2026
        </p>

        <p className="a-label" style={{ fontSize: "13px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 16px" }}>
          Mapa
        </p>

        <h1 className="a-title" style={{ fontSize: "clamp(52px, 10vw, 88px)", fontWeight: 900, color: "#111111", letterSpacing: "-.02em", lineHeight: 1, margin: "0 0 16px", textTransform: "uppercase" }}>
          Reto 3K
        </h1>

        <p className="a-sub" style={{ fontSize: "clamp(14px, 2vw, 17px)", fontWeight: 600, color: "#A1A1AA", letterSpacing: ".01em", margin: "0 0 22px" }}>
          Construye tu modelo recurrente en 60 días
        </p>

        {/* Benefit chips — mobile only */}
        <div className="mobile-chips">
          {[
            { icon: "🎯", label: "3 días en vivo" },
            { icon: "🗺️", label: "Acceso al Mapa" },
            { icon: "💬", label: "Feedback personalizado" },
            { icon: "⚡", label: "Modelo recurrente" },
            { icon: "🤝", label: "Comunidad exclusiva" },
          ].map(({ icon, label }) => (
            <span key={label} className="chip" style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "20px", padding: "5px 11px", fontSize: "11px", fontWeight: 700, color: "#525252", boxShadow: "0 2px 6px rgba(0,0,0,.05)", whiteSpace: "nowrap", fontFamily: MONT }}>
              <span style={{ fontSize: "12px" }}>{icon}</span>{label}
            </span>
          ))}
        </div>

        {/* Countdown */}
        <div className="a-count" style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "44px", background: "#fff", border: "1px solid #E5E5E5", borderRadius: "12px", padding: "14px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
          {[
            { val: d, label: "días" },
            { val: h, label: "horas" },
            { val: m, label: "min" },
            { val: s, label: "seg" },
          ].map(({ val, label }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {i > 0 && <span style={{ fontSize: "20px", fontWeight: 900, color: "#D1D1CB", marginBottom: "10px", padding: "0 2px" }}>:</span>}
              <div style={{ textAlign: "center", minWidth: "42px" }}>
                <div style={{ fontSize: "26px", fontWeight: 900, color: "#111111", fontVariantNumeric: "tabular-nums", lineHeight: 1, letterSpacing: "-.02em" }}>{pad(val)}</div>
                <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#B0B0A8", marginTop: "4px" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="a-hr" style={{ height: "1px", background: "#E5E5E5", margin: "0 0 36px" }} />

        <p className="a-p1" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 400, color: "#525252", lineHeight: 1.75, margin: "0 0 16px" }}>
          Para profesionales que ya saben que el modelo de cambiar tiempo por dinero tiene un techo.
        </p>

        <p className="a-p2" style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 600, color: ACCENT, lineHeight: 1.75, margin: "0 0 36px" }}>
          Y han decidido que este verano va a ser el último así.
        </p>

        {/* Social proof */}
        <div className="a-social" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ display: "flex" }}>
            {AVATARS.map(({ bg, letter }, i) => (
              <div key={i} style={{ width: "26px", height: "26px", borderRadius: "50%", background: bg, border: "2px solid #fff", marginLeft: i === 0 ? 0 : "-7px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, zIndex: AVATARS.length - i }}>
                {letter}
              </div>
            ))}
          </div>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>
            <strong style={{ color: "#111111" }}>+247</strong> personas ya tienen su Mapa
          </span>
        </div>

        {/* CTA */}
        <div className="a-btn">
        <div className="btn-float">
          <button
            className="btn-pulse"
            onClick={() => navigate("/login")}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
              position: "relative", overflow: "hidden",
              width: "240px", height: "56px",
              background: ACCENT, border: "none", borderRadius: "10px",
              color: "#fff", fontFamily: MONT, cursor: "pointer",
              transform: hovering ? "scale(1.06)" : "scale(1)",
              transition: "transform .25s cubic-bezier(.16,1,.3,1), box-shadow .25s",
            }}
          >
            {/* Label default */}
            <span style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              fontSize: "16px", fontWeight: 800, letterSpacing: ".02em",
              opacity: hovering ? 0 : 1,
              transform: hovering ? "translateY(10px) scale(.9)" : "translateY(0) scale(1)",
              transition: "all .22s ease",
              pointerEvents: "none",
            }}>
              🚀 Comenzar mi Mapa
            </span>
            {/* Rocket hover */}
            <span
              className={hovering ? "rocket-shake" : ""}
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "34px",
                opacity: hovering ? 1 : 0,
                transform: hovering ? "scale(1)" : "scale(0.3) translateY(12px)",
                transition: "opacity .22s ease, transform .28s cubic-bezier(.16,1,.3,1)",
                pointerEvents: "none",
              }}
            >
              🚀
            </span>
          </button>
        </div>
        </div>

        <p className="a-micro" style={{ fontSize: "11px", color: "#D97706", margin: "14px 0 4px", letterSpacing: ".02em", fontWeight: 700 }}>
          ⚡ Acceso gratuito · Solo hasta el 27 de julio
        </p>
        <p style={{ fontSize: "11px", color: "#B0B0A8", margin: 0, letterSpacing: ".02em" }}>
          Solo para participantes del Reto 3K
        </p>

      </div>
    </div>
  );
};
