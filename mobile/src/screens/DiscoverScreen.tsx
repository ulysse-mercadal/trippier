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
} from 'react-native';
import { Marker, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useTheme } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import FilterBar, { FilterBarRef } from '../components/FilterBar';
import PoiDetailView from '../components/PoiDetailView';
import PoiListView from '../components/PoiListView';
import client from '../api/client';
import { POI } from '../lib/types';
import { LayoutInfo } from '../components/PoiCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedGestureHandler,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedReaction,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
    const { colors } = useTheme();
    const mapRef = useRef<any>(null);
    const listRef = useRef<any>(null);
    const filterBarRef = useRef<FilterBarRef>(null);

    const [nearbyPois, setNearbyPois] = useState<POI[]>([]);

  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [focusedPoi, setFocusedPoi] = useState<POI | null>(null);
  const [selectedPoiLayout, setSelectedPoiLayout] = useState<LayoutInfo | undefined>(undefined);
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 48.8584,
    longitude: 2.2945,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

  const fetchNearby = useCallback(async (lat: number, lng: number, radius?: number) => {
    try {
      setLoading(true);
      const response = await client.get('/discover/nearby', {
        params: { lat, lng, radius: radius || 5 },
      });
      setNearbyPois(response.data);
    } catch (error) {
      console.error('Failed to fetch nearby POIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchNearby(currentRegion.latitude, currentRegion.longitude);
  }, [currentRegion.latitude, currentRegion.longitude, fetchNearby, requestLocationPermission]);

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
  }, []);
  useAnimatedReaction(
    () => drawerTranslateY.value,
    (currentY, previousY) => {
      if (currentY >= SNAP_BOTTOM - 5 && (previousY === null || previousY < SNAP_BOTTOM - 5)) {
        runOnJS(handleDrawerCollapsed)();
      }
    },
  );

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: drawerTranslateY.value }],
    };
  });

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
    async (lat: number, lng: number, q: string) => {
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        setLoading(true);
        const response = await client.get('/discover/nearby', {
          params: { lat, lng, radius: 50, q },
        });
        setSearchResults(response.data);
        runOnJS(snapTo)(SNAP_MEDIUM);
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
      fetchSearch(currentRegion.latitude, currentRegion.longitude, text);
    },
    [currentRegion, fetchSearch],
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setFocusedPoi(null);
    snapTo(SNAP_BOTTOM);
  }, [snapTo, SNAP_BOTTOM]);

  const handleFocus = useCallback(() => {
    snapTo(SNAP_MEDIUM);
  }, [snapTo, SNAP_MEDIUM]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setCurrentRegion(region);
      const calculatedRadius = Math.min(Math.max(region.latitudeDelta * 111, 2), 50);
      fetchNearby(region.latitude, region.longitude, calculatedRadius);
    },
    [fetchNearby],
  );

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
      if (listRef.current && listRef.current.scrollTo) {
        listRef.current.scrollTo({ y: 0, animated: true });
      }
      runOnJS(snapTo)(SNAP_SMALL);
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    },
    [snapTo, SNAP_SMALL],
  );

  const handlePoiSelect = useCallback(
    async (poi: POI, layout?: LayoutInfo) => {
      setSelectedPoi(poi);
      setFocusedPoi(poi);
      setSelectedPoiLayout(layout);
      handleZoomToPoi(poi);
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
    [handleZoomToPoi],
  );

  const mapStyle = useMemo(() => {
    return [
      {
        elementType: 'geometry',
        stylers: [{ color: '#212121' }],
      },
      {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }],
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#212121' }],
      },
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#757575' }],
      },
      {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [{ color: '#2c2c2c' }],
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#000000' }],
      },
      {
        featureType: 'poi',
        stylers: [{ visibility: 'on' }],
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'on' }],
      },
    ];
  }, []);

  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
        onPress={onPress}>
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>{points}</Text>
        </View>
      </Marker>
    );
  };

  const handleUserLocationChange = useCallback(
    (event: any) => {
      if (!hasCenteredOnUser && event.nativeEvent.coordinate) {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setHasCenteredOnUser(true);
        const newRegion = {
          ...currentRegion,
          latitude,
          longitude,
        };
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        fetchNearby(latitude, longitude);
      }
    },
    [hasCenteredOnUser, currentRegion, fetchNearby],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ClusteredMapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={() => setFocusedPoi(null)}
        renderCluster={renderCluster}
        showsUserLocation={true}
        showsCompass={false}
        showsMyLocationButton={false}
        onUserLocationChange={handleUserLocationChange}>
        {focusedPoi && (
          <Marker
            coordinate={{
              latitude:
                typeof focusedPoi.lat === 'string' ? parseFloat(focusedPoi.lat) : focusedPoi.lat,
              longitude:
                typeof focusedPoi.lng === 'string' ? parseFloat(focusedPoi.lng) : focusedPoi.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.selectedMarker} />
          </Marker>
        )}
      </ClusteredMapView>

      {!selectedPoi && (
        <FilterBar
          ref={filterBarRef}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onClear={handleClear}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}

      <Animated.View style={[styles.drawer, drawerStyle]}>
        <PanGestureHandler onGestureEvent={headerGestureHandler}>
          <Animated.View style={styles.gestureHeader}>
            <View style={styles.drawerHandle} />
          </Animated.View>
        </PanGestureHandler>
        <Animated.View style={{ flex: 1 }}>
          <PoiListView
            ref={listRef}
            scrollHandler={scrollHandler}
            searchQuery={searchQuery}
            searchResults={orderedSearchResults}
            nearbyPois={orderedNearbyPois}
            loading={loading}
            onPoiSelect={handlePoiSelect}
            onZoom={handleZoomToPoi}
            highlightedPoiId={focusedPoi?.place_id}
          />
        </Animated.View>
      </Animated.View>
      {selectedPoi && (
        <PoiDetailView
          selectedPoi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          loading={loading}
          initialLayout={selectedPoiLayout}
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
  selectedMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
  },
  clusterContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clusterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1005,
    paddingBottom: 50,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  gestureHeader: {
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
