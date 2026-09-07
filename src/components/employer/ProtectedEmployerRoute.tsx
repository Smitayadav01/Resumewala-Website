import { Navigate } from "react-router-dom";
import { useEmployer } from "../../context/EmployerContext";

export default function ProtectedEmployerRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useEmployer();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn()) return <Navigate to="/employer/login" replace />;

  return <>{children}</>;
}