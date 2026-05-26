import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "../../api/client";

type User = {
  id: string;
  pseudo: string;
  email: string;
  grade: string;
  role: string;
  statut: string;
};

type SessionUserContextType = {
  sessionUser: User | null;
  loading: boolean;
  login: (loginOrEmail: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const SessionUserContext = createContext<SessionUserContextType | null>(null);

export function SessionUserContextProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<User>("/api/auth/me")
      .then((me) => setSessionUser(me))
      .catch(() => setSessionUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (loginOrEmail: string, password: string) => {
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ loginOrEmail, password }),
      });

      const me = await apiFetch<User>("/api/auth/me");
      setSessionUser(me);

      return true;
    } catch {
      setSessionUser(null);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setSessionUser(null);
    }
  };


  return (
    <SessionUserContext.Provider value={{ sessionUser, loading, login, logout }}>
      {children}
    </SessionUserContext.Provider>
  );
}

export function useSessionUserContext() {
  const context = useContext(SessionUserContext);

  if (!context) {
    throw new Error("useSessionUserContext doit être utilisé dans SessionUserContextProvider");
  }

  return context;
}
