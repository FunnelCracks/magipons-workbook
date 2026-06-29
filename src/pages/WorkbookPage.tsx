import { useAuth } from "../hooks/useAuth";
import { useWorkbook } from "../hooks/useWorkbook";
import { useState, useCallback, useEffect } from "react";
import { FormField } from "../components/FormField";
import { ProgressBar } from "../components/ProgressBar";
import { debounce } from "../utils/debounce";
import { useNavigate } from "react-router-dom";
import { submitWorkbook } from "../services/firestoreService";

export const WorkbookPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workbook, updateField } = useWorkbook(user?.uid);
  const [currentDay, setCurrentDay] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [localData, setLocalData] = useState(workbook?.data || null);

  const debouncedUpdate = useCallback(
    debounce((fieldPath: string, value: string) => {
      updateField(fieldPath, value);
    }, 1000),
    [updateField]
  );

  useEffect(() => {
    if (workbook?.data && !localData) {
      setLocalData(workbook.data);
    }
  }, [workbook?.data, localData]);

  const handleFieldChange = (fieldPath: string, value: string) => {
    // Update local state immediately for UI responsiveness
    if (localData) {
      const keys = fieldPath.split(".");
      const newData = JSON.parse(JSON.stringify(localData));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      setLocalData(newData);
    }
    // Debounce Firebase update (add "data." prefix for Firestore path)
    debouncedUpdate(`data.${fieldPath}`, value);
  };

  const handleSubmit = async () => {
    if (!workbook) return;
    setSubmitting(true);
    try {
      await submitWorkbook(workbook.id);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting workbook:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!workbook) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            RETO 3K - Workbook
          </h1>
          <ProgressBar percentage={workbook.completionPercentage} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {["Día 0", "Día 1", "Día 2"].map((label, index) => (
            <button
              key={index}
              onClick={() => setCurrentDay(index)}
              className={`py-2 px-4 font-medium transition-colors ${
                currentDay === index
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentDay === 0 && localData && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Visión</h2>
              <FormField
                label="¿Por qué quieres tener una membresía?"
                value={localData.day0.motivation}
                onChange={(value) =>
                  handleFieldChange("day0.motivation", value)
                }
                type="textarea"
              />
              <FormField
                label="¿Cuánto te gustaría estar facturando de forma recurrente cada mes? (Monthly Recurring Happiness)"
                value={localData.day0.mrh || ""}
                onChange={(value) => handleFieldChange("day0.mrh", value)}
                type="number"
              />
              <FormField
                label="¿Qué harías con ese dinero? Describe un día ideal en tu vida"
                value={localData.day0.idealDay}
                onChange={(value) =>
                  handleFieldChange("day0.idealDay", value)
                }
                type="textarea"
              />
            </div>
          )}

          {currentDay === 1 && localData && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Las Bases</h2>

              <h3 className="text-xl font-semibold mb-4 mt-8">Bloque 1: Claridad</h3>
              <FormField
                label="Nombre de la membresía"
                value={localData.day1.membresiaName || ""}
                onChange={(value) =>
                  handleFieldChange("day1.membresiaName", value)
                }
              />

              <h3 className="text-lg font-semibold mb-4 mt-6">Avatar Psicológico</h3>
              <FormField
                label="Edad"
                value={localData.day1.avatar.age || ""}
                onChange={(value) =>
                  handleFieldChange("day1.avatar.age", value)
                }
                type="number"
              />
              <FormField
                label="Le preocupa sobre todo..."
                value={localData.day1.avatar.concerns || ""}
                onChange={(value) =>
                  handleFieldChange("day1.avatar.concerns", value)
                }
                type="textarea"
              />
              <FormField
                label="Siente que..."
                value={localData.day1.avatar.feelings || ""}
                onChange={(value) =>
                  handleFieldChange("day1.avatar.feelings", value)
                }
                type="textarea"
              />
              <FormField
                label="Sueña con..."
                value={localData.day1.avatar.dreams || ""}
                onChange={(value) =>
                  handleFieldChange("day1.avatar.dreams", value)
                }
                type="textarea"
              />
              <FormField
                label="Pero ahora mismo..."
                value={localData.day1.avatar.currentSituation || ""}
                onChange={(value) =>
                  handleFieldChange("day1.avatar.currentSituation", value)
                }
                type="textarea"
              />

              <h3 className="text-xl font-semibold mb-4 mt-8">Bloque 2: Promesa</h3>
              <FormField
                label="Transformación prolongada"
                value={localData.day1.promise.transformation || ""}
                onChange={(value) =>
                  handleFieldChange("day1.promise.transformation", value)
                }
                type="textarea"
              />
              <FormField
                label="¿A quién ayudas a conseguir qué?"
                value={localData.day1.promise.statement || ""}
                onChange={(value) =>
                  handleFieldChange("day1.promise.statement", value)
                }
                type="textarea"
              />

              <h3 className="text-xl font-semibold mb-4 mt-8">Bloque 3: Estructura Mínima Viable</h3>
              <FormField
                label="Soporte: ¿Cómo acompañarás a tus miembros?"
                value={localData.day1.structure.support || ""}
                onChange={(value) =>
                  handleFieldChange("day1.structure.support", value)
                }
                type="textarea"
              />
              <FormField
                label="Contenido: ¿Qué contenido y cuándo lo vas a entregar?"
                value={localData.day1.structure.content || ""}
                onChange={(value) =>
                  handleFieldChange("day1.structure.content", value)
                }
                type="textarea"
              />
              <FormField
                label="Comunidad: ¿Cómo vas a conectar a los miembros?"
                value={localData.day1.structure.community || ""}
                onChange={(value) =>
                  handleFieldChange("day1.structure.community", value)
                }
                type="textarea"
              />
              <FormField
                label="Bonus: ¿Cómo sabrán que están avanzando?"
                value={localData.day1.structure.bonus || ""}
                onChange={(value) =>
                  handleFieldChange("day1.structure.bonus", value)
                }
                type="textarea"
              />

              <h3 className="text-xl font-semibold mb-4 mt-8">Bloque 4: Precio</h3>
              <FormField
                label="¿Qué precio mensual tendrá sentido para ti y tu cliente?"
                value={localData.day1.price || ""}
                onChange={(value) => handleFieldChange("day1.price", value)}
                type="number"
              />
            </div>
          )}

          {currentDay === 2 && localData && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Estrategia de Venta</h2>
              <FormField
                label="¿Cuál será el precio anual de mi membresía? ¿Por qué?"
                value={localData.day2.annualPrice || ""}
                onChange={(value) =>
                  handleFieldChange("day2.annualPrice", value)
                }
                type="textarea"
              />
              <FormField
                label="¿Sabiendo todo lo que sabes ahora, qué cambiarías del día 1?"
                value={localData.day2.changes || ""}
                onChange={(value) =>
                  handleFieldChange("day2.changes", value)
                }
                type="textarea"
              />
              <FormField
                label="¿Por qué tú? ¿Qué hace única tu propuesta?"
                value={localData.day2.uniqueProposal || ""}
                onChange={(value) =>
                  handleFieldChange("day2.uniqueProposal", value)
                }
                type="textarea"
              />
              <FormField
                label="¿Cómo será la estrategia anual para vender la membresía?"
                value={localData.day2.annualStrategy || ""}
                onChange={(value) =>
                  handleFieldChange("day2.annualStrategy", value)
                }
                type="textarea"
              />
              <FormField
                label="Estrategia de lanzamiento: ¿Cómo harás esa primera impresión?"
                value={localData.day2.launchStrategy || ""}
                onChange={(value) =>
                  handleFieldChange("day2.launchStrategy", value)
                }
                type="textarea"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
            disabled={currentDay === 0}
            className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
          >
            Anterior
          </button>
          {currentDay < 2 ? (
            <button
              onClick={() => setCurrentDay(Math.min(2, currentDay + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "Enviando..." : "Enviar Workbook"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
