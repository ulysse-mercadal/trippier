// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface CardMediaProps {
  height?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Media slot for a {@link Card} — holds an image, illustration or static map
 * preview. Always sits at the top edge of the card and tints its empty
 * background with `emeraldSoft` so it never looks empty during loading.
 *
 * The bottom fade gradient seen on the web spec is intentionally omitted on
 * live map content; consumers can layer it manually for presentational media.
 *
 * @param props - {@link CardMediaProps}.
 * @returns A view enclosing the media child.
 */
const CardMedia: React.FC<CardMediaProps> = ({ height = 180, children, style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          height,
          backgroundColor: theme.colors.emeraldSoft,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
});

export default CardMedia;
