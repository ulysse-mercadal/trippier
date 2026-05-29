// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Card, { CardBody, CardMedia } from '../../components/Card';
import List from '../../components/List';
import ListItem from '../../components/ListItem';
import Meta from '../../components/Meta';
import PreviewMap from '../../components/PreviewMap';
import Tag from '../../components/Tag';
import TitleDot from '../../components/TitleDot';
import { ChevronRight, Globe } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';
import { useAuthGate } from '../../hooks/useAuthGate';
import { useTheme } from '../../theme/useTheme';
import TripMiniCard from './TripMiniCard';
import { MOCK_PUBLIC_MAPS, MOCK_TRIPS } from './your-map-data';

/**
 * Friends "Your map" sub-view — profile strip, big preview map with a "here
 * now" tag, a horizontal scroller of compact trip cards and a list of the
 * user's public maps.
 *
 * @returns The rendered map sub-view.
 */
const YourMapView: React.FC = () => {
  const { theme, mapTheme } = useTheme();
  const { user } = useAuth();
  const { gate } = useAuthGate();

  const displayName = user?.name ?? 'Guest traveller';
  const handle = user?.email ? user.email.split('@')[0] : 'local-only';

  const handleSync = useCallback((): void => {
    gate('generic', () => {
      console.warn('action stubbed: sync map');
    });
  }, [gate]);

  return (
    <View style={styles.root}>
      <View style={styles.profileStrip}>
        <Avatar name={displayName} size={52} />
        <View style={styles.profileText}>
          <Text
            style={[
              styles.handle,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            {`@${handle}`}
          </Text>
          <Meta>local-only · sync off</Meta>
        </View>
        <Button label="Sync" variant="ghost" size="sm" onPress={handleSync} />
      </View>

      <Card>
        <CardMedia height={240}>
          <PreviewMap palette={mapTheme} surfaceColor={theme.colors.surface} height={240} />
        </CardMedia>
        <CardBody padding={16}>
          <View style={styles.mapHeaderRow}>
            <View style={styles.mapTitles}>
              <Text
                style={[
                  styles.h3,
                  { color: theme.colors.ink, fontFamily: theme.fonts.display },
                ]}>
                {'Where you’ve been'}
                <TitleDot />
              </Text>
              <Meta style={styles.mapMeta}>12 countries · 34 cities</Meta>
            </View>
            <Tag variant="emerald" dot pulse>
              Here now
            </Tag>
          </View>
        </CardBody>
      </Card>

      <View>
        <Text
          style={[
            styles.sectionHeader,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          Your trips
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tripsRow}>
          {MOCK_TRIPS.map(trip => (
            <TripMiniCard key={trip.id} trip={trip} />
          ))}
        </ScrollView>
      </View>

      <View>
        <Text
          style={[
            styles.sectionHeader,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          Your public maps
        </Text>
        <List>
          {MOCK_PUBLIC_MAPS.map(map => (
            <ListItem
              key={map.id}
              name={map.name}
              meta={map.meta}
              thumbEmerald
              thumb={<Globe size={20} color={theme.colors.emeraldDeep} />}
              trail={<ChevronRight size={18} color={theme.colors.mute} />}
            />
          ))}
        </List>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  profileStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  handle: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapTitles: {
    flex: 1,
    minWidth: 0,
  },
  h3: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.4,
  },
  mapMeta: {
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 10,
    marginTop: 4,
  },
  tripsRow: {
    gap: 12,
    paddingRight: 4,
  },
});

export default YourMapView;
