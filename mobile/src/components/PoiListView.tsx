// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { POI } from '../lib/types';
import PoiCard, { LayoutInfo } from './PoiCard';

interface PoiListViewProps {
  searchQuery: string;
  searchResults: POI[];
  nearbyPois: POI[];
  loading: boolean;
  onPoiSelect: (poi: POI, layout?: LayoutInfo) => void;
}

export default function PoiListView({
  searchQuery,
  searchResults,
  nearbyPois,
  loading,
  onPoiSelect,
}: PoiListViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      {searchQuery ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TOP RESULTS</Text>
          {searchResults.length > 0 ? (
            searchResults.map((poi, i) => (
              <PoiCard key={poi.place_id || i} poi={poi} onPress={onPoiSelect} />
            ))
          ) : !loading ? (
            <Text style={styles.emptyText}>No popular results found for "{searchQuery}"</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{searchQuery ? 'FAMOUS NEARBY' : 'POPULAR NEARBY'}</Text>
        {nearbyPois.length > 0 ? (
          nearbyPois.map((poi, i) => (
            <PoiCard key={poi.place_id || i} poi={poi} onPress={onPoiSelect} />
          ))
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <Text style={styles.emptyText}>No places found nearby.</Text>
        )}
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 80, // Space for bottom navigation/safe area
  },
});
