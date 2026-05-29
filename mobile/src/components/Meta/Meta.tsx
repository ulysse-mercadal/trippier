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

export interface MetaProps {
  children: React.ReactNode;
  style?: TextStyle;
}

/**
 * Small muted caption rendered in the v4 mono face — used for distances,
 * timestamps and any low-emphasis row of meta data.
 *
 * @param props - {@link MetaProps}.
 * @returns A `<Text>` element rendering the meta line.
 */
const Meta: React.FC<MetaProps> = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.base,
        {
          color: theme.colors.mute,
          fontFamily: theme.fonts.mono,
        },
        style,
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontSize: 12.5,
    letterSpacing: 0.05,
  },
});

export default Meta;
