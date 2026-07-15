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

export interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * macOS-style terminal with title bar + 3 colored dots + mono content slot.
 *
 * @param props - {@link TerminalProps}.
 * @returns A styled `<View>` containing the title bar and body.
 */
const Terminal: React.FC<TerminalProps> = ({ title = 'trippier ~', children, style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.line,
          borderRadius: theme.radii.lg,
        },
        style,
      ]}>
      <View style={[styles.bar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.line }]}>
        <View style={[styles.dot, { backgroundColor: theme.colors.ink }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.ink2 }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.emerald }]} />
        <Text
          style={[
            styles.title,
            { color: theme.colors.mute, fontFamily: theme.fonts.mono, fontSize: theme.fontSize.sm },
          ]}>
          {title}
        </Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  title: {
    marginLeft: 12,
  },
  body: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
});

export default Terminal;
