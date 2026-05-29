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
import TitleDot from '../TitleDot';
import { useTheme } from '../../theme/useTheme';

export interface AppBarProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showDot?: boolean;
  style?: ViewStyle;
}

/**
 * v4 `.m-appbar` — large screen heading with optional subtitle and slots for
 * a leading action (typically a back button) and a trailing action group.
 *
 * The title ends with the emerald {@link TitleDot} unless explicitly disabled.
 *
 * @param props - {@link AppBarProps}.
 * @returns A row composing the bar.
 */
const AppBar: React.FC<AppBarProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  showDot = true,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, style]}>
      {leading ? <View style={styles.slot}>{leading}</View> : null}
      <View style={styles.titles}>
        <Text
          style={[
            styles.h1,
            {
              color: theme.colors.ink,
              fontFamily: theme.fonts.display,
            },
          ]}>
          {title}
          {showDot ? <TitleDot /> : null}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.sub,
              {
                color: theme.colors.mute,
                fontFamily: theme.fonts.mono,
              },
            ]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.slot}>{trailing}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  slot: {
    flexShrink: 0,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  h1: {
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: -0.78,
    lineHeight: 26,
  },
  sub: {
    fontSize: 12.5,
    marginTop: 5,
    letterSpacing: 0.05,
  },
});

export default AppBar;
