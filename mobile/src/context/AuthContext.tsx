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

interface AuthContextData {
  token: string | null;
  user: any | null;
  loading: boolean;
  login(email: string, pass: string): Promise<void>;
  logout(): Promise<void>;
}
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await AsyncStorage.getItem('@Trippier:token');
      const storageUser = await AsyncStorage.getItem('@Trippier:user');
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
    const response = await client.post('/auth/login', { email, password: pass });
    const { access_token, user: userData } = response.data;
    setToken(access_token);
    setUser(userData);
    client.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    await AsyncStorage.setItem('@Trippier:token', access_token);
    await AsyncStorage.setItem('@Trippier:user', JSON.stringify(userData));
  }

  async function logout() {
    await AsyncStorage.multiRemove(['@Trippier:token', '@Trippier:user']);
    setToken(null);
    setUser(null);
    delete client.defaults.headers.common.Authorization;
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
