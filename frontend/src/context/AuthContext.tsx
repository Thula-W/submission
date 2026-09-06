import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  authApi,
  configureAuthCallbacks,
  setAccessToken as setApiAccessToken,
} from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginCustomer: (credentials: { email: string; password: string }) => Promise<void>;
  loginAdmin: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize token state with api service
  const updateToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setApiAccessToken(token);
  }, []);

  const handleLogoutSync = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setApiAccessToken(null);
  }, []);

  useEffect(() => {
    // Register sync callbacks with centralized Axios interceptor
    configureAuthCallbacks(
      (newToken) => {
        setAccessTokenState(newToken);
      },
      () => {
        handleLogoutSync();
      },
    );
  }, [handleLogoutSync]);

  // Silent session refresh on initial load
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken();
      setUser(response.user);
      updateToken(response.accessToken);
      return true;
    } catch {
      // Session does not exist or refresh token expired
      setUser(null);
      updateToken(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [updateToken]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginCustomer = async (credentials: { email: string; password: string }) => {
    const response = await authApi.loginCustomer(credentials);
    setUser(response.user);
    updateToken(response.accessToken);
  };

  const loginAdmin = async (credentials: { email: string; password: string }) => {
    const response = await authApi.loginAdmin(credentials);
    setUser(response.user);
    updateToken(response.accessToken);
  };

  const register = async (data: { email: string; password: string }) => {
    await authApi.register(data);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      handleLogoutSync();
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    loginCustomer,
    loginAdmin,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
