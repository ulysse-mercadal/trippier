// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card, { CardBody } from '../../components/Card';
import Meta from '../../components/Meta';
import { MapPin } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { CompactTripCard } from './your-map-data';

export interface TripMiniCardProps {
  trip: CompactTripCard;
}

/**
 * Compact card rendered inside the horizontal trips scroller of the "Your
 * map" sub-view. Shows an emerald-soft pin badge, a bold title and a meta
 * line summarising days and stop count.
 *
 * @param props - {@link TripMiniCardProps}.
 * @returns The rendered trip card.
 */
const TripMiniCard: React.FC<TripMiniCardProps> = ({ trip }) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.tripCard}>
      <CardBody padding={14}>
        <View
          style={[
            styles.tripBadgeInner,
            { backgroundColor: theme.colors.emeraldSoft },
          ]}>
          <MapPin size={18} color={theme.colors.emeraldDeep} />
        </View>
        <Text
          style={[
            styles.tripTitle,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          {trip.title}
        </Text>
        <Meta>{trip.meta}</Meta>
      </CardBody>
    </Card>
  );
};

const styles = StyleSheet.create({
  tripCard: {
    width: 200,
  },
  tripBadgeInner: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tripTitle: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
});

export default TripMiniCard;
