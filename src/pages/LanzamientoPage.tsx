import React from "react";
import { useNavigate } from "react-router-dom";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

const css = document.createElement("style");
css.textContent = `
  @keyframes blurIn {
    from { opacity: 0; filter: blur(10px); transform: translateY(12px); }
    to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
  }
  .bi { opacity: 0; animation: blurIn .7s cubic-bezier(.16,1,.3,1) forwards; }

  @keyframes blurOut {
    from { opacity: 1; filter: blur(0); }
    to   { opacity: 0; filter: blur(18px); }
  }
  .blur-out { animation: blurOut .6s cubic-bezier(.4,0,1,1) forwards !important; }

  @keyframes rocketIdle {
    0%, 100% { transform: translateY(0)   rotate(-5deg); }
    50%       { transform: translateY(-8px) rotate(-5deg); }
  }
  @keyframes rocketLaunch {
    0%   { transform: rotate(-5deg)  translateY(0);      opacity: 1; }
    8%   { transform: rotate(-5deg)  translateY(10px);   opacity: 1; }
    35%  { transform: rotate(-12deg) translateY(-140px); opacity: 1; }
    100% { transform: rotate(-28deg) translateY(-900px); opacity: 0; }
  }

  .rocket-idle   { animation: rocketIdle 2.2s ease-in-out infinite; display:inline-block; cursor:pointer; }
  .rocket-still  { display:inline-block; transform: rotate(-5deg); }
  .rocket-launch { animation: rocketLaunch 1.1s cubic-bezier(.15,0,.3,1) forwards; display:inline-block; }

  @keyframes screenShake {
    0%,100% { transform:translate(0,0); }
    15%     { transform:translate(-4px,2px); }
    30%     { transform:translate(4px,-3px); }
    45%     { transform:translate(-3px,3px); }
    60%     { transform:translate(3px,-2px); }
    75%     { transform:translate(-2px,2px); }
    90%     { transform:translate(2px,-1px); }
  }
  .screen-shake { animation: screenShake .45s ease-in-out; }

  /* Ground embers */
  @keyframes emberA { to { transform:translate(-70px, 25px) scale(0); opacity:0; } }
  @keyframes emberB { to { transform:translate( 72px, 20px) scale(0); opacity:0; } }
  @keyframes emberC { to { transform:translate(-48px,-28px) scale(0); opacity:0; } }
  @keyframes emberD { to { transform:translate( 52px,-22px) scale(0); opacity:0; } }
  @keyframes emberE { to { transform:translate(-92px,  8px) scale(0); opacity:0; } }
  @keyframes emberF { to { transform:translate( 95px, 12px) scale(0); opacity:0; } }
  @keyframes smokeA { to { transform:translate(calc(-50% - 42px), 65px) scale(3.2); opacity:0; } }
  @keyframes smokeB { to { transform:translate(calc(-50% + 46px), 58px) scale(3.5); opacity:0; } }
  @keyframes smokeC { to { transform:translate(calc(-50% -  6px), 85px) scale(4.2); opacity:0; } }
  @keyframes smokeD { to { transform:translate(calc(-50% + 22px), 72px) scale(3.8); opacity:0; } }
  @keyframes blastRing  { to { transform:translate(-50%,-50%) scale(2);   opacity:0; } }
  @keyframes blastRing2 { to { transform:translate(-50%,-50%) scale(3.2); opacity:0; } }

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

/* ── Canvas fire component ─────────────────────────────────────────── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; size: number; hue: number;
}

const FireCanvas: React.FC<{ active: boolean; launching: boolean }> = ({ active, launching }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rafRef    = React.useRef<number>(0);
  const t0Ref     = React.useRef<number | null>(null);
  const particles = React.useRef<Particle[]>([]);

  React.useEffect(() => {
    if (!active) { particles.current = []; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const CX = canvas.width / 2;
    const CY = 18; // spawn y (near top = thruster)

    const spawn = (intensity: number) => {
      const spread = 6 + intensity * 14;
      particles.current.push({
        x: CX + (Math.random() - 0.5) * spread,
        y: CY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.8 * intensity,
        vy: (1.8 + Math.random() * 2.2) * intensity,   // downward = positive y
        life: 0.85 + Math.random() * 0.15,
        decay: 0.014 + Math.random() * 0.016,
        size: 3 + Math.random() * intensity * 9,
        hue: Math.random() * 30,                        // orange-to-red variance
      });
    };

    const draw = (ts: number) => {
      if (t0Ref.current === null) t0Ref.current = ts;
      const elapsed = ts - t0Ref.current;

      // ramp: 0→1 over 500ms during charging, stays at 1.4 during launch
      const intensity = launching
        ? Math.min(1.6, 1 + elapsed / 250)
        : Math.min(1, elapsed / 480);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // spawn
      const count = Math.ceil(intensity * (launching ? 7 : 5));
      for (let i = 0; i < count; i++) spawn(intensity);

      // update + draw
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy *= 1.04;           // gravity / acceleration
        p.vx *= 0.98;           // dampen lateral drift
        p.size *= 1.035;        // expand as they fall
        p.life -= p.decay;
        if (p.life <= 0) { particles.current.splice(i, 1); continue; }

        // color: white-yellow core fading to red then transparent
        const r = 255;
        const g = Math.floor(Math.max(0, p.life * 160 + 20 - p.hue * 2));
        const b = Math.floor(Math.max(0, (p.life - 0.6) * 80));
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life * 1.1);
        ctx.shadowBlur  = p.size * 2.5;
        ctx.shadowColor = `rgba(255,${Math.floor(g * 0.6)},0,0.7)`;
        ctx.fillStyle   = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    t0Ref.current = null;
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, launching]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={220}
      style={{
        position: "absolute",
        top: "52px",            // below rocket emoji (thruster area)
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    />
  );
};

/* ── Ember helper ──────────────────────────────────────────────────── */
const Ember = ({ anim, color, size, delay }: { anim: string; color: string; size: number; delay: string }) => (
  <div style={{
    position: "absolute", top: 0, left: 0,
    width: size, height: size, borderRadius: "50%",
    background: color, boxShadow: `0 0 ${size * 2}px ${color}`,
    animation: `${anim} .85s ease-out ${delay} forwards`,
  }} />
);

/* ── Main page ─────────────────────────────────────────────────────── */
type Phase = "idle" | "blurring" | "charging" | "launching";

export const LanzamientoPage: React.FC = () => {
  const navigate = useNavigate();
  const [phase,   setPhase]   = React.useState<Phase>("idle");
  const [shaking, setShaking] = React.useState(false);
  const rocketRef = React.useRef<HTMLSpanElement>(null);
  const [fixedPos,  setFixedPos]  = React.useState<{ top: number; left: number } | null>(null);
  const [groundPos, setGroundPos] = React.useState<{ top: number; left: number } | null>(null);

  const handleLaunch = () => {
    if (phase !== "idle") return;
    if (rocketRef.current) {
      const r = rocketRef.current.getBoundingClientRect();
      setFixedPos({ top: r.top, left: r.left });
      setGroundPos({ top: r.top + r.height * .82, left: r.left + r.width * .38 });
    }
    setPhase("blurring");
    setTimeout(() => setPhase("charging"),  600);
    setTimeout(() => {
      setPhase("launching");
      setShaking(true);
      setTimeout(() => setShaking(false), 460);
    }, 1150);
    setTimeout(() => navigate("/workbook/day0"), 2400);
  };

  const showFixed  = phase !== "idle";
  const fireActive = phase === "charging" || phase === "launching";
  const groundOn   = phase === "launching";

  const rocketClass =
    phase === "launching" ? "rocket-launch" :
    phase === "charging"  ? "rocket-still"  :
    "rocket-idle";

  return (
    <>
      <div className={shaking ? "screen-shake" : ""} style={{ minHeight: "100vh", background: BG }}>
        <div
          className={phase !== "idle" ? "blur-out" : ""}
          style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 24px", fontFamily: MONT }}
        >
          <div style={{ maxWidth: "520px", width: "100%" }}>

            <p className="bi" style={{ animationDelay: ".05s", fontSize: "11px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 20px" }}>
              Workbook · Reto 3K
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
                className="rocket-idle"
                onClick={handleLaunch}
                style={{ fontSize: "72px", display: "inline-block", visibility: showFixed ? "hidden" : "visible" }}
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
      </div>

      {/* Fixed rocket + canvas fire */}
      {fixedPos && showFixed && (
        <div style={{ position: "fixed", top: fixedPos.top, left: fixedPos.left, zIndex: 300, pointerEvents: "none" }}>
          <span
            className={rocketClass}
            style={{
              fontSize: "72px", display: "inline-block",
              filter: fireActive ? "drop-shadow(0 0 12px rgba(255,150,0,0.6))" : "none",
              transition: "filter .3s",
            }}
          >🚀</span>
          <FireCanvas active={fireActive} launching={phase === "launching"} />
        </div>
      )}

      {/* Ground effects on lift-off */}
      {groundOn && groundPos && (
        <div style={{ position: "fixed", top: groundPos.top, left: groundPos.left, zIndex: 299, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 90, height: 90, border: "2px solid rgba(255,180,60,.65)", borderRadius: "50%", animation: "blastRing .6s ease-out forwards" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: 90, height: 90, border: "1.5px solid rgba(255,130,30,.4)", borderRadius: "50%", animation: "blastRing2 .9s ease-out .05s forwards" }} />
          {[
            { anim: "smokeA", size: 28 }, { anim: "smokeB", size: 24 },
            { anim: "smokeC", size: 38 }, { anim: "smokeD", size: 20 },
          ].map(({ anim, size }) => (
            <div key={anim} style={{ position: "absolute", top: 0, left: "50%", width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,150,143,.6) 0%, transparent 70%)", animation: `${anim} 1.1s ease-out forwards` }} />
          ))}
          <Ember anim="emberA" color="#FF6B00" size={7}  delay="0s"    />
          <Ember anim="emberB" color="#FFD700" size={6}  delay=".03s"  />
          <Ember anim="emberC" color="#FF4400" size={5}  delay=".06s"  />
          <Ember anim="emberD" color="#FFAA00" size={6}  delay=".02s"  />
          <Ember anim="emberE" color="#FF6B00" size={4}  delay=".04s"  />
          <Ember anim="emberF" color="#FFD700" size={5}  delay=".01s"  />
        </div>
      )}
    </>
  );
};
