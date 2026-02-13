// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  BackHandler,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import {
  useSharedValue,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { MAPTILER_API_KEY, MAPTILER_MAP_ID } from '@env';

import FilterBar, { FilterBarRef } from '../components/FilterBar';
import PoiDetailView from '../components/PoiDetailView';
import { MapMarkers } from '../components/Discover/MapMarkers';
import { BottomDrawer } from '../components/Discover/BottomDrawer';

import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { POI, Map as MapType } from '../lib/types';
import { LayoutInfo } from '../components/PoiCard';

// Initialize MapLibre
const cleanApiKey = (MAPTILER_API_KEY || '').replace(/^["']|["']$/g, '');
MapLibreGL.setAccessToken(cleanApiKey);

if (Platform.OS === 'android') {
  MapLibreGL.setConnected(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { token } = useAuth();
  const mapRef = useRef<any>(null);
  const [mapStyle, setMapStyle] = useState<any>(null);

  useEffect(() => {
    const mapId = (MAPTILER_MAP_ID || 'dataviz-dark').replace(/^["']|["']$/g, '');
    const apiKey = (MAPTILER_API_KEY || '').replace(/^["']|["']$/g, '');

    async function fetchStyle() {
      if (!apiKey) {
        return;
      }
      const url = `https://api.maptiler.com/maps/${mapId}/style.json?key=${apiKey}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Style fetch failed: ${res.status}`);
        }
        const json = await res.json();
        setMapStyle(json);
      } catch (err) {
        console.error('FETCH_STYLE_ERROR:', err);
      }
    }
    if (apiKey) {
      MapLibreGL.setAccessToken(apiKey);
      fetchStyle();
    }
  }, []);

  const listRef = useRef<any>(null);
  const filterBarRef = useRef<FilterBarRef>(null);
  const [nearbyPois, setNearbyPois] = useState<POI[]>([]);
  const [maps, setMaps] = useState<MapType[]>([]);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [focusedPoi, setFocusedPoi] = useState<POI | null>(null);
  const [selectedPoiLayout, setSelectedPoiLayout] = useState<LayoutInfo | undefined>(undefined);
  const hasCenteredRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([2.2945, 48.8584]);
  const [viewMode, setViewMode] = useState<'search' | 'maps'>('search');
  const [weights, setWeights] = useState('culture:5,nature:5,food:5');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);

  const fetchMaps = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await client.get('/maps');
      setMaps(response.data);
    } catch (error) {
      console.error('Failed to fetch maps:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchMaps();
  }, [fetchMaps]);

  const handleDeleteMap = async (id: number) => {
    if (!token) {
      return;
    }
    try {
      await client.delete(`/maps/${id}`);
      fetchMaps();
    } catch (error) {
      console.error('Failed to delete map:', error);
      Alert.alert('Error', 'Failed to delete map.');
    }
  };

  const handleUpdateMap = async (id: number, data: Partial<MapType>) => {
    if (!token) {
      return;
    }
    try {
      await client.patch(`/maps/${id}`, data);
      fetchMaps();
    } catch (error) {
      console.error('Failed to update map:', error);
      Alert.alert('Error', 'Failed to update map.');
    }
  };

  const visibleMapPois = useMemo(() => {
    const poisMap = new Map<string, { poi: POI; mapIcon: string }>();
    maps.forEach(map => {
      if (map.isVisible && map.pois) {
        map.pois.forEach(p => {
          const id = p.place_id;
          if (id && !poisMap.has(id)) {
            poisMap.set(id, { poi: p, mapIcon: map.icon || '🌍' });
          }
        });
      }
    });
    return Array.from(poisMap.values());
  }, [maps]);

  const SNAP_TOP = 0;
  const SNAP_MEDIUM = SCREEN_HEIGHT * 0.33;
  const SNAP_SMALL = SCREEN_HEIGHT * 0.66;
  const SNAP_BOTTOM = SCREEN_HEIGHT;
  const drawerTranslateY = useSharedValue(SNAP_BOTTOM);
  const scrollY = useSharedValue(0);
  const handleBlur = useCallback(() => {}, []);

  const snapTo = useCallback(
    (point: number) => {
      drawerTranslateY.value = withSpring(point, { damping: 15 });
    },
    [drawerTranslateY],
  );

  const fetchNearby = useCallback(
    async (lat: number, lng: number, currentWeights: string, radius?: number) => {
      try {
        setLoading(true);
        const response = await client.get('/discover/nearby', {
          params: { lat, lng, radius: radius || 5, weights: currentWeights },
        });
        setNearbyPois(response.data);
      } catch (error) {
        console.error('Failed to fetch nearby POIs:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Permission',
          message: 'Trippier needs access to your location to show nearby places.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    const backAction = () => {
      if (selectedPoi) {
        setSelectedPoi(null);
        return true;
      }
      if (drawerTranslateY.value < SNAP_BOTTOM - 10) {
        snapTo(SNAP_BOTTOM);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [selectedPoi, drawerTranslateY, snapTo, SNAP_BOTTOM]);

  const handleDrawerCollapsed = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    filterBarRef.current?.blur();
    setViewMode('search');
  }, []);

  useAnimatedReaction(
    () => drawerTranslateY.value,
    (currentY, previousY) => {
      if (currentY >= SNAP_BOTTOM - 5 && (previousY === null || previousY < SNAP_BOTTOM - 5)) {
        runOnJS(handleDrawerCollapsed)();
      }
    },
  );

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerGestureHandler = useAnimatedGestureHandler({
    onStart: (_: any, ctx: any) => {
      ctx.startY = drawerTranslateY.value;
    },
    onActive: (event, ctx) => {
      let nextY = ctx.startY + event.translationY;
      if (nextY < SNAP_TOP - 50) {
        nextY = SNAP_TOP - 50;
      }
      drawerTranslateY.value = nextY;
    },
    onEnd: event => {
      const velocity = event.velocityY;
      const currentY = drawerTranslateY.value;
      let target = SNAP_MEDIUM;
      const points = [SNAP_TOP, SNAP_MEDIUM, SNAP_SMALL, SNAP_BOTTOM];
      if (velocity < -500) {
        if (currentY > SNAP_SMALL) {
          target = SNAP_SMALL;
        } else if (currentY > SNAP_MEDIUM) {
          target = SNAP_MEDIUM;
        } else {
          target = SNAP_TOP;
        }
      } else if (velocity > 500) {
        if (currentY < SNAP_MEDIUM) {
          target = SNAP_MEDIUM;
        } else if (currentY < SNAP_SMALL) {
          target = SNAP_SMALL;
        } else {
          target = SNAP_BOTTOM;
        }
      } else {
        target = points.reduce((prev, curr) =>
          Math.abs(curr - currentY) < Math.abs(prev - currentY) ? curr : prev,
        );
      }
      drawerTranslateY.value = withSpring(target, { damping: 15, stiffness: 90 });
    },
  });

  const fetchSearch = useCallback(
    async (lat: number, lng: number, q: string, currentWeights: string) => {
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        setLoading(true);
        const response = await client.get('/discover/nearby', {
          params: { lat, lng, radius: 50, q, weights: currentWeights },
        });
        setSearchResults(response.data);
        snapTo(SNAP_MEDIUM);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setLoading(false);
      }
    },
    [snapTo, SNAP_MEDIUM],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      fetchSearch(centerCoordinate[1], centerCoordinate[0], text, weights);
    },
    [centerCoordinate, fetchSearch, weights],
  );

  const handleWeightsChange = useCallback(
    (newWeights: string) => {
      setWeights(newWeights);
      fetchNearby(centerCoordinate[1], centerCoordinate[0], newWeights);
      if (searchQuery) {
        fetchSearch(centerCoordinate[1], centerCoordinate[0], searchQuery, newWeights);
      }
    },
    [centerCoordinate, fetchNearby, fetchSearch, searchQuery],
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setFocusedPoi(null);
    snapTo(SNAP_BOTTOM);
  }, [snapTo, SNAP_BOTTOM]);

  const handleFocus = useCallback(() => {
    setViewMode('search');
    snapTo(SNAP_MEDIUM);
  }, [snapTo, SNAP_MEDIUM]);

  const handleRegionChangeComplete = useCallback((feature: any) => {
    const coords = feature.geometry.coordinates as [number, number];
    setCenterCoordinate(coords);
  }, []);

  const orderedSearchResults = useMemo(() => {
    if (!focusedPoi) {
      return searchResults;
    }
    const exists = searchResults.some(p => p.place_id === focusedPoi.place_id);
    if (!exists) {
      return searchResults;
    }
    return [focusedPoi, ...searchResults.filter(p => p.place_id !== focusedPoi.place_id)];
  }, [searchResults, focusedPoi]);

  const orderedNearbyPois = useMemo(() => {
    if (!focusedPoi) {
      return nearbyPois;
    }
    return [focusedPoi, ...nearbyPois.filter(p => p.place_id !== focusedPoi.place_id)];
  }, [nearbyPois, focusedPoi]);

  const handleZoomToPoi = useCallback(
    (poi: POI) => {
      const lat = typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat;
      const lng = typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng;
      setFocusedPoi(poi);
      snapTo(SNAP_SMALL);
      if (listRef.current && listRef.current.scrollTo) {
        listRef.current.scrollTo({ y: 0, animated: true });
      }
      mapRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        zoomLevel: 16,
        animationDuration: 1000,
      });
    },
    [snapTo, SNAP_SMALL],
  );

  const handlePoiSelect = useCallback(
    async (poi: POI, layout?: LayoutInfo) => {
      setSelectedPoi(poi);
      setFocusedPoi(poi);
      setSelectedPoiLayout(layout);
      try {
        setLoading(true);
        const response = await client.get('/discover/details', {
          params: {
            place_id: poi.place_id,
            name: poi.name,
            lat: poi.lat,
            lng: poi.lng,
          },
        });
        setSelectedPoi(prev =>
          prev && prev.place_id === poi.place_id
            ? {
                ...prev,
                description: response.data.description,
                wikipediaUrl: response.data.wikipediaUrl,
                wikivoyageUrl: response.data.wikivoyageUrl,
                officialWebsite: response.data.website,
                phoneNumber: response.data.phoneNumber,
              }
            : prev,
        );
      } catch (error) {
        console.error('Failed to fetch POI details:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleUserLocationChange = useCallback(
    (location: any) => {
      if (!hasCenteredRef.current && location.coords) {
        const { latitude, longitude } = location.coords;
        hasCenteredRef.current = true;
        setCenterCoordinate([longitude, latitude]);
        mapRef.current?.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 14,
          animationDuration: 1000,
        });
        fetchNearby(latitude, longitude, weights);
      }
    },
    [fetchNearby, weights],
  );

  const handleMyMapsClick = useCallback(() => {
    setViewMode('maps');
    setIsExpanded(true);
    snapTo(SNAP_MEDIUM);
  }, [snapTo, SNAP_MEDIUM]);

  return (
    <View style={[styles.container, { backgroundColor: '#212121' }]}>
      {mapStyle ? (
        <MapLibreGL.MapView
          style={styles.map}
          mapStyle={mapStyle}
          logoEnabled={false}
          attributionEnabled={true}
          onRegionDidChange={handleRegionChangeComplete}
          onPress={() => {
            setFocusedPoi(null);
            setIsExpanded(false);
          }}>
          <MapLibreGL.Camera
            ref={mapRef}
            defaultSettings={{
              zoomLevel: 14,
              centerCoordinate: [2.2945, 48.8584],
            }}
          />
          <MapLibreGL.UserLocation
            visible={true}
            onUpdate={handleUserLocationChange}
            followUserMode="none"
          />
          <MapMarkers
            visibleMapPois={visibleMapPois}
            focusedPoi={focusedPoi}
            onPoiSelect={handlePoiSelect}
          />
        </MapLibreGL.MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text }}>Loading Map...</Text>
        </View>
      )}
      {!selectedPoi && (
        <FilterBar
          ref={filterBarRef}
          isExpanded={isExpanded}
          onToggle={setIsExpanded}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMyMapsClick={handleMyMapsClick}
          onProfileClick={() => {
            // @ts-ignore
            navigation.navigate('Connect');
          }}
        />
      )}
      <BottomDrawer
        drawerTranslateY={drawerTranslateY}
        headerGestureHandler={headerGestureHandler}
        listRef={listRef}
        scrollHandler={scrollHandler}
        searchQuery={searchQuery}
        searchResults={orderedSearchResults}
        nearbyPois={orderedNearbyPois}
        loading={loading}
        onPoiSelect={handlePoiSelect}
        onZoom={handleZoomToPoi}
        focusedPoi={focusedPoi}
        viewMode={viewMode}
        setViewMode={setViewMode}
        maps={maps}
        onMapsRefresh={fetchMaps}
        onDeleteMap={handleDeleteMap}
        onUpdateMap={handleUpdateMap}
        onMapCreated={fetchMaps}
        weights={weights}
        onWeightsChange={handleWeightsChange}
        selectedMapId={selectedMapId}
        onSelectedMapIdChange={setSelectedMapId}
      />
      {selectedPoi && (
        <PoiDetailView
          selectedPoi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          loading={loading}
          initialLayout={selectedPoiLayout}
          maps={maps}
          onMapsChange={fetchMaps}
          onMapClick={mapId => {
            setSelectedPoi(null);
            setSelectedMapId(mapId);
            setViewMode('maps');
            snapTo(SNAP_MEDIUM);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
