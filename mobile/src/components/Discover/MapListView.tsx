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
import { Map } from '../../lib/types';
import CreateMapForm from '../CreateMapForm';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MapListViewProps {
  maps: Map[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Map>) => void;
  onMapCreated: () => void;
  onClick: (map: Map) => void;
}

export default function MapListView({ maps, onMapCreated, onClick }: MapListViewProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>My Maps</Text>
      </View>
      <CreateMapForm onMapCreated={onMapCreated} />
      <View style={styles.list}>
        {maps.length > 0 ? (
          maps.map(map => (
            <TouchableOpacity key={map.id} style={styles.mapItem} onPress={() => onClick(map)}>
              <View style={styles.mapIcon}>
                <Text style={styles.emoji}>{map.icon || '🌍'}</Text>
              </View>
              <View style={styles.mapInfo}>
                <Text style={styles.mapTitle} numberOfLines={1}>
                  {map.title}
                </Text>
                <Text style={styles.mapSubtitle}>{map.pois?.length || 0} locations</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No maps created yet.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  list: {
    marginTop: 16,
    gap: 12,
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
    width: 48,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emoji: {
    fontSize: 24,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  mapSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
