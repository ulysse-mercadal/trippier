// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios from 'axios';

const client = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@Trippier:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('@Trippier:token');
        localStorage.removeItem('@Trippier:user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export default client;
