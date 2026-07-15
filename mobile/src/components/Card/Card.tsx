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

export type CardVariant = 'default' | 'flat';

export interface CardProps {
  variant?: CardVariant;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Workhorse surface of the v4 kit — white, 22px radius, soft `e1` shadow.
 *
 * `flat` variant drops the shadow in favour of a hairline outline. Children
 * are rendered without padding so the card can host a media header or a
 * `CardBody` slot for inset content.
 *
 * @param props - {@link CardProps}.
 * @returns A view enclosing its children with the active card chrome.
 */
const Card: React.FC<CardProps> = ({ variant = 'default', children, style }) => {
  const { theme } = useTheme();
  const isFlat = variant === 'flat';
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.line,
          borderWidth: isFlat ? 1 : 0,
        },
        isFlat ? null : theme.shadows.e1,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default Card;
