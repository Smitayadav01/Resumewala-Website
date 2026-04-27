// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute({ children }: any) {
  const { accessToken, initialized, status } = useAppSelector((state) => state.auth);

  if (!initialized || status === "loading") {
    return <div>Loading...</div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return children;
}
