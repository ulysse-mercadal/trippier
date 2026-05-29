// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Design tokens for the Trippier mobile app — v4 themed Material direction.
 *
 * Two independent axes drive the look: the interface theme (`light` default,
 * `dark`, `tonner`) and the map theme. Tokens are pre-resolved to sRGB hex
 * because React Native does not parse `oklch()` or `color-mix()`.
 *
 * The `tonner` interface collapses every `emerald*` token to black so the
 * exact same components render in monochrome with zero markup branching.
 */

export type ThemeName = 'light' | 'dark' | 'tonner';
export type MapThemeName = 'light' | 'dark' | 'tonner';

/**
 * Interface palette. Each token maps to a v4 `--m-*` CSS variable.
 */
export interface ColorPalette {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  ink: string;
  ink2: string;
  mute: string;
  mute2: string;
  line: string;
  emerald: string;
  emeraldDeep: string;
  emeraldSoft: string;
  onEmerald: string;
}

/**
 * Map palette consumed by the SVG / Mapbox-style overlay. Independent of the
 * interface palette so the user can mix and match (e.g. dark UI + light map).
 */
export interface MapPalette {
  bg: string;
  park: string;
  water: string;
  road: string;
  road2: string;
  label: string;
  sel: string;
  selFill: string;
}

export interface RadiiScale {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
}

export interface FontFamilies {
  display: string;
  mono: string;
}

export interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface MotionDurations {
  fast: number;
  base: number;
  slow: number;
  drawer: number;
}

export interface EasingTokens {
  outBezier: [number, number, number, number];
}

export interface ShadowSpec {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

export interface ShadowTokens {
  e1: ShadowSpec;
  e2: ShadowSpec;
  e3: ShadowSpec;
}

export interface SpacingScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Theme {
  name: ThemeName;
  colors: ColorPalette;
  radii: RadiiScale;
  fonts: FontFamilies;
  fontSize: FontSizes;
  motion: MotionDurations;
  easing: EasingTokens;
  shadows: ShadowTokens;
  spacing: SpacingScale;
}

export const PALETTES: Record<ThemeName, ColorPalette> = {
  light: {
    bg: '#eef2f0',
    surface: '#ffffff',
    surface2: '#f3f6f4',
    surface3: '#e9eeeb',
    ink: '#18211d',
    ink2: '#59635e',
    mute: '#8b938e',
    mute2: '#b3bab5',
    line: '#e7ecea',
    emerald: '#0c9466',
    emeraldDeep: '#0a6f4d',
    emeraldSoft: '#e6f4ed',
    onEmerald: '#ffffff',
  },
  dark: {
    bg: '#14171a',
    surface: '#1b2023',
    surface2: '#232a2d',
    surface3: '#2b3236',
    ink: '#eef1f0',
    ink2: '#a8b0ad',
    mute: '#828a86',
    mute2: '#5b635f',
    line: '#2c3338',
    emerald: '#0c9466',
    emeraldDeep: '#44c391',
    emeraldSoft: '#163528',
    onEmerald: '#ffffff',
  },
  tonner: {
    bg: '#f7f7f7',
    surface: '#ffffff',
    surface2: '#f0f0f0',
    surface3: '#e6e6e6',
    ink: '#111111',
    ink2: '#444444',
    mute: '#777777',
    mute2: '#aaaaaa',
    line: '#dcdcdc',
    emerald: '#111111',
    emeraldDeep: '#111111',
    emeraldSoft: '#ececec',
    onEmerald: '#ffffff',
  },
};

export const MAP_PALETTES: Record<MapThemeName, MapPalette> = {
  light: {
    bg: '#e9efe9',
    park: '#d2e6d4',
    water: '#cfe0e6',
    road: '#ffffff',
    road2: '#dbe3dd',
    label: '#8c968f',
    sel: '#0c9466',
    selFill: 'rgba(12, 148, 102, 0.14)',
  },
  dark: {
    bg: '#16201b',
    park: '#163d2b',
    water: '#dfe9e3',
    road: '#c4ccc6',
    road2: '#26352d',
    label: '#8f9a92',
    sel: '#0c9466',
    selFill: 'rgba(12, 148, 102, 0.18)',
  },
  tonner: {
    bg: '#ffffff',
    park: '#e7e7e7',
    water: '#d3d3d3',
    road: '#111111',
    road2: '#c4c4c4',
    label: '#555555',
    sel: '#111111',
    selFill: 'rgba(17, 17, 17, 0.12)',
  },
};

export const RADII: RadiiScale = { sm: 12, md: 16, lg: 22, xl: 30, pill: 999 };

export const FONTS: FontFamilies = {
  display: 'BricolageGrotesque',
  mono: 'JetBrainsMono',
};

export const FONT_SIZES: FontSizes = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 26,
  xxxl: 32,
};

export const MOTION: MotionDurations = {
  fast: 120,
  base: 160,
  slow: 220,
  drawer: 350,
};

export const EASING: EasingTokens = {
  outBezier: [0.4, 0, 0.2, 1],
};

export const SHADOWS: ShadowTokens = {
  e1: {
    shadowColor: '#18211d',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  e2: {
    shadowColor: '#18211d',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  e3: {
    shadowColor: '#18211d',
    shadowOpacity: 0.13,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
};

export const SPACING: SpacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/**
 * Builds a fully resolved interface theme object for a given theme name.
 *
 * @param name - The interface theme identifier (`'light' | 'dark' | 'tonner'`).
 * @returns A theme object containing colors, scale tokens and motion settings.
 */
export function buildTheme(name: ThemeName): Theme {
  return {
    name,
    colors: PALETTES[name],
    radii: RADII,
    fonts: FONTS,
    fontSize: FONT_SIZES,
    motion: MOTION,
    easing: EASING,
    shadows: SHADOWS,
    spacing: SPACING,
  };
}

/**
 * Returns the map palette for a given map theme.
 *
 * @param name - The map theme identifier.
 * @returns The resolved map colour set.
 */
export function buildMapPalette(name: MapThemeName): MapPalette {
  return MAP_PALETTES[name];
}

export const DEFAULT_THEME_NAME: ThemeName = 'light';
export const DEFAULT_MAP_THEME_NAME: MapThemeName = 'light';
