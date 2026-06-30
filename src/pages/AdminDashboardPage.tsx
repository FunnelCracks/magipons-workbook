import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllWorkbooks } from "../services/firestoreService";
import type { Workbook } from "../services/types";

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [filteredWorkbooks, setFilteredWorkbooks] = useState<Workbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [adminUser, setAdminUser] = useState("");

  useEffect(() => {
    const admin = sessionStorage.getItem("adminUser");
    if (!admin) {
      navigate("/admin");
      return;
    }
    setAdminUser(admin);
    loadWorkbooks();
  }, [navigate]);

  useEffect(() => {
    let filtered = workbooks;
    if (searchEmail) {
      filtered = filtered.filter((w) =>
        w.userEmail.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }
    setFilteredWorkbooks(filtered);
  }, [workbooks, searchEmail]);

  const loadWorkbooks = async () => {
    setLoading(true);
    const data = await getAllWorkbooks();
    setWorkbooks(data);
    setLoading(false);
  };

  const formatDate = (date: any): string => {
    if (!date) return "N/A";
    let d: Date;
    if (date instanceof Date) {
      d = date;
    } else if (date && typeof date.toDate === "function") {
      // Firestore Timestamp
      d = date.toDate();
    } else if (typeof date === "number") {
      d = new Date(date);
    } else if (typeof date === "string") {
      d = new Date(date);
    } else {
      return "N/A";
    }
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("es-ES");
  };

  const exportToCSV = () => {
    const headers = ["Email", "Nombre", "Estado", "Fecha", "Completado"];
    const rows = filteredWorkbooks.map((w) => [
      w.userEmail,
      w.userName,
      w.status,
      formatDate(w.createdAt),
      `${w.completionPercentage || 0}%`,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workbooks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminUser");
    navigate("/admin");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      in_progress: "bg-yellow-100 text-yellow-800",
      submitted: "bg-green-100 text-green-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando workbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">
              Bienvenido,{" "}
              <span className="font-semibold capitalize">{adminUser}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Email
              </label>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="ej: alumno@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition"
            >
              📥 Descargar CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Total Workbooks</p>
            <p className="text-3xl font-bold text-blue-600">{workbooks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">En Progreso</p>
            <p className="text-3xl font-bold text-yellow-600">
              {workbooks.filter((w) => w.status === "in_progress").length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm">Completados</p>
            <p className="text-3xl font-bold text-green-600">
              {workbooks.filter((w) => w.status === "submitted").length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Completado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkbooks.length > 0 ? (
                  filteredWorkbooks.map((workbook) => (
                    <tr
                      key={workbook.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {workbook.userEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {workbook.userName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            workbook.status
                          )}`}
                        >
                          {workbook.status === "in_progress"
                            ? "En Progreso"
                            : "Completado"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(workbook.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${workbook.completionPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {workbook.completionPercentage || 0}%
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hay workbooks que coincidan con tu búsqueda
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
