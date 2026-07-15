// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { login as apiLogin, me as apiMe, register as apiRegister } from '../api/auth';
import { onUnauthorized } from '../api/client';
import { getItem, getRaw, multiRemove, setItem, setRaw, StorageKey } from '../lib/storage';
import { User } from '../lib/types';

export interface AuthContextData {
  token: string | null;
  user: User | null;
  signedIn: boolean;
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name?: string): Promise<void>;
  signOut(): Promise<void>;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, name?: string): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const noopAsync = async (): Promise<void> => {};

const AuthContext = createContext<AuthContextData>({
  token: null,
  user: null,
  signedIn: false,
  loading: true,
  signIn: noopAsync,
  signUp: noopAsync,
  signOut: noopAsync,
  login: noopAsync,
  register: noopAsync,
  logout: noopAsync,
  refresh: noopAsync,
});

/**
 * Persists the current auth tuple (token + user) to AsyncStorage.
 *
 * @param token - JWT access token issued by the NestJS backend.
 * @param user - User profile returned alongside the token.
 * @returns A promise that resolves once both keys have been written.
 */
async function persistAuth(token: string, user: User): Promise<void> {
  await setRaw(StorageKey.TOKEN, token);
  await setItem<User>(StorageKey.USER, user);
}

/**
 * Provides authentication state to the entire app tree.
 *
 * Reads the persisted token + user on mount, exposes `signIn` / `signUp` /
 * `signOut` (plus legacy `login` / `register` / `logout` aliases for the
 * wave-0 screens), and listens for `AUTH_UNAUTHORIZED_EVENT` emitted by the
 * axios client when the backend returns 401 — in which case the in-memory
 * state is cleared without making an extra network call.
 *
 * @param props - Standard React `children` prop.
 * @returns A provider exposing the {@link AuthContextData}.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      const storedToken = await getRaw(StorageKey.TOKEN);
      const storedUser = await getItem<User>(StorageKey.USER);
      if (!active) {
        return;
      }
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = onUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
    return () => subscription.remove();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { access_token, user: profile } = await apiLogin({ email, password });
    await persistAuth(access_token, profile);
    setToken(access_token);
    setUser(profile);
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string): Promise<void> => {
      const { access_token, user: profile } = await apiRegister({ email, password, name });
      await persistAuth(access_token, profile);
      setToken(access_token);
      setUser(profile);
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await multiRemove([StorageKey.TOKEN, StorageKey.USER]);
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    const fresh = await apiMe();
    await setItem<User>(StorageKey.USER, fresh);
    setUser(fresh);
  }, []);

  const value: AuthContextData = {
    token,
    user,
    signedIn: user != null,
    loading,
    signIn,
    signUp,
    signOut,
    login: signIn,
    register: signUp,
    logout: signOut,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook returning the active auth context.
 *
 * @returns The current {@link AuthContextData}.
 */
export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}
