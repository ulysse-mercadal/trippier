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
import { Cloud, Globe, Phone, Tool, Users, Wifi } from '../../../components/icons';
import { useTheme } from '../../../theme/useTheme';

interface TileProps {
  Icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
  label: string;
  tone?: 'default' | 'emerald';
}

/**
 * One tool tile in the "travel together" hero composition.
 *
 * @param props - {@link TileProps}.
 * @returns A surface card with the supplied icon + caption.
 */
const Tile: React.FC<TileProps> = ({ Icon, label, tone = 'default' }) => {
  const { theme } = useTheme();
  const isAccent = tone === 'emerald';
  const bg = isAccent ? theme.colors.emerald : theme.colors.surface;
  const iconColor = isAccent ? theme.colors.onEmerald : theme.colors.emeraldDeep;
  const labelColor = isAccent ? theme.colors.onEmerald : theme.colors.ink;
  return (
    <View style={[styles.tile, { backgroundColor: bg, borderRadius: theme.radii.md }]}>
      <Icon size={26} color={iconColor} stroke={1.9} />
      <Text
        numberOfLines={1}
        style={[styles.tileLabel, { color: labelColor, fontFamily: theme.fonts.mono }]}>
        {label}
      </Text>
    </View>
  );
};

/**
 * Hero illustration for the "travel together" slide — a 2-column grid of
 * tool tiles, with the "Nearby" tile painted emerald to surface the
 * social opt-in.
 *
 * @returns The composed illustration.
 */
const TravelIllustration: React.FC = () => (
  <View style={styles.illu}>
    <View style={styles.grid}>
      <Tile Icon={Globe} label="Currency" />
      <Tile Icon={Wifi} label="eSIM" />
      <Tile Icon={Cloud} label="Weather" />
      <Tile Icon={Phone} label="Emergency" />
      <Tile Icon={Users} label="Nearby" tone="emerald" />
      <Tile Icon={Tool} label="Toolbox" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  illu: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tile: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

export default TravelIllustration;
