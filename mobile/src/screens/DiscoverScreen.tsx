// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Marker, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useTheme } from '@react-navigation/native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import FilterBar from '../components/FilterBar';
import PoiDetailView from '../components/PoiDetailView';
import PoiListView from '../components/PoiListView';
import client from '../api/client';
import { POI } from '../lib/types';
import { LayoutInfo } from '../components/PoiCard';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);

  const [nearbyPois, setNearbyPois] = useState<POI[]>([]);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedPoiLayout, setSelectedPoiLayout] = useState<LayoutInfo | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 48.8584,
    longitude: 2.2945,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Snap points
  const SNAP_TOP = 0;
  const SNAP_HALF = SCREEN_HEIGHT * 0.33; // Top at 1/3, showing 2/3
  const SNAP_BOTTOM = SCREEN_HEIGHT;

  const drawerTranslateY = useSharedValue(SNAP_BOTTOM);

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: drawerTranslateY.value }],
    };
  });

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = drawerTranslateY.value;
    },
    onActive: (event, ctx) => {
      let nextY = ctx.startY + event.translationY;
      if (nextY < SNAP_TOP - 50) nextY = SNAP_TOP - 50;
      drawerTranslateY.value = nextY;
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      const currentY = drawerTranslateY.value;
      
      let target = SNAP_HALF;

      if (velocity < -500) {
        target = SNAP_TOP;
      } else if (velocity > 500) {
        if (currentY < SNAP_HALF) target = SNAP_HALF;
        else target = SNAP_BOTTOM;
      } else {
        const distTop = Math.abs(currentY - SNAP_TOP);
        const distHalf = Math.abs(currentY - SNAP_HALF);
        const distBottom = Math.abs(currentY - SNAP_BOTTOM);

        if (distTop < distHalf && distTop < distBottom) target = SNAP_TOP;
        else if (distHalf < distTop && distHalf < distBottom) target = SNAP_HALF;
        else target = SNAP_BOTTOM;
      }

      drawerTranslateY.value = withSpring(target, { damping: 15, stiffness: 90 });
    },
  });

  const snapTo = useCallback((point: number) => {
    drawerTranslateY.value = withSpring(point, { damping: 15 });
  }, [drawerTranslateY]);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await client.get('/discover/nearby', {
        params: { lat, lng, radius: 5 },
      });
      setNearbyPois(response.data);
    } catch (error) {
      console.error('Failed to fetch nearby POIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        runOnJS(snapTo)(SNAP_HALF);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setLoading(false);
      }
    },
    [snapTo, SNAP_HALF],
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
    snapTo(SNAP_BOTTOM);
  }, [snapTo, SNAP_BOTTOM]);

  const handleFocus = useCallback(() => {
    snapTo(SNAP_HALF);
  }, [snapTo, SNAP_HALF]);

  const handleBlur = useCallback(() => {}, []);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setCurrentRegion(region);
      fetchNearby(region.latitude, region.longitude);
    },
    [fetchNearby],
  );

  const handleZoomToPoi = useCallback((poi: POI) => {
    const lat = typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat;
    const lng = typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng;

    runOnJS(snapTo)(SNAP_HALF);

    const offsetLat = lat - 0.002;

    mapRef.current?.animateToRegion(
      {
        latitude: offsetLat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000,
    );
  }, [snapTo, SNAP_HALF]);

  const handlePoiSelect = useCallback(
    async (poi: POI, layout?: LayoutInfo) => {
      setSelectedPoi(poi);
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
      { elementType: 'geometry', stylers: [{ color: '#212121' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
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
      { featureType: 'poi', stylers: [{ visibility: 'on' }] },
      { featureType: 'transit', stylers: [{ visibility: 'on' }] },
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ClusteredMapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        renderCluster={renderCluster}>
        {selectedPoi && (
          <Marker
            coordinate={{
              latitude:
                typeof selectedPoi.lat === 'string'
                  ? parseFloat(selectedPoi.lat)
                  : selectedPoi.lat,
              longitude:
                typeof selectedPoi.lng === 'string'
                  ? parseFloat(selectedPoi.lng)
                  : selectedPoi.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.selectedMarker} />
          </Marker>
        )}
      </ClusteredMapView>

      {!selectedPoi && (
        <FilterBar
          onSearch={handleSearch}
          onClear={handleClear}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )}

      {/* Results Drawer */}
      <Animated.View style={[styles.drawer, drawerStyle]}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={styles.gestureHeader}>
            <View style={styles.drawerHandle} />
          </Animated.View>
        </PanGestureHandler>
        <View style={{flex: 1}}>
           <PoiListView
            searchQuery={searchQuery}
            searchResults={searchResults}
            nearbyPois={nearbyPois}
            loading={loading}
            onPoiSelect={handlePoiSelect}
            onZoom={handleZoomToPoi}
          />
        </View>
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
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    backgroundColor: 'transparent',
  },
});