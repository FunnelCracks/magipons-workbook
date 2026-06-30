import { useState } from "react";
import { useNavigate } from "react-router-dom";

const s = {
  page: { minHeight: "100vh", background: "#EDEDF2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" } as React.CSSProperties,
  card: { background: "#fff", border: "1.5px solid #D8D9E4", borderRadius: "12px", padding: "48px 40px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(55,81,196,.08)" } as React.CSSProperties,
  eyebrow: { fontSize: "11px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "#3751C4", marginBottom: "8px" },
  title: { fontSize: "26px", fontWeight: 900, color: "#111827", letterSpacing: "-.02em", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#6C739B", marginBottom: "36px" },
  label: { display: "block", fontSize: "12px", fontWeight: 700, color: "#374163", letterSpacing: ".04em", textTransform: "uppercase" as const, marginBottom: "8px" },
  input: { width: "100%", padding: "12px 16px", border: "1.5px solid #D8D9E4", borderRadius: "8px", fontSize: "22px", letterSpacing: ".3em", textAlign: "center" as const, color: "#111827", outline: "none", fontFamily: "inherit", background: "#fff" } as React.CSSProperties,
  error: { background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#DC2626", marginTop: "12px" },
  btn: { width: "100%", padding: "13px", background: "#3751C4", border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: 800, cursor: "pointer", marginTop: "20px", fontFamily: "inherit", letterSpacing: ".01em" } as React.CSSProperties,
  footer: { textAlign: "center" as const, fontSize: "12px", color: "#A8ADCA", marginTop: "24px" },
};

export const AdminLoginPage: React.FC = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
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
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.eyebrow}>Magipons</p>
        <h1 style={s.title}>Panel Instructor</h1>
        <p style={s.sub}>Ingresá el PIN para acceder</p>

        <label style={s.label}>PIN de acceso</label>
        <input
          style={s.input}
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          placeholder="····"
          maxLength={6}
        />
        {error && <div style={s.error}>{error}</div>}

        <button style={s.btn} onClick={handleContinue}>
          Continuar →
        </button>

        <p style={s.footer}>Acceso restringido a instructores</p>
      </div>
    </div>
  );
};
