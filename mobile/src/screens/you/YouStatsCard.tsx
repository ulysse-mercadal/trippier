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
import Card from '../../components/Card';
import Meta from '../../components/Meta';
import { useTheme } from '../../theme/useTheme';

export interface YouStat {
  value: string;
  label: string;
}

export interface YouStatsCardProps {
  stats: readonly [YouStat, YouStat, YouStat];
}

/**
 * Three-column rolled-up stats card surfaced at the top of the signed-in You
 * screen — countries / cities / days, separated by a hairline divider.
 *
 * @param props - {@link YouStatsCardProps}.
 * @returns The rendered stats card.
 */
const YouStatsCard: React.FC<YouStatsCardProps> = ({ stats }) => {
  const { theme } = useTheme();
  return (
    <Card style={styles.statsCard}>
      {stats.map((stat, idx) => (
        <View
          key={stat.label}
          style={[
            styles.statCell,
            idx > 0
              ? { borderLeftWidth: 1, borderLeftColor: theme.colors.line }
              : null,
          ]}>
          <Text
            style={[
              styles.statValue,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            {stat.value}
          </Text>
          <Meta style={styles.statLabel}>{stat.label}</Meta>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    flexDirection: 'row',
  },
  statCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: -0.7,
  },
  statLabel: {
    marginTop: 2,
  },
});

export default YouStatsCard;
