// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import PoiListView from '../PoiListView';
import MapListView from './MapListView';
import MapDetailView from './MapDetailView';
import { POI, Map } from '../../lib/types';
import { LayoutInfo } from '../PoiCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomDrawerProps {
  drawerTranslateY: any;
  headerGestureHandler: any;
  listRef: any;
  scrollHandler: any;
  searchQuery: string;
  searchResults: POI[];
  nearbyPois: POI[];
  loading: boolean;
  onPoiSelect: (poi: POI, layout?: LayoutInfo) => void;
  onZoom: (poi: POI) => void;
  focusedPoi: POI | null;
  viewMode: 'search' | 'maps';
  setViewMode: (mode: 'search' | 'maps') => void;
  maps: Map[];
  onMapsRefresh: () => void;
  onDeleteMap: (id: number) => void;
  onUpdateMap: (id: number, data: Partial<Map>) => void;
  onMapCreated: () => void;
  weights?: string;
  onWeightsChange?: (weights: string) => void;
  selectedMapId: number | null;
  onSelectedMapIdChange: (id: number | null) => void;
}

export const BottomDrawer = ({
  drawerTranslateY,
  headerGestureHandler,
  listRef,
  scrollHandler,
  searchQuery,
  searchResults,
  nearbyPois,
  loading,
  onPoiSelect,
  onZoom,
  focusedPoi,
  viewMode,
  maps,
  onMapsRefresh,
  onDeleteMap,
  onUpdateMap,
  onMapCreated,
  weights,
  onWeightsChange,
  selectedMapId,
  onSelectedMapIdChange,
}: BottomDrawerProps) => {
  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: drawerTranslateY.value }],
    };
  });

  const selectedMap = maps.find(m => m.id === selectedMapId);

  return (
    <Animated.View style={[styles.drawer, drawerStyle]}>
      <PanGestureHandler onGestureEvent={headerGestureHandler}>
        <Animated.View style={styles.gestureHeader}>
          <View style={styles.drawerHandle} />
        </Animated.View>
      </PanGestureHandler>
      <Animated.View style={{ flex: 1 }}>
        {viewMode === 'search' ? (
          <PoiListView
            ref={listRef}
            scrollHandler={scrollHandler}
            searchQuery={searchQuery}
            searchResults={searchResults}
            nearbyPois={nearbyPois}
            loading={loading}
            onPoiSelect={onPoiSelect}
            onZoom={onZoom}
            highlightedPoiId={focusedPoi?.place_id}
            weights={weights}
            onWeightsChange={onWeightsChange}
          />
        ) : selectedMap ? (
          <MapDetailView
            map={selectedMap}
            onBack={() => onSelectedMapIdChange(null)}
            onPoiSelect={onPoiSelect}
            onZoom={onZoom}
            onMapsChange={onMapsRefresh}
          />
        ) : (
          <MapListView
            maps={maps}
            onDelete={onDeleteMap}
            onUpdate={onUpdateMap}
            onMapCreated={onMapCreated}
            onClick={m => onSelectedMapIdChange(m.id)}
          />
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
});
