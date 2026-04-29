import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/auth.context";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
