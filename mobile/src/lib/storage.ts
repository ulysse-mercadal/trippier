// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Centralised AsyncStorage keys used across the app.
 *
 * Keep the namespace `@Trippier:*` consistent — these keys are read by the
 * API client and by several contexts, so a single source of truth is critical.
 */
export enum StorageKey {
  TOKEN = '@Trippier:token',
  USER = '@Trippier:user',
  UI_THEME = '@Trippier:uiTheme',
  MAP_THEME = '@Trippier:mapTheme',
  ONBOARDING_DONE = '@Trippier:onboardingComplete',
  SAVED_POIS = '@Trippier:savedPois',
}

/**
 * Reads a value from AsyncStorage and deserialises it as JSON.
 *
 * @typeParam T - Expected type of the stored value.
 * @param key - The storage key to read.
 * @returns The parsed value, or `null` if absent / unparseable.
 */
export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Serialises a value to JSON and stores it under the given key.
 *
 * @typeParam T - Type of the value to persist.
 * @param key - The storage key to write to.
 * @param value - The value to persist (serialised via `JSON.stringify`).
 * @returns A promise that resolves once the value has been written.
 */
export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * Removes a single key from AsyncStorage.
 *
 * @param key - The storage key to remove.
 * @returns A promise that resolves once the key has been removed.
 */
export async function removeItem(key: StorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

/**
 * Removes a batch of keys from AsyncStorage.
 *
 * @param keys - The storage keys to remove.
 * @returns A promise that resolves once all keys have been removed.
 */
export async function multiRemove(keys: StorageKey[]): Promise<void> {
  await AsyncStorage.multiRemove(keys);
}

/**
 * Reads a raw string value from AsyncStorage without JSON parsing.
 *
 * @param key - The storage key to read.
 * @returns The raw string value, or `null` if absent.
 */
export async function getRaw(key: StorageKey): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

/**
 * Writes a raw string value to AsyncStorage without JSON wrapping.
 *
 * @param key - The storage key to write to.
 * @param value - The raw string value to persist.
 * @returns A promise that resolves once the value has been written.
 */
export async function setRaw(key: StorageKey, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}
