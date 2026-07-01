import { useState } from "react";
import { loginWithGoogle, createOrUpdateUserDocument } from "../services/authService";

const MONT = "'Montserrat', system-ui, sans-serif";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginWithGoogle();
      await createOrUpdateUserDocument(user);
      onSuccess?.();
    } catch (error: any) {
      setLoading(false);
      if (error.code === "auth/popup-blocked") {
        setErrorMsg("El popup fue bloqueado. Permití los popups para este sitio e intentá de nuevo.");
      } else if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("Cerraste la ventana de Google antes de completar el login.");
      } else if (error.code === "auth/unauthorized-domain") {
        setErrorMsg("Dominio no autorizado. Contactá al administrador.");
      } else {
        setErrorMsg(`Error: ${error.message || error.code}`);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          width: "100%", padding: "13px 20px",
          background: loading ? "#F4F4F2" : "#111111",
          color: loading ? "#A1A1AA" : "#FFFFFF",
          borderRadius: "10px", border: "none",
          fontSize: "14px", fontWeight: 700, fontFamily: MONT,
          letterSpacing: ".02em",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background .2s, transform .15s",
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#222222"; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#111111"; }}
        onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(.98)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        {/* Google G logo */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={loading ? "#A1A1AA" : "#4285F4"} />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={loading ? "#A1A1AA" : "#34A853"} />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={loading ? "#A1A1AA" : "#FBBC05"} />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={loading ? "#A1A1AA" : "#EA4335"} />
        </svg>
        {loading ? "Iniciando sesión…" : "Continuar con Google"}
      </button>

      {errorMsg && (
        <p style={{ marginTop: "14px", color: "#dc2626", fontSize: "13px", textAlign: "center", lineHeight: 1.5, fontFamily: MONT }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
};
