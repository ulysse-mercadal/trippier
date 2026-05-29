// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface TitleDotProps {
  style?: TextStyle;
  color?: string;
}

/**
 * Renders the emerald period that ends every v4 screen title — the signature
 * accent moment of the design system.
 *
 * On the `tonner` interface the underlying token collapses to black, so the
 * same component renders monochrome with zero markup branching. When a
 * `color` override is provided (e.g. by the Welcome preview that ignores the
 * currently applied theme), the override wins.
 *
 * @param props - {@link TitleDotProps}.
 * @returns A `<Text>` painting an emerald period.
 */
const TitleDot: React.FC<TitleDotProps> = ({ style, color }) => {
  const { theme } = useTheme();
  return <Text style={[{ color: color ?? theme.colors.emerald }, style]}>.</Text>;
};

export default TitleDot;
