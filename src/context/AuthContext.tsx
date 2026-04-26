import { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/apiClient";
import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  setCredentials,
} from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

interface AuthContextType {
  token: string | null;
  setToken: (token: string) => void;
  user: any;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    fullName: string,
    mobileNumber: string,
    password: string
  ) => Promise<any>;
  logout: () => void;
  isAuthenticated: () => boolean;
  loading: boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { accessToken, user, status, initialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(refreshSession());
  }, [dispatch]);

  const syncGuestResume = (role?: string) => {
    const guestResume = localStorage.getItem("guestResume");

    if (!guestResume || role === "admin") {
      localStorage.removeItem("guestResume");
      return;
    }

    authFetch("/api/profile/complete-guest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: guestResume,
    })
      .then(() => localStorage.removeItem("guestResume"))
      .catch(() => console.log("guest sync failed"));
  };

  const setToken = (token: string) => {
    dispatch(setCredentials({ accessToken: token, user }));
  };

  const setUser = (nextUser: any) => {
    dispatch(setCredentials({ accessToken, user: nextUser }));
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await dispatch(loginUser({ email, password })).unwrap();

      syncGuestResume(response.user?.role);

      if (response.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }

      return { success: true, token: response.accessToken, user: response.user };
    } catch (error: any) {
      return { success: false, message: error.message || "Login failed" };
    }
  };

  const register = async (
    email: string,
    fullName: string,
    mobileNumber: string,
    password: string
  ) => {
    try {
      const response = await dispatch(
        registerUser({ email, fullName, mobileNumber, password })
      ).unwrap();

      syncGuestResume(response.user?.role);
      navigate("/profile");

      return { success: true, token: response.accessToken, user: response.user };
    } catch (error: any) {
      return { success: false, message: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        token: accessToken,
        setToken,
        user,
        setUser,
        login,
        register,
        logout,
        isAuthenticated: () => Boolean(accessToken),
        loading: status === "loading" && !initialized,
        isAdmin: () => user?.role === "admin",
      }}
    >
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
