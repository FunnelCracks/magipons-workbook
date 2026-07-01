import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { saveUserOnboarding, hasCompletedOnboarding } from "../services/firestoreService";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";

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

const IS_DEV = import.meta.env.DEV;

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [country,   setCountry]   = useState(COUNTRIES[0]);
  const [phone,     setPhone]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [checking,  setChecking]  = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (IS_DEV) { setChecking(false); return; } // preview bypass
      navigate("/login");
      return;
    }
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
    if (!user) {
      if (IS_DEV) { navigate("/intro"); return; }
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fullPhone = `${country.prefix} ${phone.trim()}`;
      await saveUserOnboarding(user.uid, firstName.trim(), lastName.trim(), fullPhone);
      navigate("/intro");
    } catch {
      setError("Error al guardar. Intentá de nuevo.");
      setSaving(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#A1A1AA", fontFamily: MONT, fontSize: "14px" }}>Cargando…</p>
      </div>
    );
  }

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
      <div style={{ maxWidth: "420px", width: "100%", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "16px", padding: "40px 36px" }}>

        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-.02em", margin: "0 0 6px" }}>
          Antes de comenzar
        </h2>
        <p style={{ fontSize: "14px", color: "#A1A1AA", margin: "0 0 32px", lineHeight: 1.5 }}>
          Completá tus datos para personalizar tu experiencia.
        </p>

        <form onSubmit={handleSubmit}>

          {/* Nombre */}
          <Field label="Nombre">
            <FocusInput type="text" placeholder="Ej: María" value={firstName} onChange={setFirstName} />
          </Field>

          {/* Apellido */}
          <Field label="Apellido">
            <FocusInput type="text" placeholder="Ej: González" value={lastName} onChange={setLastName} />
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono">
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <select
                  value={country.code}
                  onChange={(e) => setCountry(COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0])}
                  style={{ padding: "10px 32px 10px 12px", border: "1px solid #E5E5E5", borderRadius: "8px", fontSize: "14px", color: "#111111", background: "#fff", outline: "none", cursor: "pointer", appearance: "none", fontFamily: MONT, minWidth: "100px" }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.prefix}</option>
                  ))}
                </select>
                <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "10px", color: "#A1A1AA" }}>▼</span>
              </div>
              <FocusInput type="tel" placeholder="Ej: 9 11 1234 5678" value={phone} onChange={setPhone} />
            </div>
          </Field>

          {error && (
            <p style={{ color: "#DC2626", fontSize: "13px", margin: "-8px 0 20px", textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{ width: "100%", padding: "13px", background: saving ? "#D1D1CB" : "#111111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: MONT, letterSpacing: ".02em", transition: "background .2s, transform .15s" }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = "#222222"; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = "#111111"; }}
            onMouseDown={e => { if (!saving) e.currentTarget.style.transform = "scale(.98)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {saving ? "Guardando…" : "Comenzar el Workbook →"}
          </button>
        </form>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "24px", background: "none", border: "none", fontSize: "13px", color: "#B0B0A8", cursor: "pointer", fontFamily: MONT }}
      >
        ← Volver
      </button>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: "8px" }}>
      {label}
    </label>
    {children}
  </div>
);

const FocusInput: React.FC<{ type: string; placeholder: string; value: string; onChange: (v: string) => void }> = ({ type, placeholder, value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ width: "100%", padding: "10px 12px", border: `1px solid ${focused ? ACCENT : "#E5E5E5"}`, borderRadius: "8px", fontSize: "14px", color: "#111111", background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: MONT, transition: "border-color .15s", caretColor: ACCENT }}
    />
  );
};
