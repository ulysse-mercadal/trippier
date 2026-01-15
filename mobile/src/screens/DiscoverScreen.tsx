// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Marker, LongPressEvent } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { useTheme } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FilterBar from '../components/FilterBar';

interface CustomMarker {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: 'Tourist' | 'Business' | 'Transport';
}
const FILTERS = ['Tourist', 'Business', 'Transport'] as const;
const ICONS: Record<string, string> = {
  Tourist: 'camera',
  Business: 'briefcase',
  Transport: 'bus',
};
const INITIAL_MARKERS: CustomMarker[] = [];

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const [markers, setMarkers] = useState<CustomMarker[]>(INITIAL_MARKERS);
  const filteredMarkers = markers;

  const handleLongPress = (e: LongPressEvent) => {
    const randomType = FILTERS[Math.floor(Math.random() * FILTERS.length)];
    const newMarker: CustomMarker = {
      id: Date.now(),
      coordinate: e.nativeEvent.coordinate,
      type: randomType,
    };
    setMarkers([...markers, newMarker]);
  };

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
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleLongPress}
        renderCluster={renderCluster}>
        {filteredMarkers.map(marker => (
          <Marker key={marker.id} coordinate={marker.coordinate} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.markerPin}>
              <Ionicons name="location" size={45} color="#FFFFFF" />
              <View style={styles.markerIconContainer}>
                <Ionicons name={ICONS[marker.type] || 'help-circle'} size={18} color="#000000" />
              </View>
            </View>
          </Marker>
        ))}
      </ClusteredMapView>
      <FilterBar />
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
  markerPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIconContainer: {
    position: 'absolute',
    top: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    width: 22,
    height: 22,
    borderRadius: 11,
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
