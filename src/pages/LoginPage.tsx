import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { GoogleSignInButton } from "../components/GoogleSignInButton";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/workbook/day0");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Bienvenido
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Inicia sesión para continuar con tu workbook
        </p>
        <GoogleSignInButton onSuccess={() => navigate("/workbook/day0")} />
      </div>
    </div>
  );
};
