// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { EASE_OUT, T_FAST } from '../../animations/motion';

export type ButtonVariant = 'primary' | 'ghost' | 'tonal' | 'ink' | 'text' | 'outline';
export type ButtonSize = 'default' | 'sm';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
  big?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

interface VariantStyle {
  background: string;
  color: string;
  borderColor: string;
  borderWidth: number;
}

/**
 * Resolves the v4 button palette for a variant against the active theme.
 *
 * @param variant - The button variant identifier.
 * @param colors - The active interface palette.
 * @returns A {@link VariantStyle} bundle.
 */
function resolveVariant(
  variant: ButtonVariant,
  colors: ReturnType<typeof useTheme>['theme']['colors'],
): VariantStyle {
  switch (variant) {
    case 'ghost':
      return { background: colors.surface, color: colors.ink, borderColor: 'transparent', borderWidth: 0 };
    case 'tonal':
      return {
        background: colors.emeraldSoft,
        color: colors.emeraldDeep,
        borderColor: 'transparent',
        borderWidth: 0,
      };
    case 'ink':
      return { background: colors.ink, color: colors.onEmerald, borderColor: 'transparent', borderWidth: 0 };
    case 'text':
      return {
        background: 'transparent',
        color: colors.emeraldDeep,
        borderColor: 'transparent',
        borderWidth: 0,
      };
    case 'outline':
      return {
        background: colors.surface,
        color: colors.ink,
        borderColor: colors.line,
        borderWidth: 1.5,
      };
    case 'primary':
    default:
      return {
        background: colors.emerald,
        color: colors.onEmerald,
        borderColor: 'transparent',
        borderWidth: 0,
      };
  }
}

/**
 * Pill-shaped v4 button. Supports six variants and a compact `sm` size.
 *
 * Resolves all colours from the active theme so it re-skins automatically
 * between light, dark and tonner. Press feedback is a tiny scale-down driven
 * by Reanimated.
 *
 * @param props - {@link ButtonProps}.
 * @returns A pressable rendering the labelled button.
 */
const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  icon,
  full = false,
  big = false,
  accessibilityLabel,
  style,
}) => {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);

  const handlePressIn = useCallback(() => {
    pressed.value = withTiming(1, { duration: T_FAST, easing: EASE_OUT });
  }, [pressed]);

  const handlePressOut = useCallback(() => {
    pressed.value = withTiming(0, { duration: T_FAST, easing: EASE_OUT });
  }, [pressed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

  const v = resolveVariant(variant, theme.colors);
  const isSm = size === 'sm';
  const padding = isSm
    ? { paddingVertical: 10, paddingHorizontal: 18 }
    : big
      ? { paddingVertical: 17, paddingHorizontal: 24 }
      : { paddingVertical: 15, paddingHorizontal: 24 };

  return (
    <Animated.View style={[animatedStyle, full && styles.fullWidth]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.base,
          padding,
          {
            backgroundColor: v.background,
            borderColor: v.borderColor,
            borderWidth: v.borderWidth,
            borderRadius: theme.radii.pill,
            opacity: disabled ? 0.5 : 1,
          },
          full && styles.fullWidth,
          style,
        ]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text
          style={[
            styles.label,
            {
              color: v.color,
              fontFamily: theme.fonts.display,
              fontSize: isSm ? 13 : big ? 16.5 : 15,
            },
          ]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  icon: {
    marginRight: 9,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default Button;
