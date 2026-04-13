import { Role } from "@/hooks/useApi";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  userId: string | null;
  userName: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: Role, userId?: string, userName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "placement_portal_auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {
        isLoggedIn: false,
        role: null,
        userId: null,
        userName: null,
      };
    } catch (error) {
      console.error("Error loading auth state from localStorage:", error);
      return {
        isLoggedIn: false,
        role: null,
        userId: null,
        userName: null,
      };
    }
  });

  // Save to localStorage whenever auth state changes
  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch (error) {
      console.error("Error saving auth state to localStorage:", error);
    }
  }, [auth]);

  const login = (role: Role, userId?: string, userNameParam?: string) => {
    setAuth({
      isLoggedIn: true,
      role,
      userId: userId || null,
      userName: userNameParam || null,
    });
  };
  //now when you login, your authentication state will be saved in localStorage, and it will persist across page reloads. The logout function will clear the authentication state and remove it from localStorage.

  const logout = () => {
    setAuth({ isLoggedIn: false, role: null, userId: null, userName: null });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing auth state from localStorage:", error);
    }
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
