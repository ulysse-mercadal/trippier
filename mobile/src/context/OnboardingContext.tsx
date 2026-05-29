// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getRaw, setRaw, StorageKey } from '../lib/storage';

/**
 * Onboarding state. The Welcome screen applies the interface / map theme
 * picks live through {@link useTheme} as the user taps each swatch, so the
 * onboarding context only carries the completion flag.
 */
export interface OnboardingContextValue {
  done: boolean;
  ready: boolean;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
}

const asyncNoop = async (): Promise<void> => {};

export const OnboardingContext = createContext<OnboardingContextValue>({
  done: false,
  ready: false,
  complete: asyncNoop,
  reset: asyncNoop,
});

/**
 * Persists the onboarding completion flag under
 * {@link StorageKey.ONBOARDING_DONE}. Theme + map choices are persisted by
 * the {@link ThemeProvider} as the user changes them on the Welcome screen.
 *
 * @param props - Standard React `children` prop.
 * @returns A provider exposing the {@link OnboardingContextValue}.
 */
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      const flag = await getRaw(StorageKey.ONBOARDING_DONE);
      if (!active) {
        return;
      }
      setDone(flag === 'true');
      setReady(true);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const complete = useCallback(async (): Promise<void> => {
    await setRaw(StorageKey.ONBOARDING_DONE, 'true');
    setDone(true);
  }, []);

  const reset = useCallback(async (): Promise<void> => {
    await setRaw(StorageKey.ONBOARDING_DONE, '');
    setDone(false);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ done, ready, complete, reset }),
    [done, ready, complete, reset],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

/**
 * Hook reading the onboarding context.
 *
 * @returns The current {@link OnboardingContextValue}.
 */
export function useOnboarding(): OnboardingContextValue {
  return useContext(OnboardingContext);
}
