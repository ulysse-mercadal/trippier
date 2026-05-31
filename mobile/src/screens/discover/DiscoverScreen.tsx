// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Chip from '../../components/Chip';
import MapTilerMap, {
  type MapRegion,
  type MapTilerMarker,
  type MapTilerMapHandle,
} from '../../components/MapTilerMap';
import Search from '../../components/Search';
import Tag from '../../components/Tag';
import TitleDot from '../../components/TitleDot';
import {
  ArrowLeft,
  MapPin as MapPinIcon,
  Search as SearchIcon,
  X as XIcon,
} from '../../components/icons';
import { DRAWER_SNAP, EASE_OUT } from '../../animations/motion';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useTheme } from '../../theme/useTheme';
import type { DiscoverStackParamList } from '../../navigation/types';
import type { EnrichedPoi } from '../../api/pois';
import { searchPois } from '../../api/pois';
import PoiListRow from './PoiListRow';
import { buildSourceLinks, extractWikidataId } from './poiSources';
import {
  DISCOVER_CHIPS,
  DISCOVER_DEFAULT_CENTER,
  DISCOVER_DEFAULT_ZOOM,
  formatPoiMeta,
  isInBounds,
  isZoomedTooFarOut,
  radiusFromBounds,
} from './discover-data';
import { glyphForPoiType } from './poi-type-glyph';

type Nav = NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverHome'>;
type SnapIndex = 0 | 1 | 2 | 3;

const TABBAR_RESERVED = 96;
const FETCH_LIMIT = 30;
/** Idle window the camera has to settle before we hit /pois/search — at
 *  ~500 ms a casual pan/zoom no longer fires a request on every frame,
 *  saving API credits while still feeling responsive once the user stops
 *  moving the map. */
const REFETCH_MS = 500;
const COLD_BOOT_RADIUS_M = 1500;
const SCORE_FALLBACK = 0;
/** Hard cap on the description we forward via navigation params. */
const DESCRIPTION_MAX_CHARS = 4000;
/** Zoom level we fly the camera to when the first user location arrives. */
const USER_FLY_ZOOM = 15;
/** Approximate floating search bar height (used to anchor the top edge of
 *  the surrounding grey frame just below it). */
const SEARCH_BAR_H = 52;
/** Side / top frame thickness around the map cutout. */
const FRAME = 12;
/** Radius of the four debug arcs tracing where the cutout fillet would live. */
const CUTOUT_R = 30;
/** Velocity threshold past which a release momentum biases the snap pick. */
const SNAP_VELOCITY_BIAS = 0.2;
/** Grey frame fade-in / fade-out duration when entering / leaving open mode. */
const FRAME_DURATION = 220;

/**
 * Picks the snap index whose height is closest to a target height, with an
 * optional momentum bias so a quick fling rounds in the swipe's direction.
 *
 * Lives on the UI thread (`'worklet'`) because the pan gesture calls it
 * inside `onEnd`.
 *
 * @param snapHeights - Snap heights indexed 1..3.
 * @param current - Current drawer height (px).
 * @param momentum - Signed bias proportional to release velocity; positive
 *   means the user was dragging UP (towards larger snap heights).
 * @returns A {@link SnapIndex} from {1, 2, 3} — the caller decides whether
 *   to collapse to 0 based on the close threshold.
 */
function pickSnap(
  snapHeights: Record<Exclude<SnapIndex, 0>, number>,
  current: number,
  momentum: number,
): Exclude<SnapIndex, 0> {
  'worklet';
  const biased = current + momentum;
  const candidates: Exclude<SnapIndex, 0>[] = [1, 2, 3];
  let best: Exclude<SnapIndex, 0> = 1;
  let bestDist = Infinity;
  for (const i of candidates) {
    const d = Math.abs(snapHeights[i] - biased);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * v4 Discover screen — real MapTiler map + real POIs from the public API.
 *
 * The map view is always full-bleed and **never resizes** — MapLibre's
 * camera, tile cache and user dot are completely undisturbed by the open /
 * close animation. The "framed" look in open mode comes from a grey card
 * that materialises on top of the map and is composed of three pieces
 * (top strip, left gutter, right gutter) plus the drawer at the bottom.
 * All four pieces share the same colour and bound together so the user
 * reads them as a single continuous element surrounding the map cutout.
 *
 * Snap layout (drawer height anchored to the screen bottom):
 * - **0** — closed; no frame, just the full-bleed map + search bar + the
 *   floating "N places" pill.
 * - **1** (default open) — 1/3 of the available vertical space; the
 *   drawer's top edge meets the map cutout's bottom edge, the entire map
 *   keeps its full 2/3 of visible area.
 * - **2** — 2/3 of the available space; the drawer covers the bottom half
 *   of the map.
 * - **3** — full; the drawer covers the map entirely. The search bar floats
 *   above and grows a trailing close (✕) button to dismiss everything
 *   back to snap 0.
 *
 * POI data flow:
 *
 * 1. On mount, fetch POIs around {@link DISCOVER_DEFAULT_CENTER}.
 * 2. On `onRegionChange` (debounced to {@link REFETCH_MS}), re-fetch around
 *    the new viewport center using {@link radiusFromBounds}.
 * 3. Both the pins on the map and the rows in the panel are clipped to
 *    {@link isInBounds} so a stale fetch never paints POIs outside the
 *    actually-visible viewport.
 *
 * @returns The Discover screen.
 */
const DiscoverScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const { height: screenH, width: screenW } = useWindowDimensions();
  // Real on-screen height of the screen root. `screenH` from
  // useWindowDimensions reports the device window, but the DiscoverScreen
  // is mounted inside the swipeable tab navigator and trimmed by the tab
  // bar — so anchoring snap 3 to `screenH - cutoutTop` left a strip of
  // map visible above the drawer. Measuring the root via `onLayout`
  // gives us the actual vertical room and lines the drawer's top edge up
  // with the top header's bottom edge precisely.
  const [rootH, setRootH] = useState(screenH);
  // Measured rendered bottom of the top grey header. We anchor snap 3 to
  // this value rather than the computed `cutoutTop` so the drawer's top
  // edge lands precisely on the topHeader's actual bottom, regardless of
  // any platform-specific layout shimmies (pixel rounding, safe-area
  // padding, etc.).
  const [topHdrBottom, setTopHdrBottom] = useState(0);
  const mapRef = useRef<MapTilerMapHandle>(null);
  const lastRegion = useRef<MapRegion | null>(null);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const sawFirstRegion = useRef(false);
  /** True once we've already flown to the user — keeps the camera from
   *  hijacking every fresh GPS reading. */
  const flewToUser = useRef(false);
  /** Latest programmatic flyTo target — when the next region-change settles
   *  on this coordinate we treat it as "we caused it" and skip the refetch.
   *  A manual pan after the fly will land off-target and clear the ref. */
  const pendingFlyTarget = useRef<{ lat: number; lng: number } | null>(null);
  const { coords: userCoords } = useUserLocation();

  const [snap, setSnap] = useState<SnapIndex>(0);
  const [chipId, setChipId] = useState<(typeof DISCOVER_CHIPS)[number]['id']>('for-you');
  const [pois, setPois] = useState<EnrichedPoi[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tooFarOut, setTooFarOut] = useState(false);
  const [viewport, setViewport] = useState<MapRegion | null>(null);

  const safeTop = insets.top > 0 ? insets.top : 12;
  const searchTopOffset = safeTop + 14;
  // Bottom edge of the floating search bar — the grey frame starts just
  // below it (top strip), the side gutters share the same top.
  const searchBarBottom = searchTopOffset + SEARCH_BAR_H;
  const cutoutTop = searchBarBottom + FRAME;
  // Available vertical room the drawer can grow into. At snap 3 the drawer
  // height equals this value, so it covers the entire map cutout.
  const usefulH = Math.max(0, rootH - cutoutTop);
  // Snap heights = exact thirds of the useful space. At snap 1 the drawer
  // top edge meets the map's bottom-screen edge, so 2/3 of the map remains
  // visible. At snap 3 the drawer fills the cutout completely.
  // Snap 3 is anchored to the MEASURED bottom edge of the top grey header
  // (`topHdrBottom`), so the drawer's top lands exactly there regardless of
  // any computed-vs-rendered drift. Snap 1 / 2 are still fractions of the
  // computed `usefulH` (which is fine for the intermediate snaps).
  const snapHeights = useMemo(
    () => ({
      0: 0,
      1: usefulH / 3,
      2: (usefulH * 2) / 3,
      3: topHdrBottom > 0 ? Math.max(0, rootH - topHdrBottom) : usefulH,
    }),
    [usefulH, rootH, topHdrBottom],
  );
  /** Drag release below this height snaps the panel closed. */
  const closeThreshold = snapHeights[1] * 0.55;

  const drawerH = useSharedValue(0);
  const startH = useSharedValue(0);
  const frameOpacity = useSharedValue(0);
  const open = snap > 0;
  const isFull = snap === 3;

  const activeChip = useMemo(
    () => DISCOVER_CHIPS.find(c => c.id === chipId) ?? DISCOVER_CHIPS[0],
    [chipId],
  );

  // Drive drawer height from snap state. The pan gesture writes to drawerH
  // imperatively; on release it commits a snap state change which re-triggers
  // this effect and timing-snaps to the canonical value.
  useEffect(() => {
    drawerH.value = withTiming(snapHeights[snap], {
      duration: DRAWER_SNAP,
      easing: EASE_OUT,
    });
  }, [snap, snapHeights, drawerH]);

  // Fade the surrounding grey frame in/out in lockstep with the open state.
  useEffect(() => {
    frameOpacity.value = withTiming(open ? 1 : 0, {
      duration: FRAME_DURATION,
      easing: EASE_OUT,
    });
  }, [open, frameOpacity]);

  const drawerStyle = useAnimatedStyle(() => ({
    height: drawerH.value,
  }));

  // Static pieces of the grey card — only their opacity moves. The top
  // header + side gutters extend from y=0 to the screen bottom so the three
  // pieces stay welded into one continuous grey shape that wraps around the
  // map cutout.
  const staticFrameStyle = useAnimatedStyle(() => ({
    opacity: frameOpacity.value,
  }));

  // The four inner corners of the cutout are smoothed by SVG fillets — the
  // small wedge between the L's apex and the arc that we want filled with
  // the same grey as the frame. The bottom two fillets' apex sits on the
  // drawer's leading edge, so their `d` string is recomputed on the UI
  // thread from `drawerH` each frame via `useAnimatedProps`.
  // The bottom fillets live in their own mini-SVG wrapped in an
  // Animated.View pinned with `bottom: drawerH.value`. The wrapper has the
  // exact same anchor as the earlier View-based arc, so the apex sits on
  // the drawer's leading edge regardless of safe-areas / tab-bar height.
  // The paths' coords are SVG-local: the apex sits at y=CUTOUT_R (the
  // wrapper's bottom), the arc tangent on the gutter at y=0 (the wrapper's
  // top — exactly CUTOUT_R above the drawer top).
  const bottomWrapStyle = useAnimatedStyle(() => ({
    bottom: drawerH.value,
    opacity: frameOpacity.value,
  }));

  /**
   * Issues the `/pois/search` request against the public API.
   *
   * Older in-flight requests are aborted before a new one starts so a slow
   * earlier response can't overwrite a fresher one. Only HTTP status +
   * message is logged: axios attaches the request config (with the
   * `X-API-Key` header) on every rejection, so logging the raw error would
   * leak credentials.
   *
   * @param lat - Center latitude (degrees).
   * @param lng - Center longitude (degrees).
   * @param radius - Radius in metres.
   * @param types - Optional POI type filter from the active chip.
   */
  const loadPois = useCallback(
    async (
      lat: number,
      lng: number,
      radius: number,
      types: (typeof activeChip)['types'],
    ): Promise<void> => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;

      setLoading(true);
      setErrorMessage(null);
      const startedAt = Date.now();
      // Log the request so a "0 results" hit can be reproduced from the
      // params shown in Metro. No API key here — strictly the search inputs.
      // eslint-disable-next-line no-console
      console.log(
        '[Discover POI] request',
        JSON.stringify({
          lat: +lat.toFixed(6),
          lng: +lng.toFixed(6),
          radius,
          limit: FETCH_LIMIT,
          types: types ?? null,
        }),
      );
      try {
        const result = await searchPois(
          { lat, lng, radius, limit: FETCH_LIMIT, types },
          controller.signal,
        );
        if (controller.signal.aborted) {return;}
        const ranked = [...result.results].sort(
          (a, b) => (b.score ?? SCORE_FALLBACK) - (a.score ?? SCORE_FALLBACK),
        );
        const elapsed = Date.now() - startedAt;
        const tag = ranked.length === 0 ? '[Discover POI] EMPTY' : '[Discover POI] ok';
        // eslint-disable-next-line no-console
        console.log(
          tag,
          JSON.stringify({
            total: result.total,
            returned: ranked.length,
            ms: elapsed,
            lat: +lat.toFixed(6),
            lng: +lng.toFixed(6),
            radius,
            types: types ?? null,
          }),
        );
        setPois(ranked);
      } catch (err: unknown) {
        if (controller.signal.aborted) {return;}
        const status =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;
        const message =
          err instanceof Error ? err.message : 'Could not reach the POI API';
        console.warn(
          '[Discover] /pois/search failed',
          status ?? 'no-response',
          message,
        );
        setErrorMessage(message);
      } finally {
        if (inflight.current === controller) {inflight.current = null;}
        if (!controller.signal.aborted) {setLoading(false);}
      }
    },
    [],
  );

  const scheduleRefetch = useCallback(
    (region: MapRegion) => {
      if (refetchTimer.current) {clearTimeout(refetchTimer.current);}
      const farOut = isZoomedTooFarOut(
        region.neLat,
        region.neLng,
        region.swLat,
        region.swLng,
      );
      setTooFarOut(farOut);
      if (farOut) {
        setPois([]);
        setLoading(false);
        return;
      }
      refetchTimer.current = setTimeout(() => {
        const radius = radiusFromBounds(
          region.neLat,
          region.neLng,
          region.swLat,
          region.swLng,
        );
        loadPois(region.centerLat, region.centerLng, radius, activeChip.types);
      }, REFETCH_MS);
    },
    [loadPois, activeChip],
  );

  // Cold-boot fetch around the default center — only fires before the first
  // region-change so the very first onRegionDidChange takes over once the
  // camera has settled.
  useEffect(() => {
    if (sawFirstRegion.current) {return;}
    loadPois(
      DISCOVER_DEFAULT_CENTER.lat,
      DISCOVER_DEFAULT_CENTER.lng,
      COLD_BOOT_RADIUS_M,
      activeChip.types,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPois]);

  // Re-fetch when the user changes the filter chip without moving the map.
  useEffect(() => {
    if (!lastRegion.current) {return;}
    scheduleRefetch(lastRegion.current);
    return () => {
      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current);
        refetchTimer.current = null;
      }
    };
  }, [activeChip, scheduleRefetch]);

  useEffect(() => {
    return () => {
      if (refetchTimer.current) {clearTimeout(refetchTimer.current);}
      inflight.current?.abort();
    };
  }, []);

  // First-fix fly: when the device's location resolves, recenter the camera
  // on the user. Only runs once per mount; subsequent GPS pings won't fight
  // the user's own map gestures.
  useEffect(() => {
    if (!userCoords || flewToUser.current) {return;}
    flewToUser.current = true;
    mapRef.current?.flyTo(userCoords.lat, userCoords.lng, USER_FLY_ZOOM);
  }, [userCoords]);

  const handleRegionChange = useCallback(
    (region: MapRegion) => {
      sawFirstRegion.current = true;
      lastRegion.current = region;
      setViewport(region);

      // Bail when the screen isn't the active route — react-native-screens
      // resizes the map view during the push animation toward PoiDetail and
      // that synthetic resize would otherwise be treated as a real gesture
      // and trigger a refetch right before the user gets to the detail page.
      if (!isFocused) {return;}

      // Suppress the refetch if this region-change is the settling event of a
      // programmatic flyTo we just issued (zoom button on a row). Comparing
      // the settled center to the requested target lets us tell apart "we
      // flew here" from "the user panned right after we flew".
      const target = pendingFlyTarget.current;
      if (target) {
        const dLat = Math.abs(region.centerLat - target.lat);
        const dLng = Math.abs(region.centerLng - target.lng);
        pendingFlyTarget.current = null;
        if (dLat < 0.0005 && dLng < 0.0005) {return;}
      }

      scheduleRefetch(region);
    },
    [isFocused, scheduleRefetch],
  );

  // Default open height is the 2/3 snap — the map still has 1/3 of the
  // viewport visible above the drawer, and the user can drag up to snap 3
  // to extend the drawer right under the search bar.
  const handleOpen = useCallback(() => setSnap(2), []);
  const handleClose = useCallback(() => setSnap(0), []);

  const handlePoiPress = useCallback(
    (poi: EnrichedPoi) => {
      const sources = buildSourceLinks(poi);
      navigation.navigate('PoiDetail', {
        name: poi.name,
        type: poi.type,
        lat: poi.coords?.lat,
        lng: poi.coords?.lng,
        description: poi.description?.slice(0, DESCRIPTION_MAX_CHARS),
        sources: sources.length > 0 ? sources : undefined,
        wikidataId: extractWikidataId(poi),
      });
    },
    [navigation],
  );

  const handleZoomToPoi = useCallback((poi: EnrichedPoi) => {
    if (!poi.coords) {return;}
    // Mark the upcoming region-change as caused by us so the API isn't
    // re-queried — the user already chose the place they want to look at.
    pendingFlyTarget.current = { lat: poi.coords.lat, lng: poi.coords.lng };
    mapRef.current?.flyTo(poi.coords.lat, poi.coords.lng, 17);
  }, []);

  // Drag handle: drag up = expand, drag down past closeThreshold = close.
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          startH.value = drawerH.value;
        })
        .onUpdate(e => {
          const next = startH.value - e.translationY;
          drawerH.value = Math.max(0, Math.min(snapHeights[3], next));
        })
        .onEnd(e => {
          const momentum = -e.velocityY * SNAP_VELOCITY_BIAS;
          if (drawerH.value < closeThreshold && momentum <= 0) {
            drawerH.value = withTiming(
              0,
              { duration: 200, easing: EASE_OUT },
              () => {
                runOnJS(setSnap)(0);
              },
            );
            return;
          }
          const target = pickSnap(snapHeights, drawerH.value, momentum);
          drawerH.value = withSpring(snapHeights[target], {
            damping: 22,
            stiffness: 180,
          });
          runOnJS(setSnap)(target);
        }),
    [drawerH, startH, snapHeights, closeThreshold],
  );

  const visiblePois = useMemo(() => {
    if (!viewport) {return pois;}
    return pois.filter(
      p =>
        p.coords &&
        isInBounds(
          p.coords.lat,
          p.coords.lng,
          viewport.neLat,
          viewport.neLng,
          viewport.swLat,
          viewport.swLng,
        ),
    );
  }, [pois, viewport]);

  const markers = useMemo<MapTilerMarker[]>(
    () =>
      visiblePois
        .filter(p => p.coords && !p.coords.approximate)
        .map(p => ({
          id: p.id,
          lat: p.coords!.lat,
          lng: p.coords!.lng,
          glyph: glyphForPoiType(p.type),
          onPress: () => handlePoiPress(p),
        })),
    [visiblePois, handlePoiPress],
  );

  const headerMeta = tooFarOut
    ? 'Zoom in to see places'
    : errorMessage
      ? errorMessage
      : loading
        ? 'Looking around you…'
        : `${visiblePois.length} places in this area`;
  const emptyMessage = tooFarOut
    ? 'You\'re too zoomed out — pinch in and we\'ll surface places around you.'
    : 'No place matches this view yet — try a different filter or move the map.';

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      onLayout={e => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== rootH) {setRootH(h);}
      }}>
      <View style={StyleSheet.absoluteFill}>
        <MapTilerMap
          ref={mapRef}
          center={DISCOVER_DEFAULT_CENTER}
          zoom={DISCOVER_DEFAULT_ZOOM}
          markers={markers}
          onRegionChange={handleRegionChange}
          showUserLocation
        />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sideFrameLeft,
          { backgroundColor: theme.colors.surface },
          staticFrameStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sideFrameRight,
          { backgroundColor: theme.colors.surface },
          staticFrameStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        onLayout={e => {
          const { y, height } = e.nativeEvent.layout;
          const bottom = y + height;
          if (bottom > 0 && bottom !== topHdrBottom) {setTopHdrBottom(bottom);}
        }}
        style={[
          styles.topHeader,
          {
            height: cutoutTop,
            backgroundColor: theme.colors.surface,
          },
          staticFrameStyle,
        ]}
      />

      {/*
        Top fillets — two grey wedges that smooth the inside corners where
        the topHeader meets the side gutters. Static, fades with the rest
        of the frame.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.topFilletWrap,
          { top: cutoutTop, width: screenW },
          staticFrameStyle,
        ]}>
        <Svg width={screenW} height={CUTOUT_R}>
          <Path
            d={`M ${FRAME} 0 H ${FRAME + CUTOUT_R} A ${CUTOUT_R} ${CUTOUT_R} 0 0 0 ${FRAME} ${CUTOUT_R} Z`}
            fill={theme.colors.surface}
          />
          <Path
            d={`M ${screenW - FRAME} 0 H ${screenW - FRAME - CUTOUT_R} A ${CUTOUT_R} ${CUTOUT_R} 0 0 1 ${screenW - FRAME} ${CUTOUT_R} Z`}
            fill={theme.colors.surface}
          />
        </Svg>
      </Animated.View>

      {/*
        Bottom fillets — same shape mirrored. The wrapper is pinned with
        `bottom: drawerH` so the mini-SVG's bottom edge sits exactly on the
        drawer's leading edge, exactly as the earlier View-based arc did.
       */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.bottomFilletWrap,
          { width: screenW },
          bottomWrapStyle,
        ]}>
        <Svg width={screenW} height={CUTOUT_R}>
          <Path
            d={`M ${FRAME} ${CUTOUT_R} H ${FRAME + CUTOUT_R} A ${CUTOUT_R} ${CUTOUT_R} 0 0 1 ${FRAME} 0 Z`}
            fill={theme.colors.surface}
          />
          <Path
            d={`M ${screenW - FRAME} ${CUTOUT_R} H ${screenW - FRAME - CUTOUT_R} A ${CUTOUT_R} ${CUTOUT_R} 0 0 0 ${screenW - FRAME} 0 Z`}
            fill={theme.colors.surface}
          />
        </Svg>
      </Animated.View>

      <View
        pointerEvents="box-none"
        style={[styles.floatingSearch, { top: searchTopOffset }]}>
        <Search
          placeholder="Discover new places"
          readOnly
          onPress={open ? handleClose : handleOpen}
          leading={
            open ? (
              <ArrowLeft size={19} color={theme.colors.ink} />
            ) : (
              <SearchIcon size={19} color={theme.colors.ink} />
            )
          }
          trailing={
            isFull ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close results"
                onPress={handleClose}
                hitSlop={8}
                style={[
                  styles.searchClose,
                  { backgroundColor: theme.colors.emerald },
                ]}>
                <XIcon size={14} color={theme.colors.onEmerald} />
              </Pressable>
            ) : undefined
          }
        />
      </View>

      {!open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open results — ${headerMeta}`}
          onPress={handleOpen}
          style={[
            styles.hint,
            { backgroundColor: theme.colors.surface, borderRadius: theme.radii.pill },
            theme.shadows.e2,
          ]}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.emerald} />
          ) : (
            <MapPinIcon size={14} color={theme.colors.emerald} />
          )}
          <Text
            numberOfLines={1}
            style={[
              styles.hintLabel,
              { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.display },
            ]}>
            {headerMeta}
          </Text>
        </Pressable>
      ) : null}

      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[
          styles.drawer,
          { backgroundColor: theme.colors.surface },
          drawerStyle,
        ]}>
        <GestureDetector gesture={dragGesture}>
          <View
            accessibilityRole="adjustable"
            accessibilityLabel="Drag to resize results"
            style={styles.handleHit}>
            <View style={[styles.handle, { backgroundColor: theme.colors.mute2 }]} />
          </View>
        </GestureDetector>

        <View style={styles.drawerHeader}>
          <View style={styles.drawerTitles}>
            <Text
              style={[
                styles.h2,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              In this area
              <TitleDot />
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.areaMeta,
                {
                  color: errorMessage ? theme.colors.ink2 : theme.colors.mute,
                  fontFamily: theme.fonts.mono,
                },
              ]}>
              {headerMeta}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator color={theme.colors.emerald} />
          ) : (
            <Tag variant="emerald" dot pulse>
              Live
            </Tag>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {DISCOVER_CHIPS.map(c => (
            <Chip
              key={c.id}
              label={c.label}
              active={chipId === c.id}
              onPress={() => setChipId(c.id)}
            />
          ))}
        </ScrollView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: TABBAR_RESERVED + 20 },
          ]}>
          {visiblePois.map(poi => (
            <PoiListRow
              key={poi.id}
              name={poi.name}
              meta={formatPoiMeta(poi, activeChip.label)}
              type={poi.type}
              distanceMeters={poi.distance}
              onPress={() => handlePoiPress(poi)}
              onZoomPress={poi.coords ? () => handleZoomToPoi(poi) : undefined}
            />
          ))}
          {!loading && visiblePois.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.mute, fontFamily: theme.fonts.mono },
                ]}>
                {emptyMessage}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: FRAME,
    right: FRAME,
  },
  sideFrameLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: FRAME,
  },
  sideFrameRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: FRAME,
  },
  topFilletWrap: {
    position: 'absolute',
    left: 0,
    height: CUTOUT_R,
  },
  bottomFilletWrap: {
    position: 'absolute',
    left: 0,
    height: CUTOUT_R,
  },
  floatingSearch: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: TABBAR_RESERVED + 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '80%',
  },
  hintLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  drawer: {
    position: 'absolute',
    left: FRAME,
    right: FRAME,
    bottom: 0,
    overflow: 'hidden',
  },
  handleHit: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
  },
  drawerHeader: {
    paddingHorizontal: 22,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  drawerTitles: {
    flex: 1,
    minWidth: 0,
  },
  h2: {
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: -0.44,
  },
  areaMeta: {
    fontSize: 12.5,
    marginTop: 4,
    letterSpacing: 0.05,
  },
  chips: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    gap: 8,
  },
  list: {
    paddingHorizontal: 8,
  },
  emptyState: {
    paddingHorizontal: 18,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  searchClose: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DiscoverScreen;
