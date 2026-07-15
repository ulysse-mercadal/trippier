// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Search as SearchIcon } from '../icons';

export interface SearchProps extends Omit<TextInputProps, 'style'> {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  readOnly?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/**
 * Pill search field with elevation. Renders an inline leading icon and an
 * optional trailing slot (avatar, mic, close button…).
 *
 * When `readOnly` is true the input becomes pointer-transparent and the
 * surrounding pressable forwards taps via `onPress` — this is the mode used
 * by the Discover closed state, where the bar acts as a launcher into the
 * expanded enclosure.
 *
 * @param props - {@link SearchProps}.
 * @returns A row composing the search pill.
 */
const Search: React.FC<SearchProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  leading,
  trailing,
  onPress,
  readOnly = false,
  accessibilityLabel,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="search"
      accessibilityLabel={accessibilityLabel ?? placeholder}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.pill,
        },
        theme.shadows.e2,
        style,
      ]}>
      <View style={styles.icon}>
        {leading ?? <SearchIcon size={19} color={theme.colors.ink} />}
      </View>
      <TextInput
        {...rest}
        value={value}
        onChangeText={onChangeText}
        editable={!readOnly}
        pointerEvents={readOnly ? 'none' : 'auto'}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mute}
        style={[
          styles.input,
          {
            color: theme.colors.ink,
            fontFamily: theme.fonts.display,
          },
        ]}
      />
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.15,
    padding: 0,
  },
  trailing: {
    flexShrink: 0,
  },
});

export default Search;
