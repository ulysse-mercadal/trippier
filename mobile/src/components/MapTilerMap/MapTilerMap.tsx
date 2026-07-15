// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import {
  Camera,
  CircleLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
  UserLocation,
  type CameraRef,
  type MapViewRef,
} from '@maplibre/maplibre-react-native';
import type GeoJSON from 'geojson';
import { MAPTILER_API_KEY, MAPTILER_MAP_ID } from '@env';

/**
 * Visible bounds of the map, as emitted by `onRegionChange`.
 * Tuple form is `[northEast, southWest]` to match the GeoJSON `BBox`-ish
 * convention used by `@maplibre/maplibre-react-native`.
 */
export interface MapRegion {
  centerLat: number;
  centerLng: number;
  zoom: number;
  neLat: number;
  neLng: number;
  swLat: number;
  swLng: number;
}

export interface MapTilerMarker {
  id: string;
  lat: number;
  lng: number;
  /**
   * Optional single-character glyph rendered on top of the pin core to
   * signal the POI category at a glance (e.g. `★` for sights, `F` for food).
   * Kept to one character so the symbol layer stays tight inside the 12 px
   * core — anything longer reads as text rather than icon.
   */
  glyph?: string;
  onPress?: () => void;
}

export interface MapTilerMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapTilerMarker[];
  onRegionChange?: (region: MapRegion) => void;
  /** Disable every gesture — used by the static preview in POI detail. */
  staticPreview?: boolean;
  /** Render MapLibre's native UserLocation puck (blue dot + accuracy halo). */
  showUserLocation?: boolean;
  /** Initial camera tilt in degrees (0 = top-down, 60 = strong 3D). */
  pitch?: number;
  /** When true, the camera continuously orbits the {@link center} coordinate. */
  autoRotate?: boolean;
  style?: ViewStyle;
}

export interface MapTilerMapHandle {
  /** Re-centers the camera with an animated fly-to. */
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

const PIN_SOURCE_ID = 'trp-pois';

/** Halo + core colours used by the two stacked CircleLayers. */
const PIN_CORE_COLOR = '#0c9466';
const PIN_HALO_COLOR = '#0c946633';
const PIN_BORDER_COLOR = '#ffffff';

/**
 * Builds the MapTiler style URL from the API key + map id stored in `.env`.
 *
 * MapTiler exposes one style URL per map: `…/maps/{id}/style.json?key=…`.
 * Both env vars are bundled at build time via `react-native-dotenv`.
 *
 * @returns A signed style URL ready for {@link MapView.mapStyle}.
 */
function buildStyleURL(): string {
  return `https://api.maptiler.com/maps/${MAPTILER_MAP_ID}/style.json?key=${MAPTILER_API_KEY}`;
}

/**
 * Extracts a {@link MapRegion} from a MapLibre region payload feature.
 *
 * @param feature - The GeoJSON feature emitted by MapLibre.
 * @returns A normalised region carrying both center and visible bounds.
 */
function regionFromPayload(
  feature: GeoJSON.Feature<GeoJSON.Point, { zoomLevel: number; visibleBounds: [GeoJSON.Position, GeoJSON.Position] }>,
): MapRegion {
  const [lng, lat] = feature.geometry.coordinates;
  const [ne, sw] = feature.properties.visibleBounds;
  return {
    centerLat: lat,
    centerLng: lng,
    zoom: feature.properties.zoomLevel,
    neLat: ne[1],
    neLng: ne[0],
    swLat: sw[1],
    swLng: sw[0],
  };
}

interface PinFeatureProperties {
  markerId: string;
  glyph: string;
}

/**
 * Converts a marker list to a GeoJSON `FeatureCollection` consumed by
 * {@link ShapeSource}. Rendering through a single shape source + style
 * layers (halo + core + glyph) means the native renderer keeps pins
 * anchored to the map on every gesture frame — unlike `MarkerView`, which
 * reprojects React Native overlay views and lags behind the map by one or
 * two frames.
 *
 * @param markers - The marker descriptors supplied by the caller.
 * @returns A point-only feature collection where every feature carries the
 *   marker `id` (for tap routing) and the per-type `glyph` (for the symbol
 *   layer) in its `properties`.
 */
function buildFeatureCollection(
  markers: MapTilerMarker[],
): GeoJSON.FeatureCollection<GeoJSON.Point, PinFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: markers.map(m => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: { markerId: m.id, glyph: m.glyph ?? '' },
    })),
  };
}

/**
 * Real MapTiler-backed map. Wraps `@maplibre/maplibre-react-native` so the
 * rest of the app stays decoupled from the underlying renderer.
 *
 * Markers are rendered natively via {@link ShapeSource} + two
 * {@link CircleLayer}s (halo + core) instead of `MarkerView` so they stay
 * pixel-locked to the map during pan/zoom. Taps land on the source's
 * `onPress`, which decodes the tapped feature's `markerId` to look up the
 * caller-supplied marker and fire its `onPress`.
 *
 * Imperative handle exposes `flyTo` so screens can recenter after a POI
 * selection without re-rendering the camera prop.
 *
 * @param props - {@link MapTilerMapProps}.
 * @param ref - {@link MapTilerMapHandle} for imperative control.
 * @returns A `MapView` filling the parent.
 */
const MapTilerMap = forwardRef<MapTilerMapHandle, MapTilerMapProps>(function MapTilerMap(
  {
    center,
    zoom = 13,
    markers = [],
    onRegionChange,
    staticPreview = false,
    showUserLocation = false,
    pitch = 0,
    autoRotate = false,
    style,
  },
  ref,
) {
  const mapRef = useRef<MapViewRef>(null);
  const cameraRef = useRef<CameraRef | null>(null);
  const styleURL = useMemo(() => buildStyleURL(), []);
  const featureCollection = useMemo(
    () => buildFeatureCollection(markers),
    [markers],
  );
  // Index keyed by marker id so onPress can look the marker back up in O(1).
  const markerIndex = useMemo(() => {
    const map = new Map<string, MapTilerMarker>();
    for (const m of markers) {map.set(m.id, m);}
    return map;
  }, [markers]);

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, z = zoom) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: z,
        animationDuration: 600,
        animationMode: 'flyTo',
      });
    },
  }), [zoom]);

  // Slow orbit around `center` — drives a chain of `linearTo` heading
  // animations. Each segment runs at constant angular velocity (no ease-in /
  // ease-out) and the next setCamera fires **before** the current one ends,
  // so the running animation is replaced while still moving at full speed.
  // That seamlessly hides the "stop, pause, restart" cadence an `easeTo`
  // chain would produce. Heading is never wrapped to keep MapLibre rotating
  // in a single consistent direction — passing the unbounded angle lets it
  // resolve the rotation direction itself without a backwards snap on
  // crossing 360°.
  useEffect(() => {
    if (!autoRotate) {return;}
    const SEGMENT_DEG = 90;
    const SEGMENT_MS = 6000;
    const CHAIN_AT_MS = SEGMENT_MS - 250;
    let heading = 0;
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const tick = (): void => {
      if (!mounted) {return;}
      heading += SEGMENT_DEG;
      cameraRef.current?.setCamera({
        heading,
        animationDuration: SEGMENT_MS,
        animationMode: 'linearTo',
      });
      timeoutId = setTimeout(tick, CHAIN_AT_MS);
    };
    timeoutId = setTimeout(tick, 400);
    return () => {
      mounted = false;
      if (timeoutId) {clearTimeout(timeoutId);}
    };
  }, [autoRotate]);

  const handlePinPress = (event: { features: GeoJSON.Feature[] }): void => {
    const feature = event.features[0];
    const markerId = feature?.properties?.markerId as string | undefined;
    if (!markerId) {return;}
    markerIndex.get(markerId)?.onPress?.();
  };

  return (
    <View style={[styles.root, style]}>
      <MapView
        ref={mapRef}
        style={styles.fill}
        mapStyle={styleURL}
        zoomEnabled={!staticPreview}
        scrollEnabled={!staticPreview}
        pitchEnabled={!staticPreview}
        rotateEnabled={!staticPreview}
        attributionEnabled
        attributionPosition={{ bottom: 6, right: 6 }}
        logoEnabled={false}
        compassEnabled={false}
        regionDidChangeDebounceTime={120}
        onRegionDidChange={
          onRegionChange
            ? feature => onRegionChange(regionFromPayload(feature))
            : undefined
        }>
        <Camera
          ref={(r: CameraRef | null) => {
            cameraRef.current = r;
          }}
          defaultSettings={{
            centerCoordinate: [center.lng, center.lat],
            zoomLevel: zoom,
            pitch,
          }}
        />

        {showUserLocation ? <UserLocation animated /> : null}

        {markers.length > 0 ? (
          <ShapeSource
            id={PIN_SOURCE_ID}
            shape={featureCollection}
            onPress={handlePinPress}
            hitbox={{ width: 36, height: 36 }}>
            <CircleLayer
              id="trp-poi-halo"
              style={{
                circleRadius: 11,
                circleColor: PIN_HALO_COLOR,
                circlePitchAlignment: 'map',
              }}
            />
            <CircleLayer
              id="trp-poi-core"
              style={{
                circleRadius: 7,
                circleColor: PIN_CORE_COLOR,
                circleStrokeWidth: 1.5,
                circleStrokeColor: PIN_BORDER_COLOR,
                circlePitchAlignment: 'map',
              }}
            />
            <SymbolLayer
              id="trp-poi-glyph"
              style={{
                textField: ['get', 'glyph'],
                textFont: ['Noto Sans Bold'],
                textSize: 8.5,
                textColor: PIN_BORDER_COLOR,
                textAllowOverlap: true,
                textIgnorePlacement: true,
                textAnchor: 'center',
                textOffset: [0, 0.05],
              }}
            />
          </ShapeSource>
        ) : null}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
});

export default MapTilerMap;
