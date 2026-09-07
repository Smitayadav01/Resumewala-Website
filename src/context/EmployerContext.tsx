import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getEmployerMe } from "../services/employerApi";

interface Employer {
  _id: string;
  companyName: string;
  recruiterName: string;
  email: string;
  companyLogo?: string;
  isVerified?: boolean;
  mobile?: string;
  companyLocation?: string;
  companyWebsite?: string;
  companyDescription?: string;
  industryType?: string;
  companySize?: string;
  subscription?: {
    plan: string;
    jobCredits: number;
    expiresAt?: string;
  };
}

interface EmployerContextType {
  employer: Employer | null;
  token: string | null;
  loading: boolean;
  login: (token: string, employer: Employer) => void;
  logout: () => void;
  refreshEmployer: () => Promise<void>;
  isLoggedIn: () => boolean;
}

const EmployerContext = createContext<EmployerContextType | null>(null);

export const EmployerProvider = ({ children }: { children: ReactNode }) => {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("employerToken"));
  const [loading, setLoading] = useState(true);

  const login = (t: string, e: Employer) => {
    localStorage.setItem("employerToken", t);
    setToken(t);
    setEmployer(e);
  };

  const logout = () => {
    localStorage.removeItem("employerToken");
    setToken(null);
    setEmployer(null);
  };

  const refreshEmployer = async (): Promise<void> => {
    try {
      const data = await getEmployerMe();
      setEmployer(data);
    } catch {
      logout();
    }
  };

  const isLoggedIn = () => !!token && !!employer;

  useEffect(() => {
    if (token) {
      getEmployerMe()
        .then((data) => setEmployer(data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <EmployerContext.Provider
      value={{ employer, token, loading, login, logout, refreshEmployer, isLoggedIn }}
    >
      {children}
    </EmployerContext.Provider>
  );
};

export const useEmployer = () => {
  const ctx = useContext(EmployerContext);
  if (!ctx) throw new Error("useEmployer must be used within EmployerProvider");
  return ctx;
};