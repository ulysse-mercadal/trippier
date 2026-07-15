// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Meta from '../../components/Meta';
import { useTheme } from '../../theme/useTheme';

export interface ToolTileProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

/**
 * Single 2-column grid tile rendered in the Tools screen.
 *
 * Pairs an emerald-soft 44px badge holding the tool icon with a bottom-aligned
 * title and meta line, all wrapped in a default {@link Card}. The whole tile
 * is pressable so the parent can wire it to a stub or real handler.
 *
 * @param props - {@link ToolTileProps}.
 * @returns The rendered tool tile.
 */
const ToolTile: React.FC<ToolTileProps> = ({ icon, title, subtitle, onPress }) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={styles.outer}>
      <Card style={styles.card}>
        <View style={styles.inner}>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.emeraldSoft },
            ]}>
            {icon}
          </View>
          <View style={styles.foot}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              {title}
            </Text>
            <Meta style={styles.meta}>{subtitle}</Meta>
          </View>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '48%',
  },
  card: {
    minHeight: 124,
  },
  inner: {
    padding: 16,
    flex: 1,
    minHeight: 124,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foot: {
    marginTop: 'auto',
    paddingTop: 14,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  meta: {
    marginTop: 3,
  },
});

export default ToolTile;
