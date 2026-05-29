// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { useEffect } from 'react';
import {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shared `cubic-bezier(0.16, 1, 0.3, 1)` easing curve used across the design.
 * Compatible with `Easing.bezier()` from `react-native-reanimated`.
 */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const T_FAST = 120;
export const T_BASE = 160;
export const T_SLOW = 220;
export const DRAWER_SNAP = 400;

/**
 * Animated style that pulses the `opacity` between two bounds in a loop.
 *
 * @param min - Lower bound of the opacity oscillation (e.g. `0.35`).
 * @param max - Upper bound of the opacity oscillation (e.g. `1`).
 * @param duration - Half-period of the pulse in milliseconds.
 * @returns A Reanimated style object suitable for `Animated.View`.
 */
export function usePulse(min: number, max: number, duration: number) {
  const progress = useSharedValue(min);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(max, { duration, easing: EASE_OUT }),
      -1,
      true,
    );
  }, [progress, min, max, duration]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
}

/**
 * Animated style that fades + slightly translates a view in on mount.
 *
 * @param delay - Delay before the fade-in starts, in milliseconds.
 * @returns A Reanimated style object combining `opacity` and `translateY`.
 */
export function useFadeIn(delay: number = 0) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: T_SLOW, easing: EASE_OUT }),
    );
  }, [progress, delay]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 8 }],
  }));
}
