// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { useAuthGateContext } from '../context/AuthGateContext';
import type { GateAction } from '../navigation/types';

export interface UseAuthGateValue {
  /**
   * Imperative helper. Runs `onAuthed` immediately when the user is signed in,
   * otherwise opens the `AuthRequiredSheet` with the contextual copy for
   * `action`.
   */
  gate: (action: GateAction, onAuthed: () => void) => void;
  /**
   * Promise-based variant. Resolves when the user becomes signed in,
   * rejects if the sheet is dismissed. Useful for async flows like itinerary
   * generation that need to await an auth handshake before continuing.
   */
  requireAuth: (action: GateAction) => Promise<void>;
}

/**
 * Hook exposing the wave-2 auth-gating helpers.
 *
 * Must be called from a descendant of `AuthGateProvider`. Returns the same
 * pair of helpers from {@link useAuthGateContext} but typed as
 * {@link UseAuthGateValue} for clarity at call sites.
 *
 * @returns The {@link UseAuthGateValue} bound to the active provider.
 */
export function useAuthGate(): UseAuthGateValue {
  const { gate, requireAuth } = useAuthGateContext();
  return { gate, requireAuth };
}
