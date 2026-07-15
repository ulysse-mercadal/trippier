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
  useRef,
  useState,
} from 'react';
import {
  createNavigationContainerRef,
  NavigationContainerRefWithCurrent,
} from '@react-navigation/native';
import AuthRequiredSheet from '../components/AuthRequiredSheet';
import { useAuth } from './AuthContext';
import type { GateAction, RootStackParamList } from '../navigation/types';

/**
 * Shared navigation ref consumed by the gate provider to open the auth modal
 * from any screen. Should be passed to the root `NavigationContainer` via
 * its `ref` prop in `App.tsx`.
 */
export const navigationRef: NavigationContainerRefWithCurrent<RootStackParamList> =
  createNavigationContainerRef<RootStackParamList>();

export interface AuthGateContextValue {
  gate(action: GateAction, onAuthed: () => void): void;
  requireAuth(action: GateAction): Promise<void>;
}

const AuthGateContext = createContext<AuthGateContextValue>({
  gate: () => {},
  requireAuth: async () => {
    throw new Error('AuthGateProvider is not mounted');
  },
});

interface PendingResolution {
  resolve: () => void;
  reject: (reason?: Error) => void;
}

/**
 * Hosts the {@link AuthRequiredSheet} singleton at the root of the navigation
 * tree and exposes the `gate` + `requireAuth` helpers consumed via
 * {@link useAuthGate}.
 *
 * When `gate` is called:
 * - if a user is signed in → invokes `onAuthed` synchronously.
 * - otherwise → opens the sheet with the supplied action. The user's
 *   selection routes through `onSignIn` (navigates to the auth modal) or
 *   `onClose` (dismisses + clears state).
 *
 * @param props - Standard React `children` prop.
 * @returns A provider exposing the {@link AuthGateContextValue}.
 */
export const AuthGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState<GateAction>('generic');
  const pendingRef = useRef<PendingResolution | null>(null);
  const onAuthedRef = useRef<(() => void) | null>(null);
  const prevSignedInRef = useRef<boolean>(signedIn);

  useEffect(() => {
    if (signedIn && !prevSignedInRef.current) {
      const pending = pendingRef.current;
      const callback = onAuthedRef.current;
      pendingRef.current = null;
      onAuthedRef.current = null;
      if (callback) {
        callback();
      }
      if (pending) {
        pending.resolve();
      }
    }
    prevSignedInRef.current = signedIn;
  }, [signedIn]);

  const close = useCallback((): void => {
    setVisible(false);
    const pending = pendingRef.current;
    pendingRef.current = null;
    onAuthedRef.current = null;
    if (pending) {
      pending.reject(new Error('Auth gate dismissed'));
    }
  }, []);

  const openAuth = useCallback((): void => {
    setVisible(false);
    if (navigationRef.isReady()) {
      navigationRef.navigate('AuthModal', { screen: 'Auth' });
    }
  }, []);

  const gate = useCallback(
    (target: GateAction, onAuthed: () => void): void => {
      if (signedIn) {
        onAuthed();
        return;
      }
      const previousPending = pendingRef.current;
      pendingRef.current = null;
      if (previousPending) {
        previousPending.reject(new Error('Auth gate superseded'));
      }
      onAuthedRef.current = onAuthed;
      setAction(target);
      setVisible(true);
    },
    [signedIn],
  );

  const requireAuth = useCallback(
    (target: GateAction): Promise<void> => {
      if (signedIn) {
        return Promise.resolve();
      }
      const previousPending = pendingRef.current;
      onAuthedRef.current = null;
      if (previousPending) {
        previousPending.reject(new Error('Auth gate superseded'));
      }
      return new Promise<void>((resolve, reject) => {
        pendingRef.current = { resolve, reject };
        setAction(target);
        setVisible(true);
      });
    },
    [signedIn],
  );

  return (
    <AuthGateContext.Provider value={{ gate, requireAuth }}>
      {children}
      <AuthRequiredSheet
        visible={visible}
        action={action}
        onClose={close}
        onSignIn={openAuth}
      />
    </AuthGateContext.Provider>
  );
};

/**
 * Internal hook returning the gate context. Prefer {@link useAuthGate}
 * (re-exported from `hooks/useAuthGate.ts`) for screen-level usage.
 *
 * @returns The current {@link AuthGateContextValue}.
 */
export function useAuthGateContext(): AuthGateContextValue {
  return useContext(AuthGateContext);
}
