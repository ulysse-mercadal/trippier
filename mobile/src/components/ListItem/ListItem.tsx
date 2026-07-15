// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface ListItemProps {
  name: string;
  meta?: string;
  thumb?: React.ReactNode;
  thumbEmerald?: boolean;
  trail?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * v4 `.m-item` — a row with a rounded thumb, a body (name + optional meta)
 * and a trailing slot for a chevron / icon / mini status.
 *
 * The `thumbEmerald` flag tints the thumb background with `emeraldSoft` for
 * accent rows (e.g. "saved" entries, AI suggestions).
 *
 * @param props - {@link ListItemProps}.
 * @returns A pressable row.
 */
const ListItem: React.FC<ListItemProps> = ({
  name,
  meta,
  thumb,
  thumbEmerald = false,
  trail,
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={meta ? `${name}, ${meta}` : name}
      style={[styles.row, style]}>
      {thumb ? (
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: thumbEmerald ? theme.colors.emeraldSoft : theme.colors.surface2,
            },
          ]}>
          {thumb}
        </View>
      ) : null}
      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: theme.colors.ink,
              fontFamily: theme.fonts.display,
            },
          ]}>
          {name}
        </Text>
        {meta ? (
          <Text
            numberOfLines={1}
            style={[
              styles.meta,
              {
                color: theme.colors.mute,
                fontFamily: theme.fonts.mono,
              },
            ]}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trail ? <View style={styles.trail}>{trail}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  thumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: -0.24,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12.5,
    marginTop: 4,
    letterSpacing: 0.05,
  },
  trail: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
});

export default ListItem;
