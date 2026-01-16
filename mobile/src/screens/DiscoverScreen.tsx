// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useTheme } from '@react-navigation/native';
import FilterBar from '../components/FilterBar';
import PoiDetailView from '../components/PoiDetailView';
import client from '../api/client';
import { POI } from '../lib/types';
import { LayoutInfo } from '../components/PoiCard';

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const mapRef = useRef<any>(null); // ClusteredMapView ref

  const [nearbyPois, setNearbyPois] = useState<POI[]>([]);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedPoiLayout, setSelectedPoiLayout] = useState<LayoutInfo | undefined>(undefined);
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 48.8584,
    longitude: 2.2945,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

  const fetchSearch = useCallback(async (lat: number, lng: number, q: string) => {
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
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      fetchSearch(currentRegion.latitude, currentRegion.longitude, text);
    },
    [currentRegion, fetchSearch],
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setCurrentRegion(region);
      fetchNearby(region.latitude, region.longitude);
    },
    [fetchNearby],
  );

  const handlePoiSelect = useCallback(async (poi: POI, layout?: LayoutInfo) => {
    setSelectedPoi(poi);
    setSelectedPoiLayout(layout);
    const lat = typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat;
    const lng = typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng;
    mapRef.current?.animateToRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
    try {
      setLoading(true);
      const response = await client.get('/discover/details', {
        params: {
          place_id: poi.place_id,
          name: poi.name,
          lat,
          lng,
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
  }, []);
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
      <FilterBar
        nearbyPois={nearbyPois}
        searchResults={searchResults}
        loading={loading}
        onSearch={handleSearch}
        onPoiSelect={handlePoiSelect}
      />
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
});
