// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface EyebrowProps {
  children: string;
  style?: TextStyle;
}

/**
 * Small accent-colored mono uppercase label used above section headings.
 *
 * @param props - {@link EyebrowProps}.
 * @returns A `<Text>` element rendering the label.
 */
const Eyebrow: React.FC<EyebrowProps> = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.base,
        {
          color: theme.colors.emerald,
          fontFamily: theme.fonts.mono,
          fontSize: theme.fontSize.sm,
        },
        style,
      ]}>
      {children.toLowerCase()}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    letterSpacing: 0.6,
  },
});

export default Eyebrow;
