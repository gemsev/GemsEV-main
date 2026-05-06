import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { Owner, useGetCurrentUser, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  currentUser: Owner | null | undefined;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const qc = useQueryClient();

  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      enabled: !!token,
      retry: false,
    },
  });

  const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setTokenState(null);
    qc.clear();
  };

  const refreshUser = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
  }, [qc]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: token ? user : null,
        isLoading,
        token,
        setToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
