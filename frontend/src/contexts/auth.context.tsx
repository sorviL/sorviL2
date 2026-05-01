import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicUser } from "../services/auth.types";
import { getCurrentUser, logoutUser } from "../services/auth.service";

type AuthContextType = {
  user: PublicUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const result = await getCurrentUser();

      if (result.success) {
        setUserState(result.data);
      }

      setIsLoading(false);
    }

    checkAuth();
  }, []);

  async function logout() {
    await logoutUser();
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
