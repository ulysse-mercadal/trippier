// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <TouchableOpacity
        style={[styles.card, isHighlighted && styles.highlightedCard]}
        onPress={handlePress}
        activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {poi.name}
            </Text>
            {onZoom && (
              <TouchableOpacity
                onPress={() => onZoom(poi)}
                style={styles.zoomButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="map-outline" size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.row}>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>
                {poi.distance < 1
                  ? `${(poi.distance * 1000).toFixed(0)}m`
                  : `${poi.distance.toFixed(1)}km`}
              </Text>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingItem}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{poi.rating || 'N/A'}</Text>
            </View>
            <View style={styles.ratingItem}>
              <Ionicons name="people" size={12} color="#9CA3AF" />
              <Text style={styles.reviewCount}>
                ({poi.user_ratings_total?.toLocaleString() || 0})
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  reviewCount: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#9CA3AF',
  },
});
