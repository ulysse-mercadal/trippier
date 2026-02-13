// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { POI } from '../lib/types';

export interface LayoutInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PoiCardProps {
  poi: POI;
  onPress: (poi: POI, layout?: LayoutInfo) => void;
  onZoom?: (poi: POI) => void;
  isHighlighted?: boolean;
}

export default function PoiCard({ poi, onPress, onZoom, isHighlighted }: PoiCardProps) {
  const cardRef = useRef<View>(null);

  const handlePress = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      onPress(poi, { x, y, width, height });
    });
  };

  return (
    <View ref={cardRef} collapsable={false}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isHighlighted && styles.highlightedCard,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handlePress}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {poi.name}
            </Text>
            {onZoom && (
              <Pressable
                onPress={e => {
                  e.stopPropagation();
                  onZoom(poi);
                }}
                style={({ pressed }) => [styles.zoomButton, { opacity: pressed ? 0.7 : 1 }]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="map-outline" size={20} color="#000000" />
              </Pressable>
            )}
          </View>
          <View style={styles.row}>
            {poi.distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>
                  {poi.distance < 1
                    ? `${(poi.distance * 1000).toFixed(0)}m`
                    : `${poi.distance.toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  highlightedCard: {
    borderColor: '#000000',
    borderWidth: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  zoomButton: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  distanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
});
