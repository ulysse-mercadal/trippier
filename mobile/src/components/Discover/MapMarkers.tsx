// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { POI } from '../../lib/types';

interface MapMarkersProps {
  visibleMapPois: { poi: POI; mapIcon: string }[];
  focusedPoi: POI | null;
}

export const MapMarkers = React.memo(({ visibleMapPois, focusedPoi }: MapMarkersProps) => {
  return (
    <>
      {visibleMapPois.map(({ poi, mapIcon }) => (
        <MapLibreGL.MarkerView
          key={poi.place_id}
          id={poi.place_id}
          coordinate={[
            typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng,
            typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat,
          ]}>
          <View style={styles.markerContainer}>
            <View style={styles.markerPin}>
              <View style={styles.markerCircle}>
                <Text style={styles.markerIcon}>{mapIcon}</Text>
              </View>
              <View style={styles.markerTriangle} />
            </View>
          </View>
        </MapLibreGL.MarkerView>
      ))}
      {focusedPoi && (
        <MapLibreGL.MarkerView
          id="focused-poi"
          coordinate={[
            typeof focusedPoi.lng === 'string' ? parseFloat(focusedPoi.lng) : focusedPoi.lng,
            typeof focusedPoi.lat === 'string' ? parseFloat(focusedPoi.lat) : focusedPoi.lat,
          ]}>
          <View style={styles.selectedMarker} />
        </MapLibreGL.MarkerView>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 60,
  },
  markerPin: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 24,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -2,
  },
  selectedMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 6,
  },
});
