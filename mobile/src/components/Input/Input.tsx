// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

/**
 * Themed text input with optional label + helper text. The border switches
 * to the accent color while focused.
 *
 * @param props - {@link InputProps} extending react-native's `TextInputProps`.
 * @returns A `<View>` containing the label, input and helper text.
 */
const Input: React.FC<InputProps> = ({ label, helperText, containerStyle, ...rest }) => {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? theme.colors.emerald : theme.colors.line;
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.ink2,
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.xs,
            },
          ]}>
          {label.toLowerCase()}
        </Text>
      ) : null}
      <TextInput
        {...rest}
        onFocus={e => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={e => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.mute}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.bg,
            borderColor,
            color: theme.colors.ink,
            fontFamily: theme.fonts.display,
            fontSize: theme.fontSize.base,
            borderRadius: theme.radii.md,
          },
        ]}
      />
      {helperText ? (
        <Text
          style={[
            styles.helper,
            { color: theme.colors.mute, fontFamily: theme.fonts.display, fontSize: theme.fontSize.xs },
          ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    letterSpacing: 0.6,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  helper: {
    marginTop: 2,
  },
});

export default Input;
