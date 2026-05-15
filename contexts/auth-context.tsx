import { router } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearSession,
  getStoredUser,
  isPlayerNameTaken,
  registerPlayerName,
  saveSession,
  type StoredUser,
} from '@/lib/auth-storage';
import { AUTH_LOGIN, TABS_ROOT } from '@/lib/routes';

type AuthContextValue = {
  user: StoredUser | null;
  isLoading: boolean;
  identify: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getStoredUser();
        if (!cancelled && stored) {
          setUser(stored);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const identify = useCallback(async (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) {
      throw new Error('Informe seu nome para continuar.');
    }
    if (await isPlayerNameTaken(cleanName)) {
      throw new Error('Este nome já participou. Use um nome diferente.');
    }

    await registerPlayerName(cleanName);

    const user: StoredUser = {
      id: `player-${Date.now()}`,
      name: cleanName,
    };

    // Mantém compatibilidade com o restante do app que ainda espera um token salvo.
    await saveSession('local-name-session', user);
    setUser(user);
    router.replace(TABS_ROOT);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
    router.replace(AUTH_LOGIN);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      identify,
      signOut,
    }),
    [user, isLoading, identify, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
