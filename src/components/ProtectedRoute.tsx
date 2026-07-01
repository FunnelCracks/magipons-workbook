import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const IS_DEV = import.meta.env.DEV;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user && !IS_DEV) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
