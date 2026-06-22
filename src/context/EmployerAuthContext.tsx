import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { employerLogin, getEmployerProfile } from '../services/employerApi';

interface Employer {
  _id: string;
  companyName: string;
  recruiterName: string;
  email: string;
  companyLogo?: string;
  isVerifiedBadge?: boolean;
  subscription?: {
    plan: string;
    jobCredits: number;
    expiresAt: string | null;
  };
  profileCompletionPercent?: number;
}

interface EmployerAuthContextType {
  employer: Employer | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshEmployer: () => Promise<void>;
}

const EmployerAuthContext = createContext<EmployerAuthContextType | undefined>(undefined);

export const EmployerAuthProvider = ({ children }: { children: ReactNode }) => {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('employerToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshEmployer();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await employerLogin({ email, password });
    const { token: newToken, employer: emp } = res.data;
    localStorage.setItem('employerToken', newToken);
    setToken(newToken);
    setEmployer(emp);
  };

  const logout = () => {
    localStorage.removeItem('employerToken');
    setToken(null);
    setEmployer(null);
  };

  const refreshEmployer = async () => {
    try {
      const res = await getEmployerProfile();
      setEmployer(res.data.employer);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployerAuthContext.Provider value={{ employer, token, loading, login, logout, refreshEmployer }}>
      {children}
    </EmployerAuthContext.Provider>
  );
};

export const useEmployerAuth = () => {
  const ctx = useContext(EmployerAuthContext);
  if (!ctx) throw new Error('useEmployerAuth must be used inside EmployerAuthProvider');
  return ctx;
};