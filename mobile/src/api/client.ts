// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import axios, { AxiosInstance } from 'axios';
import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { API_URL } from '@env';
import { getRaw, multiRemove, StorageKey } from '../lib/storage';

/**
 * Event name emitted on the global `DeviceEventEmitter` when the server
 * returns a 401. Other modules (AuthContext, navigation) can subscribe to
 * trigger a logout / redirect without importing the auth context here
 * (avoids cyclic coupling).
 */
export const AUTH_UNAUTHORIZED_EVENT = '@Trippier:auth:unauthorized';

/**
 * Subscribes a listener to the unauthorized event.
 *
 * @param listener - Callback invoked when a 401 is intercepted.
 * @returns The {@link EmitterSubscription} — call `.remove()` to unsubscribe.
 */
export function onUnauthorized(listener: () => void): EmitterSubscription {
  return DeviceEventEmitter.addListener(AUTH_UNAUTHORIZED_EVENT, listener);
}

/**
 * Builds an axios instance preconfigured with the JWT request interceptor
 * and the 401-handling response interceptor.
 *
 * @param baseURL - The base URL the instance should target.
 * @returns The configured axios client.
 */
function buildClient(baseURL: string): AxiosInstance {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async config => {
    const token = await getRaw(StorageKey.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    response => response,
    async error => {
      if (error?.response?.status === 401) {
        await multiRemove([StorageKey.TOKEN, StorageKey.USER]);
        DeviceEventEmitter.emit(AUTH_UNAUTHORIZED_EVENT);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

const client = buildClient(API_URL);

export default client;
export { buildClient };
