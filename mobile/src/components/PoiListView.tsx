// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { forwardRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { POI } from '../lib/types';
import PoiCard, { LayoutInfo } from './PoiCard';

interface PoiListViewProps {
  searchQuery: string;
  searchResults: POI[];
  nearbyPois: POI[];
  loading: boolean;
  onPoiSelect: (poi: POI, layout?: LayoutInfo) => void;
  onZoom: (poi: POI) => void;
  scrollHandler?: any;
  highlightedPoiId?: string | null;
  weights?: string;
  onWeightsChange?: (weights: string) => void;
}

const CATEGORIES = [
  { id: 'culture', name: 'Culture', icon: 'museum-outline' },
  { id: 'food', name: 'Food', icon: 'restaurant-outline' },
  { id: 'nature', name: 'Nature', icon: 'leaf-outline' },
  { id: 'nightlife', name: 'Nightlife', icon: 'beer-outline' },
  { id: 'shopping', name: 'Shopping', icon: 'cart-outline' },
  { id: 'activities', name: 'Activities', icon: 'walk-outline' },
];

const PoiListView = forwardRef<any, PoiListViewProps>(
  (
    {
      searchQuery,
      searchResults,
      nearbyPois,
      loading,
      onPoiSelect,
      onZoom,
      scrollHandler,
      highlightedPoiId,
      weights = '',
      onWeightsChange,
    },
    ref,
  ) => {
    const currentWeights = useMemo(() => {
      const map: Record<string, number> = {};
      weights.split(',').forEach(w => {
        const [k, v] = w.split(':');
        if (k) {
          map[k] = parseFloat(v) || 0;
        }
      });
      return map;
    }, [weights]);

    const toggleCategory = (id: string) => {
      if (!onWeightsChange) {
        return;
      }
      const newWeights = { ...currentWeights };
      if (newWeights[id]) {
        delete newWeights[id];
      } else {
        newWeights[id] = 10;
      }
      const weightsStr = Object.entries(newWeights)
        .map(([k, v]) => `${k}:${v}`)
        .join(',');
      onWeightsChange(weightsStr);
    };

    return (
      <Animated.ScrollView
        ref={ref}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => toggleCategory(cat.id)}
              style={[
                styles.categoryButton,
                currentWeights[cat.id] ? styles.categoryActive : styles.categoryInactive,
              ]}>
              <Ionicons
                name={cat.icon}
                size={16}
                color={currentWeights[cat.id] ? '#FFF' : '#374151'}
              />
              <Text
                style={[
                  styles.categoryText,
                  currentWeights[cat.id] ? styles.textWhite : styles.textGray,
                ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {searchQuery ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TOP RESULTS</Text>
            {searchResults.length > 0 ? (
              searchResults.map((poi, i) => (
                <PoiCard
                  key={poi.place_id || i}
                  poi={poi}
                  onPress={onPoiSelect}
                  onZoom={onZoom}
                  isHighlighted={poi.place_id === highlightedPoiId}
                />
              ))
            ) : !loading ? (
              <Text style={styles.emptyText}>No popular results found for "{searchQuery}"</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'FAMOUS NEARBY' : 'POPULAR NEARBY'}
          </Text>
          {nearbyPois.length > 0 ? (
            nearbyPois.map((poi, i) => (
              <PoiCard
                key={poi.place_id || i}
                poi={poi}
                onPress={onPoiSelect}
                onZoom={onZoom}
                isHighlighted={poi.place_id === highlightedPoiId}
              />
            ))
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <Text style={styles.emptyText}>No places found nearby.</Text>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryInactive: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  textWhite: {
    color: '#FFF',
  },
  textGray: {
    color: '#374151',
  },
  section: {
    paddingHorizontal: 16,
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
    height: 80,
  },
});

export default PoiListView;
