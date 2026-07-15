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
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { usePulse } from '../../animations/motion';

export interface LiveBadgeProps {
  label?: string;
}

/**
 * Live indicator: a pulsing accent dot + mono label inside a soft pill.
 *
 * @param props - {@link LiveBadgeProps}.
 * @returns The animated badge view.
 */
const LiveBadge: React.FC<LiveBadgeProps> = ({ label = 'live' }) => {
  const { theme } = useTheme();
  const pulseStyle = usePulse(0.3, 1, 1000);
  return (
    <View
      style={[
        styles.base,
        {
          borderColor: theme.colors.line,
          backgroundColor: theme.colors.surface,
        },
      ]}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: theme.colors.emerald,
          },
          pulseStyle,
        ]}
      />
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.ink2,
            fontFamily: theme.fonts.mono,
            fontSize: theme.fontSize.sm,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 999,
    alignSelf: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    letterSpacing: 0.2,
  },
});

export default LiveBadge;
