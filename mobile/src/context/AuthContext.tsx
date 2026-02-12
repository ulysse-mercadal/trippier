// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

interface User {
  id: number;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextData {
  token: string | null;
  user: User | null;
  loading: boolean;
  login(email: string, pass: string): Promise<void>;
  register(email: string, pass: string, name: string): Promise<void>;
  logout(): Promise<void>;
}
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await AsyncStorage.getItem('@Trippier:token');
      const storageUser = await AsyncStorage.getItem('@Trippier:user');
      if (storageToken && storageUser) {
        setToken(storageToken);
        setUser(JSON.parse(storageUser));
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  async function login(email: string, pass: string) {
    const response = await client.post('/auth/login', { email, password: pass });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    await AsyncStorage.setItem('@Trippier:token', access_token);
    await AsyncStorage.setItem('@Trippier:user', JSON.stringify(userData));
  }

  async function register(email: string, pass: string, name: string) {
    const response = await client.post('/auth/register', { email, password: pass, name });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    await AsyncStorage.setItem('@Trippier:token', access_token);
    await AsyncStorage.setItem('@Trippier:user', JSON.stringify(userData));
  }

  async function logout() {
    await AsyncStorage.multiRemove(['@Trippier:token', '@Trippier:user']);
    setToken(null);
    setUser(null);
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
