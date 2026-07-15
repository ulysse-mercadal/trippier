// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type ChipVariant = 'default' | 'solid';

export interface ChipProps {
  label: string;
  active?: boolean;
  variant?: ChipVariant;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Pill chip. Active state paints the v4 emerald-soft fill and the deep
 * emerald label; the `solid` variant is the inverted "Saved" pill (ink fill,
 * white label).
 *
 * @param props - {@link ChipProps}.
 * @returns A pressable chip rendering the label.
 */
const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  variant = 'default',
  onPress,
  style,
}) => {
  const { theme } = useTheme();
  const isSolid = variant === 'solid';
  const backgroundColor = isSolid
    ? theme.colors.ink
    : active
      ? theme.colors.emeraldSoft
      : theme.colors.surface;
  const textColor = isSolid
    ? theme.colors.onEmerald
    : active
      ? theme.colors.emeraldDeep
      : theme.colors.ink2;
  const borderColor = isSolid || active ? 'transparent' : theme.colors.line;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: isSolid || active ? 0 : 1.5,
          borderRadius: theme.radii.pill,
        },
        style,
      ]}>
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontFamily: theme.fonts.display,
            fontWeight: active || isSolid ? '600' : '500',
          },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13.5,
    lineHeight: 18,
    letterSpacing: -0.05,
    // Android adds asymmetric font padding that pushes the label up and clips
    // ascenders/accents; drop it and centre the glyph in an explicit line box
    // so the label renders fully inside the pill.
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default Chip;
