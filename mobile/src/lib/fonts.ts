// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

/**
 * Loads the custom typefaces used by the design (Space Grotesk + JetBrains
 * Mono). Wave 2 ships a no-op stub because `expo-font` is not declared in
 * `package.json`. Wave 3+ will replace the body with either `expo-font.loadAsync`
 * or a native asset registration once the user decides on the loader.
 *
 * The stub resolves immediately so the app can mount without blocking and
 * fall back to the platform's default sans/mono families referenced by
 * `theme.fonts.sans` / `theme.fonts.mono`.
 *
 * @returns A promise that resolves once the (currently empty) font set is ready.
 */
export async function loadFonts(): Promise<void> {
  return Promise.resolve();
}
