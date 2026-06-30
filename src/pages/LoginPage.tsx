import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/workbook/day0");
    }
  }, [user, navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", padding: "48px", maxWidth: "440px", width: "100%" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", marginBottom: "8px", textAlign: "center" }}>
          Bienvenido
        </h1>
        <p style={{ color: "#6b7280", textAlign: "center", marginBottom: "32px" }}>
          Inicia sesión para continuar con tu workbook
        </p>
        <GoogleSignInButton onSuccess={() => navigate("/workbook/day0")} />
      </div>
    </div>
  );
};
