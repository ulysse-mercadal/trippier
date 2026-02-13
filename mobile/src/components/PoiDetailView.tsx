// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { POI, Map } from '../lib/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LayoutInfo } from './PoiCard';
import CommentSection from './CommentSection';
import MapSelectionModal from './MapSelectionModal';
import CreateMapModal from './CreateMapModal';
import { useAuth } from '../context/AuthContext';

interface PoiDetailViewProps {
  selectedPoi: POI;
  onClose: () => void;
  loading: boolean;
  initialLayout?: LayoutInfo;
  maps?: Map[];
  onMapsChange?: () => void;
  onMapClick?: (mapId: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PoiDetailView({
  selectedPoi,
  onClose,
  loading,
  initialLayout,
  maps = [],
  onMapsChange,
  onMapClick,
}: PoiDetailViewProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const savedInMaps = useMemo(() => {
    return maps.filter(m => m.pois?.some(p => p.place_id === selectedPoi.place_id));
  }, [maps, selectedPoi.place_id]);

  const top = useSharedValue(initialLayout ? initialLayout.y : SCREEN_HEIGHT);
  const left = useSharedValue(initialLayout ? initialLayout.x : 0);
  const width = useSharedValue(initialLayout ? initialLayout.width : SCREEN_WIDTH);
  const height = useSharedValue(initialLayout ? initialLayout.height : 0);
  const borderRadius = useSharedValue(initialLayout ? 16 : 0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      top: top.value,
      left: left.value,
      width: width.value,
      height: height.value,
      borderRadius: borderRadius.value,
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 100 });
    top.value = withSpring(0, { damping: 15, stiffness: 90 });
    left.value = withSpring(0, { damping: 15, stiffness: 90 });
    width.value = withSpring(SCREEN_WIDTH, { damping: 15, stiffness: 90 });
    height.value = withSpring(SCREEN_HEIGHT, { damping: 15, stiffness: 90 });
    borderRadius.value = withSpring(0, { damping: 15, stiffness: 90 });
  }, [borderRadius, height, left, opacity, top, width]);

  const handleClose = () => {
    if (initialLayout) {
      top.value = withTiming(initialLayout.y, { duration: 200 });
      left.value = withTiming(initialLayout.x, { duration: 200 });
      width.value = withTiming(initialLayout.width, { duration: 200 });
      height.value = withTiming(initialLayout.height, { duration: 200 });
      borderRadius.value = withTiming(16, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(onClose)();
      });
    } else {
      top.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
        runOnJS(onClose)();
      });
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openUrl = async (url: string) => {
    if (!url) {
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      await Linking.openURL(finalUrl);
    } catch (err) {
      console.error('Failed to open URL:', err);
    }
  };

  const openMaps = () => {
    const query = encodeURIComponent(`${selectedPoi.name} ${selectedPoi.address || ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url);
  };

  const handleOpenCreateModal = useCallback(() => {
    setIsSaveModalOpen(false);
    setTimeout(() => setIsCreateModalOpen(true), 300);
  }, []);

  const handleMapCreated = useCallback(() => {
    setIsCreateModalOpen(false);
    onMapsChange?.();
    setTimeout(() => setIsSaveModalOpen(true), 500);
  }, [onMapsChange]);

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always">
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {user && (
            <TouchableOpacity onPress={() => setIsSaveModalOpen(true)} style={styles.saveButton}>
              <Ionicons
                name={savedInMaps.length > 0 ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color="#FFF"
              />
              <Text style={styles.saveButtonText}>{savedInMaps.length > 0 ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Login to save this place to your maps and plan your trip.
            </Text>
            <TouchableOpacity style={styles.loginAction}>
              <Text style={styles.loginActionText}>Login or Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedPoi.thumbnail && !imgError && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedPoi.thumbnail }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          </View>
        )}
        <Text style={styles.name}>{selectedPoi.name}</Text>
        {selectedPoi.description ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
              <Text style={styles.sectionTitle}>ABOUT</Text>
            </View>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>"{selectedPoi.description}"</Text>
            </View>
          </View>
        ) : loading ? (
          <View style={styles.loadingPlaceholder}>
            <ActivityIndicator size="small" color="#9CA3AF" />
          </View>
        ) : null}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={20} color="#9CA3AF" />
            <Text style={styles.sectionTitle}>ACTIONS & LINKS</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={openMaps}>
              <Text style={styles.actionButtonText}>Open in Google Maps</Text>
              <Ionicons name="map-outline" size={18} color="#000" />
            </TouchableOpacity>
            <View style={styles.row}>
              {selectedPoi.officialWebsite && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.flex1]}
                  onPress={() =>
                    selectedPoi.officialWebsite && openUrl(selectedPoi.officialWebsite)
                  }>
                  <Text style={[styles.actionButtonText, { flex: 1 }]} numberOfLines={1}>
                    Website
                  </Text>
                  <Ionicons name="globe-outline" size={18} color="#000" />
                </TouchableOpacity>
              )}

              {selectedPoi.phoneNumber && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.flex1, { marginLeft: 8 }]}
                  onPress={() =>
                    selectedPoi.phoneNumber && copyToClipboard(selectedPoi.phoneNumber)
                  }>
                  <View style={styles.phoneContent}>
                    <Text style={styles.actionButtonText} numberOfLines={1}>
                      {copied ? 'Copied!' : selectedPoi.phoneNumber}
                    </Text>
                  </View>
                  <Ionicons
                    name={copied ? 'checkmark-outline' : 'call-outline'}
                    size={18}
                    color="#000"
                  />
                </TouchableOpacity>
              )}
            </View>

            {selectedPoi.wikipediaUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => selectedPoi.wikipediaUrl && openUrl(selectedPoi.wikipediaUrl)}>
                <Text style={styles.actionButtonText}>Wikipedia</Text>
                <Ionicons name="book-outline" size={18} color="#000" />
              </TouchableOpacity>
            )}

            {selectedPoi.wikivoyageUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => selectedPoi.wikivoyageUrl && openUrl(selectedPoi.wikivoyageUrl)}>
                <Text style={styles.actionButtonText}>Travel Guide</Text>
                <Ionicons name="airplane-outline" size={18} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {savedInMaps.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bookmark-outline" size={20} color="#9CA3AF" />
              <Text style={styles.sectionTitle}>SAVED IN YOUR MAPS</Text>
            </View>
            <View style={styles.mapsList}>
              {savedInMaps.map(map => (
                <TouchableOpacity
                  key={map.id}
                  onPress={() => onMapClick?.(map.id)}
                  style={styles.mapItem}>
                  <View style={styles.mapIcon}>
                    <Text style={styles.emojiText}>{map.icon || '🌍'}</Text>
                  </View>
                  <View style={styles.mapInfo}>
                    <Text style={styles.mapTitle} numberOfLines={1}>
                      {map.title}
                    </Text>
                    <Text style={styles.mapSubtitle}>{map.pois?.length || 0} locations</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION</Text>
          <Text style={styles.addressText}>{selectedPoi.address}</Text>
        </View>
        <CommentSection poi={selectedPoi} />
        <View style={{ height: 40 }} />
      </ScrollView>

      <MapSelectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        poi={selectedPoi}
        onMapsChange={onMapsChange}
        onCreateNewMap={handleOpenCreateModal}
      />

      <CreateMapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMapCreated={handleMapCreated}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 2000,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginPrompt: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginAction: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
  },
  loginActionText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 34,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  descriptionBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  loadingPlaceholder: {
    padding: 20,
    alignItems: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flex1: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#111827',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  phoneContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  mapsList: {
    gap: 8,
  },
  mapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  mapIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emojiText: {
    fontSize: 20,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  mapSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
