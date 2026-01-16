// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  Clipboard,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { POI } from '../lib/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LayoutInfo } from './PoiCard';

interface PoiDetailViewProps {
  selectedPoi: POI;
  onClose: () => void;
  loading: boolean;
  initialLayout?: LayoutInfo;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PoiDetailView({
  selectedPoi,
  onClose,
  loading,
  initialLayout,
}: PoiDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Animation values
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
    // Start animation on mount
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        overScrollMode="always">
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

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

        <View style={styles.ratingRow}>
          <View style={styles.ratingItem}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{selectedPoi.rating || 'N/A'}</Text>
          </View>
          <View style={styles.ratingItem}>
            <Ionicons name="people" size={16} color="#9CA3AF" />
            <Text style={styles.reviewText}>
              {selectedPoi.user_ratings_total?.toLocaleString() || 0} reviews
            </Text>
          </View>
        </View>

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
            <Text>Loading details...</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION</Text>
          <Text style={styles.addressText}>{selectedPoi.address}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 100, // Ensure space for scrolling
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginLeft: 8,
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  reviewText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
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
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
