// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { Children, isValidElement } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface ListProps {
  children?: React.ReactNode;
  flat?: boolean;
  style?: ViewStyle;
}

/**
 * Rounded grouped container holding {@link ListItem} children.
 *
 * Renders a hairline divider between consecutive children. The `flat`
 * variant trades the soft `e1` shadow for a thin line outline (e.g. nested
 * inside another surface).
 *
 * @param props - {@link ListProps}.
 * @returns A view enclosing the rows.
 */
const List: React.FC<ListProps> = ({ children, flat = false, style }) => {
  const { theme } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderColor: theme.colors.line,
          borderWidth: flat ? 1 : 0,
        },
        flat ? null : theme.shadows.e1,
        style,
      ]}>
      {items.map((child, idx) => (
        <View
          key={idx}
          style={
            idx === 0
              ? null
              : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.line }
          }>
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export default List;
