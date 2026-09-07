import { Navigate } from "react-router-dom";
import { useEmployer } from "../context/EmployerContext";

export default function ProtectedEmployerRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useEmployer();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn()) return <Navigate to="/employer/login" replace />;

  return <>{children}</>;
}