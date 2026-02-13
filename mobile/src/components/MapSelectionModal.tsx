// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import client from '../api/client';
import { Map, POI } from '../lib/types';
import { useAuth } from '../context/AuthContext';

interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: POI | null;
  onMapsChange?: () => void;
  onCreateNewMap: () => void;
}

interface MapWithDetails extends Map {
  hasPoi: boolean;
}

export default function MapSelectionModal({
  isOpen,
  onClose,
  poi,
  onMapsChange,
  onCreateNewMap,
}: MapSelectionModalProps) {
  const { token } = useAuth();
  const [maps, setMaps] = useState<MapWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMapsAndStatus = useCallback(async () => {
    if (!poi || !token) {
      return;
    }
    setLoading(true);
    try {
      const { data: userMaps } = await client.get<Map[]>('/maps');
      const mapsWithStatus = await Promise.all(
        userMaps.map(async map => {
          try {
            const { data: mapDetails } = await client.get<Map>(`/maps/${map.id}`);
            const hasPoi = mapDetails.pois?.some(p => p.place_id === poi.place_id) || false;
            return { ...map, hasPoi };
          } catch (e) {
            console.error(`Failed to fetch details for map ${map.id}`, e);
            return { ...map, hasPoi: false };
          }
        }),
      );
      setMaps(mapsWithStatus);
    } catch (error) {
      console.error('Failed to fetch maps', error);
    } finally {
      setLoading(false);
    }
  }, [poi, token]);

  useEffect(() => {
    if (isOpen && poi && token) {
      fetchMapsAndStatus();
    }
  }, [isOpen, poi, token, fetchMapsAndStatus]);

  const toggleMap = async (map: MapWithDetails) => {
    if (!poi) {
      return;
    }
    setMaps(prev => prev.map(m => (m.id === map.id ? { ...m, hasPoi: !m.hasPoi } : m)));
    try {
      if (map.hasPoi) {
        await client.delete(`/maps/${map.id}/pois/${poi.place_id}`);
      } else {
        await client.post(`/maps/${map.id}/pois`, {
          place_id: poi.place_id,
          name: poi.name,
          lat: poi.lat,
          lng: poi.lng,
          address: poi.address,
          rating: poi.rating,
          userRatingsTotal: poi.user_ratings_total,
          thumbnail: poi.thumbnail,
          description: poi.description,
          wikipediaUrl: poi.wikipediaUrl,
          wikivoyageUrl: poi.wikivoyageUrl,
          website: poi.officialWebsite,
          phoneNumber: poi.phoneNumber,
        });
      }
      onMapsChange?.();
    } catch (error) {
      console.error('Failed to update map', error);
      setMaps(prev => prev.map(m => (m.id === map.id ? { ...m, hasPoi: map.hasPoi } : m)));
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Save to Map</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {!token ? (
              <View style={styles.loginPrompt}>
                <Text style={styles.promptText}>
                  Join the community to save your favorite places and plan your next trips.
                </Text>
                <TouchableOpacity style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>Login or Register</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mainContainer}>
                <View style={styles.createFormWrapper}>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={onCreateNewMap}
                    activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={24} color="#000" />
                    <Text style={styles.createButtonText}>Create New Map</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />
                <ScrollView
                  style={styles.mapsList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.mapsListContent}>
                  {loading && maps.length === 0 ? (
                    <ActivityIndicator size="large" color="#000" style={styles.loader} />
                  ) : maps.length === 0 ? (
                    <Text style={styles.noMaps}>No maps found. Create one first!</Text>
                  ) : (
                    maps.map(map => (
                      <TouchableOpacity
                        key={map.id}
                        onPress={() => toggleMap(map)}
                        activeOpacity={0.7}
                        style={[
                          styles.mapItem,
                          map.hasPoi ? styles.mapItemActive : styles.mapItemInactive,
                        ]}>
                        <View
                          style={[
                            styles.mapIcon,
                            map.hasPoi ? styles.mapIconActive : styles.mapIconInactive,
                          ]}>
                          <Text style={styles.emojiText}>{map.icon || '🌍'}</Text>
                        </View>
                        <View style={styles.mapInfo}>
                          <Text
                            style={[
                              styles.mapTitle,
                              map.hasPoi ? styles.textWhite : styles.textBlack,
                            ]}
                            numberOfLines={1}>
                            {map.title}
                          </Text>
                          {map.description && (
                            <Text
                              style={[
                                styles.mapDescription,
                                map.hasPoi ? styles.textGray300 : styles.textGray500,
                              ]}
                              numberOfLines={1}>
                              {map.description}
                            </Text>
                          )}
                        </View>
                        {map.hasPoi && <Ionicons name="checkmark-circle" size={24} color="#FFF" />}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.doneButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '95%',
    maxWidth: 500,
    maxHeight: Platform.OS === 'ios' ? '90%' : '95%',
    minHeight: 500,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexShrink: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  mainContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  createFormWrapper: {
    flexShrink: 0,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#FFF',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    flexShrink: 0,
  },
  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  promptText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mapsList: {
    flex: 1,
  },
  mapsListContent: {
    gap: 8,
    paddingBottom: 10,
  },
  loader: {
    marginTop: 40,
  },
  noMaps: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
    fontStyle: 'italic',
  },
  mapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  mapItemActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  mapItemInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  mapIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mapIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapIconInactive: {
    backgroundColor: '#FFF',
    borderColor: '#E5E7EB',
  },
  emojiText: {
    fontSize: 22,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  mapDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  textWhite: {
    color: '#FFF',
  },
  textBlack: {
    color: '#111827',
  },
  textGray300: {
    color: '#D1D5DB',
  },
  textGray500: {
    color: '#6B7280',
  },
  footer: {
    marginTop: 20,
    flexShrink: 0,
  },
  doneButton: {
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
