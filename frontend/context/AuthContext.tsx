// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulysse.mercadal@trippier.com
//
// **************************************************************************

'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../lib/client';
import { useRouter } from 'next/navigation';

interface AuthContextData {
  token: string | null;
  user: unknown | null;
  loading: boolean;
  login(email: string, pass: string): Promise<void>;
  register(email: string, pass: string, name: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = localStorage.getItem('@Trippier:token');
      const storageUser = localStorage.getItem('@Trippier:user');
      if (storageToken && storageUser) {
        setToken(storageToken);
        setUser(JSON.parse(storageUser));
        client.defaults.headers.common.Authorization = `Bearer ${storageToken}`;
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  async function login(email: string, pass: string) {
    const response = await client.post('/auth/login', {
      email,
      password: pass,
    });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    client.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    localStorage.setItem('@Trippier:token', access_token);
    localStorage.setItem('@Trippier:user', JSON.stringify(userData));
    router.push('/discover');
  }

  async function register(email: string, pass: string, name: string) {
    await client.post('/auth/register', { email, password: pass, name });
    await login(email, pass);
  }

  async function logout() {
    localStorage.removeItem('@Trippier:token');
    localStorage.removeItem('@Trippier:user');
    setToken(null);
    setUser(null);
    delete client.defaults.headers.common.Authorization;
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
