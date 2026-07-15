// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildMapPalette,
  buildTheme,
  DEFAULT_MAP_THEME_NAME,
  DEFAULT_THEME_NAME,
  MapPalette,
  MapThemeName,
  Theme,
  ThemeName,
} from './tokens';
import { getRaw, setRaw, StorageKey } from '../lib/storage';

/**
 * Context value exposed by {@link ThemeProvider}.
 *
 * The provider holds two independent axes — the interface theme and the map
 * theme — each persisted to its own AsyncStorage key. `mapPalette` is the
 * resolved colour set the SVG / Mapbox layer should consume.
 */
export interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  mapTheme: MapPalette;
  mapThemeName: MapThemeName;
  setTheme: (name: ThemeName) => Promise<void>;
  setMapTheme: (name: MapThemeName) => Promise<void>;
  ready: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme(DEFAULT_THEME_NAME),
  themeName: DEFAULT_THEME_NAME,
  mapTheme: buildMapPalette(DEFAULT_MAP_THEME_NAME),
  mapThemeName: DEFAULT_MAP_THEME_NAME,
  setTheme: async () => {},
  setMapTheme: async () => {},
  ready: false,
});

/**
 * Type guard validating a stored string is a supported interface theme name.
 *
 * @param value - The raw value read from AsyncStorage.
 * @returns `true` when `value` is a known {@link ThemeName}.
 */
function isThemeName(value: string | null): value is ThemeName {
  return value === 'light' || value === 'dark' || value === 'tonner';
}

/**
 * Type guard validating a stored string is a supported map theme name.
 *
 * @param value - The raw value read from AsyncStorage.
 * @returns `true` when `value` is a known {@link MapThemeName}.
 */
function isMapThemeName(value: string | null): value is MapThemeName {
  return value === 'light' || value === 'dark' || value === 'tonner';
}

/**
 * Provides the active interface and map themes to the entire app tree.
 *
 * On mount both choices are read from AsyncStorage (`@Trippier:uiTheme` and
 * `@Trippier:mapTheme`). Defaults are `light` for both. Each setter updates
 * the in-memory state and persists the new value.
 *
 * @param props - Standard React children prop.
 * @returns A provider exposing the {@link ThemeContextValue}.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME_NAME);
  const [mapThemeName, setMapThemeName] = useState<MapThemeName>(DEFAULT_MAP_THEME_NAME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      const [storedUi, storedMap] = await Promise.all([
        getRaw(StorageKey.UI_THEME),
        getRaw(StorageKey.MAP_THEME),
      ]);
      if (!active) {
        return;
      }
      if (isThemeName(storedUi)) {
        setThemeName(storedUi);
      }
      if (isMapThemeName(storedMap)) {
        setMapThemeName(storedMap);
      }
      setReady(true);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const setTheme = useCallback(async (name: ThemeName): Promise<void> => {
    setThemeName(name);
    await setRaw(StorageKey.UI_THEME, name);
  }, []);

  const setMapTheme = useCallback(async (name: MapThemeName): Promise<void> => {
    setMapThemeName(name);
    await setRaw(StorageKey.MAP_THEME, name);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(themeName),
      themeName,
      mapTheme: buildMapPalette(mapThemeName),
      mapThemeName,
      setTheme,
      setMapTheme,
      ready,
    }),
    [themeName, mapThemeName, setTheme, setMapTheme, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
