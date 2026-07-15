// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 22;

/**
 * Clamps the given number between two inclusive bounds.
 *
 * @param value - The candidate number.
 * @param lo - The lower bound.
 * @param hi - The upper bound.
 * @returns The clamped value.
 */
function clamp(value: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(Math.max(value, lo), hi);
}

/**
 * Minimal Reanimated-driven slider — drag the thumb to change the value.
 *
 * @param props - {@link SliderProps}.
 * @returns A view with a thumb whose position is driven by a pan gesture.
 */
const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 1,
  onChange,
  accessibilityLabel,
  style,
}) => {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const usableWidth = Math.max(width - THUMB_SIZE, 0);
  const ratio = (value - min) / (max - min || 1);
  const offset = useSharedValue(clamp(ratio, 0, 1) * usableWidth);

  React.useEffect(() => {
    offset.value = withTiming(clamp(ratio, 0, 1) * usableWidth, { duration: 80 });
  }, [ratio, usableWidth, offset]);

  const commit = useCallback(
    (next: number) => {
      const ratioNext = usableWidth > 0 ? next / usableWidth : 0;
      onChange(min + ratioNext * (max - min));
    },
    [usableWidth, min, max, onChange],
  );

  const startX = useSharedValue(0);
  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = offset.value;
    })
    .onUpdate(e => {
      offset.value = clamp(startX.value + e.translationX, 0, usableWidth);
    })
    .onEnd(() => {
      runOnJS(commit)(offset.value);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: offset.value + THUMB_SIZE / 2,
  }));

  const onLayout = (e: LayoutChangeEvent): void => {
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={onLayout}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}>
      <View
        style={[styles.track, { backgroundColor: theme.colors.surface2, borderRadius: TRACK_HEIGHT / 2 }]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.emerald, borderRadius: TRACK_HEIGHT / 2 },
            fillStyle,
          ]}
        />
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.colors.emerald,
              borderColor: theme.colors.surface,
            },
            thumbStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_HEIGHT,
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 3,
    top: 0,
    left: 0,
  },
});

export default Slider;
