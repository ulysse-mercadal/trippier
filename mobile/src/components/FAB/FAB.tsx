// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type FABVariant = 'default' | 'surface';
export type FABSize = 'default' | 'sm';

export interface FABProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: FABVariant;
  size?: FABSize;
  accessibilityLabel: string;
  style?: ViewStyle;
}

/**
 * Floating action button. The `default` variant fills with emerald (white
 * icon child); `surface` keeps the white panel — used for stacked map
 * controls (layers, locate-me) where you don't want a big accent moment.
 *
 * @param props - {@link FABProps}.
 * @returns A pressable rendering the floating control.
 */
const FAB: React.FC<FABProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  accessibilityLabel,
  style,
}) => {
  const { theme } = useTheme();
  const isSurface = variant === 'surface';
  const isSm = size === 'sm';
  const dim = isSm ? 46 : 56;
  const radius = isSm ? 16 : 20;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: radius,
          backgroundColor: isSurface ? theme.colors.surface : theme.colors.emerald,
        },
        theme.shadows.e3,
        style,
      ]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FAB;
