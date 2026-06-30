import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveUserOnboarding, hasCompletedOnboarding } from "../services/firestoreService";

const COUNTRIES = [
  { code: "AR", flag: "🇦🇷", name: "Argentina",       prefix: "+54"  },
  { code: "ES", flag: "🇪🇸", name: "España",           prefix: "+34"  },
  { code: "MX", flag: "🇲🇽", name: "México",           prefix: "+52"  },
  { code: "CO", flag: "🇨🇴", name: "Colombia",         prefix: "+57"  },
  { code: "CL", flag: "🇨🇱", name: "Chile",            prefix: "+56"  },
  { code: "UY", flag: "🇺🇾", name: "Uruguay",          prefix: "+598" },
  { code: "PE", flag: "🇵🇪", name: "Perú",             prefix: "+51"  },
  { code: "EC", flag: "🇪🇨", name: "Ecuador",          prefix: "+593" },
  { code: "BO", flag: "🇧🇴", name: "Bolivia",          prefix: "+591" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay",         prefix: "+595" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela",        prefix: "+58"  },
  { code: "DO", flag: "🇩🇴", name: "Rep. Dominicana",  prefix: "+1"   },
  { code: "PA", flag: "🇵🇦", name: "Panamá",           prefix: "+507" },
  { code: "US", flag: "🇺🇸", name: "EE.UU.",           prefix: "+1"   },
  { code: "BR", flag: "🇧🇷", name: "Brasil",           prefix: "+55"  },
];

const BORDER = "#D8E0F0";
const FOCUS_COLOR = "#4F46E5";

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [country, setCountry]     = useState(COUNTRIES[0]);
  const [phone, setPhone]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [checking, setChecking]   = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    hasCompletedOnboarding(user.uid).then((done) => {
      if (done) navigate("/workbook/day0");
      else setChecking(false);
    });
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("Completá todos los campos.");
      return;
    }
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const fullPhone = `${country.prefix} ${phone.trim()}`;
      await saveUserOnboarding(user.uid, firstName.trim(), lastName.trim(), fullPhone);
      navigate("/workbook/day0");
    } catch {
      setError("Error al guardar. Intentá de nuevo.");
      setSaving(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F6FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6B7280", fontFamily: "system-ui, sans-serif" }}>Cargando…</p>
      </div>
    );
  }

  const inputStyle = (focused?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    border: `1.5px solid ${focused ? FOCUS_COLOR : BORDER}`,
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111827",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "system-ui, sans-serif",
    boxShadow: focused ? `0 0 0 3px rgba(79,70,229,.12)` : "none",
    transition: "border-color .15s, box-shadow .15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 20px 60px rgba(79,70,229,.12)", padding: "48px 44px", width: "100%", maxWidth: "460px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#4F46E5", marginBottom: "8px" }}>
            RETO 3K · Magipons
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#111827", letterSpacing: "-.03em", marginBottom: "6px" }}>
            ¡Bienvenido/a!
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>
            Antes de comenzar, completá tus datos de contacto.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", letterSpacing: ".03em" }}>
              NOMBRE
            </label>
            <FocusInput
              type="text"
              placeholder="Ej: María"
              value={firstName}
              onChange={setFirstName}
              inputStyle={inputStyle}
            />
          </div>

          {/* Apellido */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", letterSpacing: ".03em" }}>
              APELLIDO
            </label>
            <FocusInput
              type="text"
              placeholder="Ej: González"
              value={lastName}
              onChange={setLastName}
              inputStyle={inputStyle}
            />
          </div>

          {/* Teléfono */}
          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", letterSpacing: ".03em" }}>
              TELÉFONO
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {/* Country selector */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <select
                  value={country.code}
                  onChange={(e) => setCountry(COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0])}
                  style={{
                    padding: "11px 36px 11px 12px",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: "8px",
                    fontSize: "15px",
                    color: "#111827",
                    background: "#fff",
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    fontFamily: "system-ui, sans-serif",
                    minWidth: "110px",
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.prefix}
                    </option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "11px", color: "#9CA3AF" }}>▼</span>
              </div>

              {/* Phone number */}
              <FocusInput
                type="tel"
                placeholder="Ej: 9 11 1234 5678"
                value={phone}
                onChange={setPhone}
                inputStyle={inputStyle}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: "#DC2626", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: "100%", padding: "13px", background: saving ? "#A5B4FC" : "#4F46E5",
              color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px",
              fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "system-ui, sans-serif", transition: "background .2s",
            }}
          >
            {saving ? "Guardando…" : "Comenzar el workbook →"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Small helper to track focus without state in parent
const FocusInput: React.FC<{
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  inputStyle: (focused?: boolean) => React.CSSProperties;
}> = ({ type, placeholder, value, onChange, inputStyle }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  );
};
