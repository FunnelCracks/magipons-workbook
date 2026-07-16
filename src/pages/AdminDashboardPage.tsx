import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWorkbooks, deleteWorkbook } from "../services/firestoreService";
import type { Workbook } from "../services/types";

const MONT   = "'Montserrat', system-ui, sans-serif";
const ACCENT = "#26966a";
const BG     = "#FAFAF9";
const BORDER = "#E5E5E5";

// ── Lead scoring (max 18 pts) ─────────────────────────────────────────────────
function computeLeadScore(w: Workbook): number {
  const d = w.data;
  if (!d) return 0;
  let score = 0;

  // Día 0·2 — MRH soñado (3 pts si rellenado)
  if (d.day0?.mrh?.trim()) score += 3;

  // Día 0·4 — Situación HOY (3/2/1/0)
  const sit = d.day0?.situacion || "";
  if (sit.includes("membresía o programa grupal")) score += 3;
  else if (sit.includes("saturada") || sit.includes("irregulares")) score += 2;
  else if (sit.includes("empezando") || sit.includes("Otra")) score += 1;

  // Día 0·5 — Rango facturación (3/2/1/0)
  const fac = d.day0?.facturacionRango || "";
  if (fac === "Entre 3.000€ y 10.000€/mes" || fac === "Entre 10.000€ y 25.000€/mes" || fac === "Más de 25.000€/mes") score += 3;
  else if (fac === "Entre 1.000€ y 3.000€/mes") score += 2;
  else if (fac === "Menos de 1.000€/mes" || fac === "Todavía no facturo nada") score += 1;

  // Día 1·2.2 — Fórmula (3 pts si rellenada)
  if (d.day1?.formula?.trim()) score += 3;

  // Día 1·3.1 — Modelo elegido (3/2/0)
  const mod = d.day1?.modelType || "";
  if (mod && !mod.includes("no lo tengo claro")) score += 3;
  else if (mod.includes("no lo tengo claro")) score += 2;

  return score;
}

function scoreColor(s: number): string {
  if (s >= 13) return ACCENT;
  if (s >= 8)  return "#D97706";
  return "#A1A1AA";
}
function scoreBg(s: number): string {
  if (s >= 13) return "rgba(38,150,106,.1)";
  if (s >= 8)  return "rgba(217,119,6,.1)";
  return "#F5F5F3";
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
  const [workbooks,       setWorkbooks]       = useState<Workbook[]>([]);
  const [filtered,        setFiltered]        = useState<Workbook[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [adminUser,       setAdminUser]       = useState("");
  const [searchFocused,   setSearchFocused]   = useState(false);
  const [priorityFilter,  setPriorityFilter]  = useState<"alta" | "normal" | "baja" | null>(null);
  const [tagging,         setTagging]         = useState<{ running: boolean; done: number; total: number; errors: number }>({ running: false, done: 0, total: 0, errors: 0 });
  const [failedEmails,    setFailedEmails]    = useState<string[]>([]);

  useEffect(() => {
    const admin = sessionStorage.getItem("adminUser");
    if (!admin) { navigate("/admin"); return; }
    setAdminUser(admin);
    getAllWorkbooks().then((data) => { setWorkbooks(data); setLoading(false); });
  }, [navigate]);

  useEffect(() => {
    let base = search
      ? workbooks.filter((w) =>
          w.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
          w.userName?.toLowerCase().includes(search.toLowerCase())
        )
      : [...workbooks];

    if (priorityFilter) {
      base = base.filter((w) => {
        const s = computeLeadScore(w);
        if (priorityFilter === "alta")   return s >= 13;
        if (priorityFilter === "normal") return s >= 8 && s <= 12;
        return s <= 7;
      });
    }

    setFiltered(base);
  }, [workbooks, search, priorityFilter]);

  const handleBackfillGHL = async () => {
    const contacts = workbooks.map((w) => ({ email: w.userEmail, phone: w.userPhone })).filter((c) => c.email) as { email: string; phone?: string }[];
    if (!contacts.length) return;
    setTagging({ running: true, done: 0, total: contacts.length, errors: 0 });
    setFailedEmails([]);
    let done = 0; let errors = 0;
    const failed: string[] = [];
    for (const { email, phone } of contacts) {
      try {
        const res = await fetch("/.netlify/functions/ghl-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone }),
        });
        if (!res.ok) { errors++; failed.push(email); }
      } catch { errors++; failed.push(email); }
      done++;
      setTagging({ running: true, done, total: contacts.length, errors });
    }
    setTagging({ running: false, done, total: contacts.length, errors });
    setFailedEmails(failed);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`¿Eliminar el workbook de ${email || id}? Esta acción no se puede deshacer.`)) return;
    await deleteWorkbook(id);
    setWorkbooks((prev) => prev.filter((w) => w.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Email", "Nombre", "Apellido", "Teléfono", "Estado", "Fecha", "Completado", "Score"];
    const rows = filtered.map((w) => [
      w.userEmail || "",
      w.userFirstName || w.userName || "",
      w.userLastName || "",
      w.userPhone || "",
      w.status === "submitted" ? "Completado" : "En Progreso",
      formatDate(w.createdAt),
      `${w.completionPercentage || 0}%`,
      `${computeLeadScore(w)}/18`,
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
          {/* GHL backfill button */}
          <button
            onClick={handleBackfillGHL}
            disabled={tagging.running}
            style={{ padding: "7px 14px", border: `1px solid ${tagging.running ? BORDER : "#D97706"}`, borderRadius: "8px", background: tagging.running ? "#F7F7F5" : "rgba(217,119,6,.07)", color: tagging.running ? "#A1A1AA" : "#D97706", fontSize: "12px", cursor: tagging.running ? "not-allowed" : "pointer", fontFamily: MONT, fontWeight: 700 }}
          >
            {tagging.running
              ? `Etiquetando… ${tagging.done}/${tagging.total}`
              : tagging.total > 0
              ? `✓ ${tagging.done - tagging.errors}/${tagging.total} etiquetados`
              : "Asignar etiquetas GHL"}
          </button>
          {failedEmails.length > 0 && !tagging.running && (
            <button
              onClick={() => { navigator.clipboard.writeText(failedEmails.join("\n")); }}
              title={failedEmails.join("\n")}
              style={{ padding: "7px 14px", border: `1px solid #DC2626`, borderRadius: "8px", background: "rgba(220,38,38,.07)", color: "#DC2626", fontSize: "12px", cursor: "pointer", fontFamily: MONT, fontWeight: 700, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              ⚠ {failedEmails.length} sin etiquetar — copiar lista
            </button>
          )}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "12px" }}>
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

        {/* Priority filters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
          {([
            { key: "alta",   label: "PRIORIDAD ALTA",   range: "13-15 pts", dot: ACCENT,    activeBg: "rgba(38,150,106,.07)",  activeBorder: ACCENT    },
            { key: "normal", label: "PRIORIDAD NORMAL",  range: "8-12 pts",  dot: "#D97706", activeBg: "rgba(217,119,6,.07)",   activeBorder: "#D97706" },
            { key: "baja",   label: "NO PRIORIZAR",      range: "0-7 pts",   dot: "#DC2626", activeBg: "rgba(220,38,38,.07)",   activeBorder: "#DC2626" },
          ] as const).map(({ key, label, range, dot, activeBg, activeBorder }) => {
            const count = workbooks.filter((w) => {
              const s = computeLeadScore(w);
              if (key === "alta")   return s >= 13;
              if (key === "normal") return s >= 8 && s <= 12;
              return s <= 7;
            }).length;
            const active = priorityFilter === key;
            return (
              <div
                key={key}
                onClick={() => setPriorityFilter(active ? null : key)}
                style={{
                  background: active ? activeBg : "#fff",
                  border: `1px solid ${active ? activeBorder : BORDER}`,
                  borderRadius: "10px", padding: "16px 20px", cursor: "pointer",
                  transition: "all .15s", userSelect: "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "#D1D1CB"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = BORDER; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px", fontWeight: 800, color: active ? dot : "#A1A1AA", letterSpacing: ".09em", textTransform: "uppercase", transition: "color .15s" }}>{label}</span>
                  {active && <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, color: dot, background: activeBg, border: `1px solid ${activeBorder}`, borderRadius: "4px", padding: "1px 6px" }}>activo</span>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "30px", fontWeight: 900, color: active ? dot : "#111111", fontVariantNumeric: "tabular-nums", letterSpacing: "-.03em", lineHeight: 1, transition: "color .15s" }}>{count}</span>
                  <span style={{ fontSize: "11px", color: "#A1A1AA", fontWeight: 600 }}>{range}</span>
                </div>
              </div>
            );
          })}
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
                  {["Email", "Nombre y Apellido", "Teléfono", "Estado", "Score", "Fecha", "Completado", ""].map((h) => (
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
                  const ls       = computeLeadScore(w);
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
                      <td style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 800,
                          background: scoreBg(ls), color: scoreColor(ls), fontFamily: MONT,
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          {ls}
                          <span style={{ fontSize: "10px", fontWeight: 600, opacity: .65 }}>/18</span>
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => navigate(`/admin/workbook/${w.id}`)}
                            style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "6px", color: "#525252", fontSize: "12px", fontFamily: MONT, cursor: "pointer", fontWeight: 700, transition: "all .15s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#525252"; }}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDelete(w.id!, w.userEmail || "")}
                            title="Eliminar workbook"
                            style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "6px", color: "#A1A1AA", fontSize: "14px", cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#DC2626"; e.currentTarget.style.color = "#DC2626"; e.currentTarget.style.background = "rgba(220,38,38,.06)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#A1A1AA"; e.currentTarget.style.background = "transparent"; }}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#A1A1AA", fontSize: "14px" }}>
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
