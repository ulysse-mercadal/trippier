// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type IconButtonVariant = 'default' | 'flat' | 'tonal';

export interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: IconButtonVariant;
  active?: boolean;
  showBadge?: boolean;
  accessibilityLabel: string;
  style?: ViewStyle;
}

/**
 * Round 42px icon button with a hairline outline + soft shadow.
 *
 * Variants: `default` (surface + line + e1), `flat` (transparent, in-flow
 * affordance such as a back arrow) and `tonal` (emerald-soft fill, no shadow).
 *
 * @param props - {@link IconButtonProps}.
 * @returns A pressable rendering the icon child.
 */
const IconButton: React.FC<IconButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  active = false,
  showBadge = false,
  accessibilityLabel,
  style,
}) => {
  const { theme } = useTheme();
  const isFlat = variant === 'flat';
  const isTonal = variant === 'tonal' || active;
  const backgroundColor = isFlat
    ? 'transparent'
    : isTonal
      ? theme.colors.emeraldSoft
      : theme.colors.surface;
  const borderColor = isFlat || isTonal ? 'transparent' : theme.colors.line;
  const shadow = isFlat || isTonal ? null : theme.shadows.e1;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: isFlat || isTonal ? 0 : 1,
        },
        shadow,
        style,
      ]}>
      {children}
      {showBadge ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.emerald,
              borderColor: theme.colors.surface,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});

export default IconButton;
