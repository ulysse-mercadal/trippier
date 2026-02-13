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
  onPoiSelect?: (poi: POI) => void;
}

export const MapMarkers = React.memo(
  ({ visibleMapPois, focusedPoi, onPoiSelect }: MapMarkersProps) => {
    return (
      <>
        {visibleMapPois.map(({ poi, mapIcon }) => (
          <MapLibreGL.PointAnnotation
            key={poi.place_id}
            id={poi.place_id}
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={[
              typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng,
              typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat,
            ]}
            onSelected={() => onPoiSelect?.(poi)}>
            <View style={styles.massiveContainer}>
              <View style={styles.webPin}>
                <Text style={styles.markerIcon}>{mapIcon}</Text>
              </View>
            </View>
          </MapLibreGL.PointAnnotation>
        ))}
        {focusedPoi && (
          <MapLibreGL.MarkerView
            id="focused-poi"
            anchor={{ x: 0.5, y: 0.5 }}
            coordinate={[
              typeof focusedPoi.lng === 'string' ? parseFloat(focusedPoi.lng) : focusedPoi.lng,
              typeof focusedPoi.lat === 'string' ? parseFloat(focusedPoi.lat) : focusedPoi.lat,
            ]}>
            <View style={styles.selectedMarker} />
          </MapLibreGL.MarkerView>
        )}
      </>
    );
  },
);

const styles = StyleSheet.create({
  massiveContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    backgroundColor: 'transparent',
  },
  webPin: {
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    transform: [{ translateY: -13 }, { rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIcon: {
    fontSize: 14,
    transform: [{ rotate: '45deg' }], // Keeps emoji upright
    textAlign: 'center',
  },
  selectedMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 6,
  },
});
