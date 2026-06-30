import { useNavigate } from "react-router-dom";

const admins = [
  { id: "marita",  name: "Marita",  email: "marita@funnelcracks.com",  initials: "M", color: "#C026D3" },
  { id: "gonzalo", name: "Gonzalo", email: "gonzalo@funnelcracks.com", initials: "G", color: "#3751C4" },
];

const s = {
  page: { minHeight: "100vh", background: "#EDEDF2", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" } as React.CSSProperties,
  card: { background: "#fff", border: "1.5px solid #D8D9E4", borderRadius: "12px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 24px rgba(55,81,196,.08)" } as React.CSSProperties,
  eyebrow: { fontSize: "11px", fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" as const, color: "#3751C4", marginBottom: "8px" },
  title: { fontSize: "22px", fontWeight: 900, color: "#111827", letterSpacing: "-.02em", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#6C739B", marginBottom: "32px" },
  adminBtn: { width: "100%", display: "flex", alignItems: "center", gap: "16px", padding: "16px 18px", background: "#fff", border: "1.5px solid #D8D9E4", borderRadius: "10px", cursor: "pointer", textAlign: "left" as const, fontFamily: "inherit", marginBottom: "10px", transition: "all .15s" } as React.CSSProperties,
  avatar: (color: string) => ({ width: "44px", height: "44px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }) as React.CSSProperties,
  avatarInitial: { color: "#fff", fontSize: "17px", fontWeight: 800 } as React.CSSProperties,
  adminName: { fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "2px" },
  adminEmail: { fontSize: "12px", color: "#6C739B" },
  back: { display: "block", width: "100%", marginTop: "8px", padding: "10px", background: "none", border: "none", color: "#6C739B", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" } as React.CSSProperties,
};

export const AdminUserSelectPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <div style={s.card}>
        <p style={s.eyebrow}>Magipons</p>
        <h1 style={s.title}>¿Quién eres?</h1>
        <p style={s.sub}>Seleccioná tu nombre para continuar</p>

        {admins.map((admin) => (
          <button
            key={admin.id}
            style={s.adminBtn}
            onClick={() => {
              sessionStorage.setItem("adminUser", admin.id);
              navigate("/admin/dashboard");
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#3751C4";
              (e.currentTarget as HTMLElement).style.background = "#F4F5FC";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#D8D9E4";
              (e.currentTarget as HTMLElement).style.background = "#fff";
            }}
          >
            <div style={s.avatar(admin.color)}>
              <span style={s.avatarInitial}>{admin.initials}</span>
            </div>
            <div>
              <div style={s.adminName}>{admin.name}</div>
              <div style={s.adminEmail}>{admin.email}</div>
            </div>
          </button>
        ))}

        <button style={s.back} onClick={() => window.history.back()}>
          ← Volver
        </button>
      </div>
    </div>
  );
};
