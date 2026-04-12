// AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminRoute({ children }: any) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.user?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isAdmin) return <Navigate to="/" />;

  return children;
}