import { AuthApi, ILogin, ILoginRequest, useUserStore } from "@/services/auth";
import { removeAuthToken, setAuthToken } from "@/services/auth/auth.helper";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  user: ILogin | null;
  isLoading: boolean;
  login: (user: ILoginRequest) => Promise<ILogin>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const logoutStore = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);

  const login = async (data: ILoginRequest) => {
    const response = await AuthApi.login(data?.username.trim(), data?.password);
    useUserStore.setState(() => ({
      user: response,
      isLoading: false,
    }));
    setAuthToken(response.token);
    return response;
  };

  const logout = async () => {
    logoutStore();
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
