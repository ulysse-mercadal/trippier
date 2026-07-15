// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  LocationManager,
  requestAndroidLocationPermissions,
} from '@maplibre/maplibre-react-native';

/**
 * Lightweight projection of a {@link LocationManager} update — the only two
 * fields we need across the app are lat/lng. Accuracy / heading / speed are
 * dropped because no current screen consumes them.
 */
export interface UserCoords {
  lat: number;
  lng: number;
}

/**
 * Tri-state status of the location subscription.
 *
 * - `'pending'` — we haven't received any reading yet (cold boot, prompt
 *   still on screen, or fix not yet acquired).
 * - `'ready'`   — at least one valid reading is in `coords`.
 * - `'denied'`  — the system permission dialog was declined; the caller
 *   should fall back to a sensible default and stop expecting updates.
 */
export type UserLocationStatus = 'pending' | 'ready' | 'denied';

export interface UseUserLocationResult {
  coords: UserCoords | null;
  status: UserLocationStatus;
}

/**
 * Subscribes to the device's location via MapLibre's bundled
 * {@link LocationManager}. No extra geolocation library required.
 *
 * Behaviour:
 *
 * - On Android, prompts the system permission via
 *   {@link requestAndroidLocationPermissions} once on mount. iOS is auto-
 *   prompted by the native side when a listener is attached (the app's
 *   `NSLocationWhenInUseUsageDescription` Info.plist key supplies the copy).
 * - Resolves the last-known cached coordinate immediately if the OS has
 *   one — gives the caller something to render without waiting for a fresh
 *   GPS fix.
 * - Streams fresh updates as the user moves. Callers that only need the
 *   first reading should compare against a ref and ignore subsequent ones.
 *
 * The listener is removed on unmount so a screen swap doesn't leak a
 * native subscription.
 *
 * @returns The latest user coordinates plus a status flag.
 */
export function useUserLocation(): UseUserLocationResult {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>('pending');
  const listenerRef = useRef<((l: { coords: { latitude: number; longitude: number } }) => void) | null>(null);

  useEffect(() => {
    let mounted = true;

    async function subscribe(): Promise<void> {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidLocationPermissions();
        if (!granted) {
          if (mounted) {setStatus('denied');}
          return;
        }
      }

      try {
        const last = await LocationManager.getLastKnownLocation();
        if (mounted && last?.coords) {
          setCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
          setStatus('ready');
        }
      } catch {
        // Last-known is best-effort — falling through to the live listener
        // is the right move; the screen still gets fresh data shortly.
      }

      const listener = (l: { coords: { latitude: number; longitude: number } }): void => {
        if (!mounted) {return;}
        setCoords({ lat: l.coords.latitude, lng: l.coords.longitude });
        setStatus('ready');
      };
      listenerRef.current = listener;
      LocationManager.addListener(listener);
    }

    subscribe();

    return () => {
      mounted = false;
      if (listenerRef.current) {
        LocationManager.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, []);

  return { coords, status };
}
