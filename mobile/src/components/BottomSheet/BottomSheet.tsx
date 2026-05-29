// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';

export interface BottomSheetProps {
  snapPoints?: number[];
  initialSnap?: number;
  onSnapChange?: (index: number) => void;
  children: React.ReactNode;
}

const DEFAULT_SNAP_POINTS = [84, 360, 720];
const MOMENTUM_THRESHOLD = 0.3;

/**
 * Picks the closest snap point index given the current translateY value
 * and an optional momentum hint computed from gesture velocity.
 *
 * @param positions - The translateY positions of each snap point.
 * @param current - The current translateY value.
 * @param momentum - Signed velocity hint (positive = downward swipe).
 * @returns The snap-point index closest to `current`.
 */
export function pickSnapIndex(positions: number[], current: number, momentum: number): number {
  'worklet';
  const biased = current + momentum;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < positions.length; i++) {
    const d = Math.abs(positions[i] - biased);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Reanimated-driven bottom sheet with N snap points and momentum-aware
 * pan-gesture snapping. No `@gorhom/bottom-sheet` dependency.
 *
 * @param props - {@link BottomSheetProps}.
 * @returns A floating sheet whose height matches the active snap point.
 */
const BottomSheet: React.FC<BottomSheetProps> = ({
  snapPoints = DEFAULT_SNAP_POINTS,
  initialSnap = 0,
  onSnapChange,
  children,
}) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get('window').height;
  const positions = snapPoints.map(h => screenHeight - h);
  const translateY = useSharedValue(positions[initialSnap] ?? positions[0]);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(positions[initialSnap] ?? positions[0], {
      damping: 22,
      stiffness: 180,
    });
  }, [initialSnap, translateY, positions]);

  const notify = useCallback(
    (idx: number) => {
      onSnapChange?.(idx);
    },
    [onSnapChange],
  );

  const pan = Gesture.Pan()
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate(e => {
      translateY.value = Math.min(
        Math.max(startY.value + e.translationY, positions[positions.length - 1]),
        positions[0],
      );
    })
    .onEnd(e => {
      const momentum = e.velocityY * MOMENTUM_THRESHOLD;
      const idx = pickSnapIndex(positions, translateY.value, momentum);
      translateY.value = withSpring(positions[idx], { damping: 22, stiffness: 180 });
      runOnJS(notify)(idx);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.line,
          borderTopLeftRadius: theme.radii.xl,
          borderTopRightRadius: theme.radii.xl,
        },
        sheetStyle,
      ]}>
      <GestureDetector gesture={pan}>
        <View style={styles.handleArea} accessibilityRole="adjustable">
          <View style={[styles.handle, { backgroundColor: theme.colors.line }]} />
        </View>
      </GestureDetector>
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
  handleArea: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});

export default BottomSheet;
