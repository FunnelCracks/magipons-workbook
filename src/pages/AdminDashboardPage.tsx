import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWorkbooks } from "../services/firestoreService";
import type { Workbook } from "../services/types";

const COBALT = "#3751C4";
const BORDER = "#D8D9E4";

const s = {
  page: { minHeight: "100vh", width: "100%", background: "#EDEDF2", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" } as React.CSSProperties,
  header: { background: "#fff", borderBottom: `1.5px solid ${BORDER}`, padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" } as React.CSSProperties,
  headerTitle: { fontSize: "20px", fontWeight: 900, color: "#111827", letterSpacing: "-.02em" } as React.CSSProperties,
  headerSub: { fontSize: "12px", color: "#6C739B", marginTop: "2px" } as React.CSSProperties,
  headerRight: { display: "flex", alignItems: "center", gap: "14px" } as React.CSSProperties,
  adminName: { fontSize: "13px", color: "#6C739B", fontWeight: 600 } as React.CSSProperties,
  logoutBtn: { padding: "8px 16px", border: `1.5px solid ${BORDER}`, borderRadius: "8px", background: "transparent", color: "#6C739B", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" } as React.CSSProperties,
  body: { padding: "28px 32px" } as React.CSSProperties,
  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "20px" } as React.CSSProperties,
  statCard: { background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: "10px", padding: "20px 24px" } as React.CSSProperties,
  statLabel: { fontSize: "12px", color: "#6C739B", fontWeight: 500, marginBottom: "8px" } as React.CSSProperties,
  toolbar: { display: "flex", gap: "10px", marginBottom: "16px" } as React.CSSProperties,
  searchInput: { flex: 1, background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: "8px", color: "#111827", padding: "10px 14px", fontSize: "13px", fontFamily: "inherit", outline: "none" } as React.CSSProperties,
  csvBtn: { padding: "10px 22px", background: COBALT, border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontFamily: "inherit", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" as const } as React.CSSProperties,
  tableCard: { background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" } as React.CSSProperties,
  tableWrap: { overflowX: "auto" as const },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" } as React.CSSProperties,
  th: { padding: "12px 18px", textAlign: "left" as const, fontSize: "11px", letterSpacing: ".06em", textTransform: "uppercase" as const, color: "#6C739B", fontWeight: 700, borderBottom: `1.5px solid ${BORDER}`, background: "#F7F7FB" } as React.CSSProperties,
  td: { padding: "14px 18px", borderBottom: "1px solid #EDEDF2", verticalAlign: "middle" as const } as React.CSSProperties,
  pctWrap: { display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties,
  pctNum: { width: "36px", fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" as const } as React.CSSProperties,
  pctTrack: { flex: 1, height: "5px", background: "#E8E8F0", borderRadius: "3px", overflow: "hidden", minWidth: "60px" } as React.CSSProperties,
  verBtn: { padding: "6px 14px", background: "transparent", border: `1.5px solid ${BORDER}`, borderRadius: "6px", color: COBALT, fontSize: "12px", fontFamily: "inherit", cursor: "pointer", fontWeight: 700 } as React.CSSProperties,
  empty: { padding: "48px", textAlign: "center" as const, color: "#6C739B", fontSize: "14px" } as React.CSSProperties,
  loading: { minHeight: "100vh", background: "#EDEDF2", display: "flex", alignItems: "center", justifyContent: "center" } as React.CSSProperties,
};

function pctBarColor(p: number) {
  if (p >= 70) return "#0F7550";
  if (p >= 30) return "#A16207";
  return "#DC2626";
}

function formatDate(date: any): string {
  if (!date) return "—";
  let d: Date;
  if (date instanceof Date) d = date;
  else if (date?.toDate) d = date.toDate();
  else if (typeof date === "number" || typeof date === "string") d = new Date(date);
  else return "—";
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-AR");
}

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [filtered, setFiltered] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adminUser, setAdminUser] = useState("");

  useEffect(() => {
    const admin = sessionStorage.getItem("adminUser");
    if (!admin) { navigate("/admin"); return; }
    setAdminUser(admin);
    getAllWorkbooks().then((data) => { setWorkbooks(data); setLoading(false); });
  }, [navigate]);

  useEffect(() => {
    setFiltered(
      search
        ? workbooks.filter((w) =>
            w.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
            w.userName?.toLowerCase().includes(search.toLowerCase())
          )
        : workbooks
    );
  }, [workbooks, search]);

  const exportCSV = () => {
    const headers = ["Email", "Nombre", "Apellido", "Teléfono", "Estado", "Fecha", "Completado"];
    const rows = filtered.map((w) => [
      w.userEmail || "",
      w.userFirstName || w.userName || "",
      w.userLastName || "",
      w.userPhone || "",
      w.status === "submitted" ? "Completado" : "En Progreso",
      formatDate(w.createdAt),
      `${w.completionPercentage || 0}%`,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `workbooks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div style={s.loading}><p style={{ color: "#6C739B" }}>Cargando workbooks…</p></div>;
  }

  const done = workbooks.filter((w) => w.status === "submitted").length;
  const inProgress = workbooks.filter((w) => w.status !== "submitted").length;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Admin Dashboard</div>
          <div style={s.headerSub}>Reto 3K · Cohorte Junio 2026</div>
        </div>
        <div style={s.headerRight}>
          <span style={s.adminName}>{adminUser.charAt(0).toUpperCase() + adminUser.slice(1)}</span>
          <button
            style={s.logoutBtn}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = COBALT; e.currentTarget.style.color = COBALT; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#6C739B"; }}
            onClick={() => { sessionStorage.removeItem("adminUser"); navigate("/admin"); }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.stats}>
          {[
            { label: "Total workbooks", val: workbooks.length, color: COBALT },
            { label: "En progreso",     val: inProgress,       color: "#A16207" },
            { label: "Completados",     val: done,             color: "#0F7550" },
          ].map(({ label, val, color }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statLabel}>{label}</div>
              <div style={{ fontSize: "36px", fontWeight: 900, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.03em", lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={s.toolbar}>
          <input
            style={s.searchInput}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre…"
            onFocus={(e) => { e.currentTarget.style.borderColor = COBALT; e.currentTarget.style.boxShadow = "0 0 0 3px #3751C418"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
          />
          <button style={s.csvBtn} onClick={exportCSV}>Descargar CSV</button>
        </div>

        <div style={s.tableCard}>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Email", "Nombre y Apellido", "Teléfono", "Estado", "Fecha", "Completado", ""].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((w) => {
                  const isDone = w.status === "submitted";
                  const pct = w.completionPercentage || 0;
                  const fullName = (w.userFirstName && w.userLastName)
                    ? `${w.userFirstName} ${w.userLastName}`
                    : (w.userName || null);
                  return (
                    <tr
                      key={w.id}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "#F4F4FB"}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ ...s.td, color: "#111827", fontWeight: 600 }}>{w.userEmail || <span style={{ color: "#A8ADCA" }}>—</span>}</td>
                      <td style={{ ...s.td, color: "#374163" }}>{fullName || <span style={{ color: "#A8ADCA" }}>—</span>}</td>
                      <td style={{ ...s.td, color: "#374163", fontSize: "12px" }}>{w.userPhone || <span style={{ color: "#A8ADCA" }}>—</span>}</td>
                      <td style={s.td}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                          background: isDone ? "#DCFCE7" : "#FEF3C7",
                          color: isDone ? "#0F7550" : "#A16207",
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block", flexShrink: 0 }} />
                          {isDone ? "Completado" : "En progreso"}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: "#6C739B", fontSize: "12px" }}>{formatDate(w.createdAt)}</td>
                      <td style={s.td}>
                        <div style={s.pctWrap}>
                          <span style={s.pctNum}>{pct}%</span>
                          <div style={s.pctTrack}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: "3px", background: pctBarColor(pct) }} />
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <button
                          style={s.verBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F4F4FB"; e.currentTarget.style.borderColor = COBALT; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = BORDER; }}
                          onClick={() => navigate(`/admin/workbook/${w.id}`)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} style={s.empty}>No hay workbooks que coincidan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
