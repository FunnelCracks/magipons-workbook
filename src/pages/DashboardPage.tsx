import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workbook } = useWorkbook(user?.uid);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!workbook) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Workbook</h1>
            <p className="text-gray-600 mt-2">
              Estado: <span className="font-semibold">{workbook.status}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
          {/* Day 0 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">
              Día 0: Visión
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  ¿Por qué quieres tener una membresía?
                </h3>
                <p className="text-gray-700 mt-1">{workbook.data.day0.motivation || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Monthly Recurring Happiness</h3>
                <p className="text-gray-700 mt-1">${workbook.data.day0.mrh || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Día Ideal</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day0.idealDay || "-"}</p>
              </div>
            </div>
          </section>

          {/* Day 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">
              Día 1: Las Bases
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Nombre de la Membresía</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day1.membresiaName || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avatar Psicológico</h3>
                <div className="mt-2 ml-4 space-y-2 text-gray-700">
                  <p>Edad: {workbook.data.day1.avatar.age || "-"}</p>
                  <p>Preocupaciones: {workbook.data.day1.avatar.concerns || "-"}</p>
                  <p>Sentimientos: {workbook.data.day1.avatar.feelings || "-"}</p>
                  <p>Sueños: {workbook.data.day1.avatar.dreams || "-"}</p>
                  <p>Situación actual: {workbook.data.day1.avatar.currentSituation || "-"}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Estructura Mínima Viable</h3>
                <div className="mt-2 ml-4 space-y-2 text-gray-700">
                  <p>Soporte: {workbook.data.day1.structure.support || "-"}</p>
                  <p>Contenido: {workbook.data.day1.structure.content || "-"}</p>
                  <p>Comunidad: {workbook.data.day1.structure.community || "-"}</p>
                  <p>Bonus: {workbook.data.day1.structure.bonus || "-"}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Precio Mensual</h3>
                <p className="text-gray-700 mt-1">${workbook.data.day1.price || "-"}</p>
              </div>
            </div>
          </section>

          {/* Day 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200">
              Día 2: Estrategia de Venta
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Precio Anual</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day2.annualPrice || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cambios</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day2.changes || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Propuesta Única</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day2.uniqueProposal || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Estrategia Anual</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day2.annualStrategy || "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Estrategia de Lanzamiento</h3>
                <p className="text-gray-700 mt-1">{workbook.data.day2.launchStrategy || "-"}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate("/workbook/day0")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Editar Workbook
          </button>
        </div>
      </div>
    </div>
  );
};
