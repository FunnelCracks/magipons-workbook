import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWorkbooks } from "../services/firestoreService";
import type { Workbook } from "../services/types";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";
const BORDER = "#E5E5E5";

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
  const [filtered,  setFiltered]  = useState<Workbook[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: MONT, color: "#A1A1AA", fontSize: "14px" }}>Cargando workbooks…</p>
      </div>
    );
  }

  const done       = workbooks.filter((w) => w.status === "submitted").length;
  const inProgress = workbooks.filter((w) => w.status !== "submitted").length;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: MONT }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 900, color: "#111111", letterSpacing: "-.02em" }}>Admin Dashboard</div>
          <div style={{ fontSize: "12px", color: "#A1A1AA", marginTop: "2px", fontWeight: 600, letterSpacing: ".02em" }}>Reto 3K · Julio 2026</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "13px", color: "#525252", fontWeight: 700 }}>
            {adminUser.charAt(0).toUpperCase() + adminUser.slice(1)}
          </span>
          <button
            onClick={() => { sessionStorage.removeItem("adminUser"); navigate("/admin"); }}
            style={{ padding: "7px 14px", border: `1px solid ${BORDER}`, borderRadius: "8px", background: "transparent", color: "#A1A1AA", fontSize: "12px", cursor: "pointer", fontFamily: MONT, fontWeight: 600, transition: "color .15s, border-color .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#525252"; e.currentTarget.style.borderColor = "#D1D1CB"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#A1A1AA"; e.currentTarget.style.borderColor = BORDER; }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total workbooks", val: workbooks.length, color: "#111111" },
            { label: "En progreso",     val: inProgress,       color: "#D97706" },
            { label: "Completados",     val: done,             color: ACCENT    },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#A1A1AA", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: "10px" }}>{label}</div>
              <div style={{ fontSize: "34px", fontWeight: 900, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-.03em", lineHeight: 1 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar por email o nombre…"
            style={{ flex: 1, background: "#fff", border: `1px solid ${searchFocused ? ACCENT : BORDER}`, borderRadius: "8px", color: "#111111", padding: "10px 14px", fontSize: "13px", fontFamily: MONT, outline: "none", transition: "border-color .15s", caretColor: ACCENT }}
          />
          <button
            onClick={exportCSV}
            style={{ padding: "10px 22px", background: "#111111", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontFamily: MONT, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap", transition: "background .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#222222"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#111111"; }}
          >
            Descargar CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr>
                  {["Email", "Nombre y Apellido", "Teléfono", "Estado", "Fecha", "Completado", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#A1A1AA", fontWeight: 700, borderBottom: `1px solid ${BORDER}`, background: BG, fontFamily: MONT }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? filtered.map((w) => {
                  const isDone   = w.status === "submitted";
                  const pct      = w.completionPercentage || 0;
                  const fullName = (w.userFirstName && w.userLastName)
                    ? `${w.userFirstName} ${w.userLastName}`
                    : (w.userName || null);
                  const barColor = pct >= 70 ? ACCENT : pct >= 30 ? "#D97706" : "#E5E5E5";
                  return (
                    <tr
                      key={w.id}
                      onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = BG}
                      onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, color: "#111111", fontWeight: 700, verticalAlign: "middle" }}>
                        {w.userEmail || <span style={{ color: "#D1D1CB" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, color: "#525252", verticalAlign: "middle" }}>
                        {fullName || <span style={{ color: "#D1D1CB" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, color: "#525252", fontSize: "12px", verticalAlign: "middle" }}>
                        {w.userPhone || <span style={{ color: "#D1D1CB" }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                          background: isDone ? "rgba(38,150,106,.1)" : "rgba(217,119,6,.1)",
                          color: isDone ? ACCENT : "#D97706",
                          fontFamily: MONT,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", display: "inline-block", flexShrink: 0 }} />
                          {isDone ? "Completado" : "En progreso"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, color: "#A1A1AA", fontSize: "12px", verticalAlign: "middle" }}>
                        {formatDate(w.createdAt)}
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ width: "36px", fontWeight: 800, color: pct > 0 ? "#111111" : "#A1A1AA", fontVariantNumeric: "tabular-nums", fontSize: "13px" }}>{pct}%</span>
                          <div style={{ flex: 1, height: "4px", background: "#E5E5E5", borderRadius: "99px", overflow: "hidden", minWidth: "60px" }}>
                            <div style={{ height: "100%", width: `${pct}%`, borderRadius: "99px", background: barColor, transition: "width .4s ease" }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle" }}>
                        <button
                          onClick={() => navigate(`/admin/workbook/${w.id}`)}
                          style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "6px", color: "#525252", fontSize: "12px", fontFamily: MONT, cursor: "pointer", fontWeight: 700, transition: "all .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#525252"; }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#A1A1AA", fontSize: "14px" }}>
                      No hay workbooks que coincidan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
