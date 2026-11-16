import { createContext, useContext, useState, type ReactNode } from "react";
import { api, getToken, setToken, type Admin } from "../api/client";

interface AuthState {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// The JWT payload is readable without verification; we only use it to
// prefill the UI. The server remains the source of truth.
function decodeAdmin(token: string): Admin | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const token = getToken();
    return token ? decodeAdmin(token) : null;
  });

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.data.token);
    setAdmin(res.data.admin);
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
