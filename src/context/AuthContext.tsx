import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { setAuthToken } from '../services/api';

export type DireccionContacto = {
  id?: string;
  nombreContacto: string;
  telefono: string;
  email: string;
  direccion: string;
  comuna: string;
  ciudad?: string | null;
  region: string;
  notas?: string | null;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  telefono?: string | null;
  ecommerceClienteId?: string | null;
  direccionPrincipal?: DireccionContacto | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = 'covasa_user';
const ECOMMERCE_CLIENTE_ID_KEY = 'covasa_ecommerce_cliente_id';
const LEGACY_CLIENTE_ID_KEY = 'covasa_cliente_id';

const readStorage = (): AuthUser | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.name !== 'string' || typeof parsed.email !== 'string') {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      telefono: parsed.telefono ?? null,
      ecommerceClienteId: parsed.ecommerceClienteId ?? parsed.clienteId ?? null,
      direccionPrincipal: parsed.direccionPrincipal ?? null,
    };
  } catch {
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStorage());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      if (user.ecommerceClienteId) {
        window.localStorage.setItem(ECOMMERCE_CLIENTE_ID_KEY, user.ecommerceClienteId);
        window.localStorage.removeItem(LEGACY_CLIENTE_ID_KEY);
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ECOMMERCE_CLIENTE_ID_KEY);
      window.localStorage.removeItem(LEGACY_CLIENTE_ID_KEY);
    }
  }, [user]);

  const login = useCallback((nextUser: AuthUser) => {
    setUser({
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      telefono: nextUser.telefono ?? null,
      ecommerceClienteId: nextUser.ecommerceClienteId ?? null,
      direccionPrincipal: nextUser.direccionPrincipal ?? null,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
