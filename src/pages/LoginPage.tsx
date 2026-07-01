import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/onboarding");
  }, [user, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: MONT }}>

      {/* Wordmark */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: ACCENT, margin: "0 0 6px" }}>
          Workbook
        </p>
        <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-.02em", color: "#111111", textTransform: "uppercase", margin: 0 }}>
          Reto 3K
        </p>
      </div>

      {/* Card */}
      <div style={{ maxWidth: "400px", width: "100%", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", padding: "40px 36px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-.02em", margin: "0 0 8px", textAlign: "center" }}>
          Acceder al Workbook
        </h2>
        <p style={{ fontSize: "14px", color: "#A1A1AA", textAlign: "center", margin: "0 0 32px", lineHeight: 1.5 }}>
          Usá tu cuenta de Google para ingresar
        </p>

        <GoogleSignInButton />

        <p style={{ fontSize: "12px", color: "#C4C4BC", textAlign: "center", margin: "20px 0 0", lineHeight: 1.5 }}>
          Solo para participantes del Reto 3K
        </p>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "24px", background: "none", border: "none", fontSize: "13px", color: "#B0B0A8", cursor: "pointer", fontFamily: MONT, letterSpacing: ".02em" }}
      >
        ← Volver
      </button>
    </div>
  );
};
