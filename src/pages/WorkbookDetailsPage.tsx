import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import type { Workbook } from "../services/types";

export const WorkbookDetailsPage: React.FC = () => {
  const { workbookId } = useParams<{ workbookId: string }>();
  const navigate = useNavigate();
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workbookId) {
      navigate("/admin/dashboard");
      return;
    }

    const loadWorkbook = async () => {
      try {
        const docRef = doc(db, "workbooks", workbookId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWorkbook({
            id: docSnap.id,
            ...docSnap.data(),
          } as Workbook);
        } else {
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error loading workbook:", error);
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadWorkbook();
  }, [workbookId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando detalles del workbook...</p>
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Workbook no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Workbook</h1>
            <p className="text-gray-600 text-sm mt-1">
              {workbook.userName || workbook.userEmail}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Información General</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-900 font-medium">{workbook.userEmail}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Nombre</p>
              <p className="text-gray-900 font-medium">{workbook.userName || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Estado</p>
              <p className="text-gray-900 font-medium capitalize">
                {workbook.status === "in_progress" ? "En Progreso" : "Completado"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Completado</p>
              <p className="text-gray-900 font-medium">{workbook.completionPercentage || 0}%</p>
            </div>
          </div>
        </div>

        {/* Día 0: Visión */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Día 0: Visión</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">¿Por qué quieres tener una membresía?</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day0.motivation || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Recurring Happiness</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                ${workbook.data.day0.mrh || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Día Ideal</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day0.idealDay || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Día 1: Las Bases */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Día 1: Las Bases</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Nombre de la Membresía</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day1.membresiaName || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Avatar Psicológico</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Edad</p>
                  <p className="text-gray-900">{workbook.data.day1.avatar.age || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Preocupaciones</p>
                  <p className="text-gray-900">{workbook.data.day1.avatar.concerns || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Sentimientos</p>
                  <p className="text-gray-900">{workbook.data.day1.avatar.feelings || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Sueños</p>
                  <p className="text-gray-900">{workbook.data.day1.avatar.dreams || "N/A"}</p>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded mt-2">
                <p className="text-xs text-gray-500">Situación Actual</p>
                <p className="text-gray-900">{workbook.data.day1.avatar.currentSituation || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded mt-2">
                <p className="text-xs text-gray-500">Frase del Avatar</p>
                <p className="text-gray-900">{workbook.data.day1.avatarPhrase || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Promesa</p>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Transformación Prolongada</p>
                <p className="text-gray-900">{workbook.data.day1.promise.transformation || "N/A"}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded mt-2">
                <p className="text-xs text-gray-500">¿A quién ayudas a conseguir qué?</p>
                <p className="text-gray-900">{workbook.data.day1.promise.statement || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Estructura Mínima Viable</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Soporte</p>
                  <p className="text-gray-900">{workbook.data.day1.structure.support || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Contenido</p>
                  <p className="text-gray-900">{workbook.data.day1.structure.content || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Comunidad</p>
                  <p className="text-gray-900">{workbook.data.day1.structure.community || "N/A"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Bonus</p>
                  <p className="text-gray-900">{workbook.data.day1.structure.bonus || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm font-medium">Precio Mensual</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                ${workbook.data.day1.price || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Día 2: Estrategia de Venta */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Día 2: Estrategia de Venta</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Precio Anual</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                ${workbook.data.day2.annualPrice || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Cambios</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day2.changes || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Propuesta Única</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day2.uniqueProposal || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Estrategia Anual</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day2.annualStrategy || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Estrategia de Lanzamiento</p>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                {workbook.data.day2.launchStrategy || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
