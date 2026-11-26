import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchAuthState, devLogin as apiDevLogin, logout as apiLogout, type AuthState, type Role, type SessionUser } from "@/lib/api";

interface AuthCtx extends AuthState {
  loading: boolean;
  canEdit: boolean; // Admin / Producer / Facilitator
  canManage: boolean; // Admin / Producer
  refresh: () => Promise<void>;
  devLogin: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, oauth: false, devLoginAvailable: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setState(await fetchAuthState());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const devLogin = useCallback(async (role: Role) => {
    await apiDevLogin(role);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiLogout();
    await refresh();
  }, [refresh]);

  const role = state.user?.role;
  const value: AuthCtx = {
    ...state,
    loading,
    canEdit: role === "Admin" || role === "Producer" || role === "Facilitator",
    canManage: role === "Admin" || role === "Producer",
    refresh,
    devLogin,
    logout,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}

export type { Role, SessionUser };
