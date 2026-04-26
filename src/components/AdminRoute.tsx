// AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function AdminRoute({ children }: any) {
  const { user, initialized, status } = useAppSelector((state) => state.auth);

  if (!initialized || status === "loading") return <div>Loading...</div>;

  if (user?.role !== "admin") return <Navigate to="/" />;

  return children;
}
