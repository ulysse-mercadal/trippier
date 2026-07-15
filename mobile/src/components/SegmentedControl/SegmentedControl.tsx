// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import { EASE_OUT, T_BASE } from '../../animations/motion';

export interface SegmentedControlProps<T extends string = string> {
  segments: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labelFor?: (value: T) => string;
  style?: ViewStyle;
}

/**
 * v4 `.m-seg` — horizontal pill container with an emerald-soft active pill
 * that slides between segments.
 *
 * @typeParam T - Union string type of segment ids.
 * @param props - {@link SegmentedControlProps}.
 * @returns A row of pressable segments with a sliding highlight pill.
 */
function SegmentedControl<T extends string = string>({
  segments,
  value,
  onChange,
  labelFor,
  style,
}: SegmentedControlProps<T>): React.ReactElement {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const idx = Math.max(0, segments.indexOf(value));
  const indicator = useSharedValue(idx);

  useEffect(() => {
    indicator.value = withTiming(idx, { duration: T_BASE, easing: EASE_OUT });
  }, [idx, indicator]);

  const innerWidth = Math.max(width - 8, 0);
  const segmentWidth = segments.length > 0 ? innerWidth / segments.length : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicator.value * segmentWidth }],
    width: segmentWidth,
  }));

  const onLayout = (e: LayoutChangeEvent): void => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface2,
          borderRadius: theme.radii.pill,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.pill,
          },
          theme.shadows.e1,
          animatedStyle,
        ]}
      />
      {segments.map(seg => {
        const focused = seg === value;
        return (
          <Pressable
            key={seg}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            onPress={() => onChange(seg)}
            style={styles.segment}>
            <Text
              style={{
                color: focused ? theme.colors.emeraldDeep : theme.colors.ink2,
                fontFamily: theme.fonts.display,
                fontSize: 13,
                fontWeight: '600',
              }}>
              {labelFor ? labelFor(seg) : seg}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    position: 'relative',
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
  },
});

export default SegmentedControl;
