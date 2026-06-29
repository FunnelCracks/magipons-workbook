import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/workbook/day0");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          RETO 3K EN SEPTIEMBRE
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Para emprendedores que no quieren seguir intercambiando tiempo por dinero.
        </p>
        <p className="text-lg text-gray-600 mb-12">
          Crea una membresía escalable y vive mejor sin sacrificar tu vida.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
        >
          Comienza tu Workbook
        </button>
      </div>
    </div>
  );
};
