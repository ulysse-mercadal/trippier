// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface StatItem {
  value: string;
  label: string;
}

export interface StatRowProps {
  stats: [StatItem, StatItem, StatItem];
  style?: ViewStyle;
}

/**
 * Three-column row of value + caption pairs.
 *
 * @param props - {@link StatRowProps}.
 * @returns A horizontal `<View>` rendering the three stats.
 */
const StatRow: React.FC<StatRowProps> = ({ stats, style }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, style]}>
      {stats.map((stat, idx) => (
        <View key={`${stat.label}-${idx}`} style={styles.cell}>
          <Text
            style={[
              styles.value,
              { color: theme.colors.ink, fontFamily: theme.fonts.display, fontSize: theme.fontSize.xl },
            ]}>
            {stat.value}
          </Text>
          <Text
            style={[
              styles.label,
              { color: theme.colors.mute, fontFamily: theme.fonts.mono, fontSize: theme.fontSize.xs },
            ]}>
            {stat.label.toLowerCase()}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    gap: 4,
  },
  value: {
    fontWeight: '600',
  },
  label: {
    letterSpacing: 0.6,
  },
});

export default StatRow;
