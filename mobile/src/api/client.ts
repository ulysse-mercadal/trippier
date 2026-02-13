// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios from 'axios';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('@Trippier:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['@Trippier:token', '@Trippier:user']);
    }
    return Promise.reject(error);
  },
);

export default client;
