// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export interface StampCellProps {
  code: string;
  active?: boolean;
}

/**
 * Single rounded country-code stamp shown in the 4×2 grid of the You screen.
 *
 * Active cells get the emerald-soft fill + emerald-deep code, idle cells
 * sit on the regular surface with ink text.
 *
 * @param props - {@link StampCellProps}.
 * @returns The rendered stamp cell.
 */
const StampCell: React.FC<StampCellProps> = ({ code, active = false }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.cell,
        {
          backgroundColor: active ? theme.colors.emeraldSoft : theme.colors.surface,
          borderRadius: 16,
        },
        theme.shadows.e1,
      ]}>
      <Text
        style={[
          styles.code,
          {
            color: active ? theme.colors.emeraldDeep : theme.colors.ink,
            fontFamily: theme.fonts.display,
          },
        ]}>
        {code}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.4,
  },
});

export default StampCell;
