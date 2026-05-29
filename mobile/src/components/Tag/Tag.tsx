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
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { usePulse } from '../../animations/motion';

export type TagVariant = 'default' | 'emerald' | 'ink';

export interface TagProps {
  children: string;
  variant?: TagVariant;
  dot?: boolean;
  pulse?: boolean;
  style?: ViewStyle;
}

interface Palette {
  background: string;
  color: string;
}

/**
 * Maps a tag variant to the active palette colours.
 *
 * @param variant - The tag variant identifier.
 * @param colors - The active interface palette.
 * @returns A {@link Palette} pair (background + foreground).
 */
function resolvePalette(
  variant: TagVariant,
  colors: ReturnType<typeof useTheme>['theme']['colors'],
): Palette {
  switch (variant) {
    case 'emerald':
      return { background: colors.emeraldSoft, color: colors.emeraldDeep };
    case 'ink':
      return { background: colors.ink, color: '#ffffff' };
    case 'default':
    default:
      return { background: colors.surface2, color: colors.ink2 };
  }
}

/**
 * Small status pill — used for "Live", "Booked", "Saved" badges.
 *
 * Renders an optional leading dot which can pulse (via `usePulse`) when the
 * tag represents a live/animated state.
 *
 * @param props - {@link TagProps}.
 * @returns A row rendering the tag.
 */
const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  dot = false,
  pulse = false,
  style,
}) => {
  const { theme } = useTheme();
  const palette = resolvePalette(variant, theme.colors);
  const pulseStyle = usePulse(0.35, 1, 900);

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette.background,
          borderRadius: theme.radii.pill,
        },
        style,
      ]}>
      {dot ? (
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: palette.color },
            pulse ? pulseStyle : null,
          ]}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          {
            color: palette.color,
            fontFamily: theme.fonts.display,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default Tag;
