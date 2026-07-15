// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from './ThemeProvider';

/**
 * Hook returning the active theme context.
 *
 * Throws nothing — when consumed outside a {@link ThemeProvider} the default
 * value is the dark palette so library components can still render in tests.
 *
 * @returns The current {@link ThemeContextValue}.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
