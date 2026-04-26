import { createContext, useContext, useEffect, useState } from "react";
import AuthApi from "../services/AuthApi";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    token: string | null;
    setToken: (token: string) => void;
    user: any;
    setUser: (user: any) => void;
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, fullName: string, mobileNumber: string, password: string) => Promise<any>;
    logout: () => void;
    isAuthenticated: () => boolean;
    loading: boolean;
    isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const isAuthenticated = () => {
        return localStorage.getItem("token") !== null;
    }
    const isAdmin = () => {
        const user = localStorage.getItem("user");
        if (!user) return false;
        const parsedUser = JSON.parse(user);
        if (parsedUser.role === "admin") {
            return true;
        }
        return false;

    }
    const navigate = useNavigate();


    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken ) {
            setToken(storedToken);
            
          }
        setLoading(false);
    }, []);
    
    const login = async (email: string, password: string) => {
  setLoading(true);

  try {
    const response = await AuthApi.login(email, password);

    if (!response.success) return response;

    setToken(response.token);
    setUser(response.user);

    localStorage.setItem("token", response.token);

    // ⭐ GUEST SYNC (background)
    const guestResume = localStorage.getItem("guestResume");

    if (guestResume && response.user.role === "user") {
      const parsed = JSON.parse(guestResume);

      fetch(`${import.meta.env.VITE_API_URL}/api/profile/complete-guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.token}`,
        },
        body: JSON.stringify(parsed),
      })
        .then(() => localStorage.removeItem("guestResume"))
        .catch(() => console.log("guest sync failed"));
    } else {
      // ⭐ clear if admin login
      localStorage.removeItem("guestResume");
    }

    // ⭐ FINAL NAVIGATION (always)
    if (response.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/profile");
    }

    return response;

  } finally {
    setLoading(false);
  }
};
    const register = async (
  email: string,
  fullName: string,
  mobileNumber: string,
  password: string
) => {
  setLoading(true);

  try {
    const response = await AuthApi.register(
      email,
      fullName,
      mobileNumber,
      password
    );

    if (!response.success) return response;

    // ⭐ auto login
    setToken(response.token);
    setUser(response.user);

    localStorage.setItem("token", response.token);

    // ⭐ guest sync background
    const guestResume = localStorage.getItem("guestResume");

    if (guestResume) {
      const parsed = JSON.parse(guestResume);

      fetch(`${import.meta.env.VITE_API_URL}/api/profile/complete-guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${response.token}`,
        },
        body: JSON.stringify(parsed),
      })
        .then(() => localStorage.removeItem("guestResume"))
        .catch(() => console.log("guest sync failed"));
    }

    navigate("/profile");

    return response;

  } finally {
    setLoading(false);
  }
};
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ token, setToken, user, setUser, login, register, logout, isAuthenticated, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return context;
};