import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

export const AdminLoginPage: React.FC = () => {
  const [pin,     setPin]     = useState("");
  const [error,   setError]   = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (pin === "2026") {
      navigate("/admin/select");
    } else {
      setError("PIN incorrecto. Intentá de nuevo.");
      setPin("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px", fontFamily: MONT }}>
      <div style={{ background: "#fff", border: "1px solid #E5E5E5", borderRadius: "16px", padding: "48px 40px", width: "100%", maxWidth: "380px" }}>

        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 10px" }}>
          Magipons
        </p>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "#111111", letterSpacing: "-.02em", margin: "0 0 6px", fontFamily: MONT }}>
          Panel Instructor
        </h1>
        <p style={{ fontSize: "13px", color: "#A1A1AA", margin: "0 0 32px" }}>
          Ingresá el PIN para acceder
        </p>

        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "8px" }}>
          PIN de acceso
        </label>

        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="····"
          maxLength={6}
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 16px",
            border: `1px solid ${focused ? ACCENT : "#E5E5E5"}`,
            borderRadius: "8px",
            fontSize: "22px",
            letterSpacing: ".3em",
            textAlign: "center",
            color: "#111111",
            outline: "none",
            fontFamily: MONT,
            background: "#fff",
            caretColor: ACCENT,
            transition: "border-color .15s",
          }}
        />

        {error && (
          <p style={{ fontSize: "13px", color: "#DC2626", margin: "10px 0 0", textAlign: "center" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "13px", background: "#111111", border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "20px", fontFamily: MONT, letterSpacing: ".02em", transition: "background .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#222222"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#111111"; }}
        >
          Continuar →
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#B0B0A8", margin: "20px 0 0" }}>
          Acceso restringido a instructores
        </p>
      </div>
    </div>
  );
};
