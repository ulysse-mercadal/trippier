// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Map, POI } from '../../lib/types';
import PoiCard from '../PoiCard';

interface MapDetailViewProps {
  map: Map;
  onBack: () => void;
  onPoiSelect?: (poi: POI) => void;
  onZoom?: (poi: POI) => void;
  _onMapsChange?: () => void;
}

export default function MapDetailView({
  map,
  onBack,
  onPoiSelect,
  onZoom,
  _onMapsChange,
}: MapDetailViewProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.mapIcon}>
            <Text style={styles.emoji}>{map.icon || '🌍'}</Text>
          </View>
          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle} numberOfLines={1}>{map.title}</Text>
            <Text style={styles.mapSubtitle}>
              {map.pois?.length || 0} locations
            </Text>
          </View>
        </View>

        {map.description && (
          <Text style={styles.description}>{map.description}</Text>
        )}

        <View style={styles.dateInfo}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text style={styles.dateLabel}>
              Created on <Text style={styles.dateValue}>{formatDate(map.createdAt)}</Text>
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text style={styles.dateLabel}>
              Last updated <Text style={styles.dateValue}>{formatDate(map.updatedAt)}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.poiSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#9CA3AF" />
            <Text style={styles.sectionTitle}>PLACES IN THIS MAP</Text>
          </View>
          <View style={styles.poiList}>
            {map.pois && map.pois.length > 0 ? (
              map.pois.map((poi, i) => (
                <PoiCard
                  key={poi.place_id || i}
                  poi={poi}
                  onPress={onPoiSelect}
                  onZoom={onZoom}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No places added yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  mapIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#F9FAFB',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emoji: {
    fontSize: 32,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 34,
  },
  mapSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  dateInfo: {
    gap: 8,
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dateValue: {
    fontWeight: 'bold',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  poiSection: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  poiList: {
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
