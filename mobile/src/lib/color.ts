// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Wraps an arbitrary CSS color expression in a `color-mix(...)`-style
 * alpha-composition string. React Native's color parser accepts OKLCH, hex,
 * rgba(), hsla() and named colors, but it does not implement `color-mix`.
 *
 * To stay compatible without a heavyweight color lib we keep things simple:
 * if the input already starts with `rgba`/`rgb` we replace its alpha;
 * otherwise we fall back to wrapping the original color inside an `rgba()`
 * via React Native's native color parser by emitting the standard
 * `rgba(<r>,<g>,<b>,alpha)` form when the input is a `#rrggbb` hex. For
 * complex spaces (oklch) we approximate by emitting the original color
 * untouched — the design tokens already provide ready-made `accentSoft`
 * tints for those cases.
 *
 * @param color - The source color string (hex, rgb, rgba, oklch…).
 * @param alpha - The target alpha in the `[0, 1]` range.
 * @returns A color expression carrying the new alpha when possible.
 */
export function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex = expandHex(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(s => s.trim());
    if (parts.length >= 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }
  return color;
}

/**
 * Expands `#rgb` to `#rrggbb`; passes `#rrggbb` through unchanged.
 *
 * @param hex - The hex string to expand.
 * @returns The 7-character hex string.
 */
function expandHex(hex: string): string {
  if (hex.length === 4) {
    const r = hex[1];
    const g = hex[2];
    const b = hex[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return hex;
}
