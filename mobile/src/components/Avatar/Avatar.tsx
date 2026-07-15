// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
}

/**
 * Computes the two-letter initials used inside the avatar placeholder.
 *
 * @param name - The full display name.
 * @returns The uppercase initials (max 2 characters).
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '??';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Circular avatar showing two letters on a soft emerald background.
 *
 * Matches the v4 `.m-search .avatar` mini variant: emerald-soft fill, deep
 * emerald text, no border. Sized via the `size` prop (defaults to 40px).
 *
 * @param props - {@link AvatarProps}.
 * @returns A circular view rendering the initials.
 */
const Avatar: React.FC<AvatarProps> = ({ name, size = 40, style }) => {
  const { theme } = useTheme();
  const initials = useMemo(() => getInitials(name), [name]);
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.emeraldSoft,
        },
        style,
      ]}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.emeraldDeep,
            fontFamily: theme.fonts.display,
            fontSize: Math.max(11, size * 0.36),
          },
        ]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

export default Avatar;
