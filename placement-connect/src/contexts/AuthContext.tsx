import React, { createContext, useContext, useState, ReactNode } from "react";
import { Role } from "@/hooks/useApi";

interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  userId: string | null;
  userName: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: Role, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    role: null,
    userId: null,
    userName: null,
  });

  const login = (role: Role, userId?: string, userNameParam?: string) => {
    setAuth({
      isLoggedIn: true,
      role,
      userId: userId || null,
      userName: userNameParam || null,
    });
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, role: null, userId: null, userName: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
