// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { SharedValue } from 'react-native-reanimated';
import { Compass, Route, Users, Grid, User } from '../icons';
import type { IconProps } from '../icons';
import { useTheme } from '../../theme/useTheme';

interface TabConfig {
  routeName: string;
  label: string;
  Icon: React.FC<IconProps>;
  labelWidth: number;
}

const TABS: TabConfig[] = [
  { routeName: 'Discover', label: 'Discover', Icon: Compass, labelWidth: 64 },
  { routeName: 'Plan', label: 'Plan', Icon: Route, labelWidth: 30 },
  { routeName: 'Friends', label: 'Friends', Icon: Users, labelWidth: 52 },
  { routeName: 'Tools', label: 'Tools', Icon: Grid, labelWidth: 36 },
  { routeName: 'You', label: 'You', Icon: User, labelWidth: 26 },
];

const PAD_X = 14;
const ICON_W = 20;
const ICON_GAP = 6;
const PILL_HEIGHT = 44;
const INACTIVE_WIDTH = PAD_X + ICON_W + PAD_X;
const BAR_PADDING = 6;
const MIN_GAP = 4;
const ANIM_DURATION = 280;
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

/**
 * Computes the active (icon + label) cell width for a tab.
 *
 * @param config - The {@link TabConfig}.
 * @returns The cell width when the tab is the active one.
 */
function activeWidthFor(config: TabConfig): number {
  return PAD_X + ICON_W + ICON_GAP + config.labelWidth + PAD_X;
}

const MAX_ACTIVE_WIDTH = Math.max(...TABS.map(activeWidthFor));
const BAR_CONTENT_WIDTH =
  MAX_ACTIVE_WIDTH + (TABS.length - 1) * INACTIVE_WIDTH + (TABS.length - 1) * MIN_GAP;
const BAR_TOTAL_WIDTH = BAR_CONTENT_WIDTH + 2 * BAR_PADDING;

interface CellLayout {
  left: number;
  width: number;
}

/**
 * Resolves the absolute positions and widths for every cell in the bar,
 * given which tab is active. The bar total content width is constant
 * ({@link BAR_CONTENT_WIDTH}); the leftover space between cells expands
 * to absorb the difference between the active label and the largest one.
 *
 * @param activeIdx - The currently focused route index.
 * @returns Per-cell layout entries in the same order as {@link TABS}.
 */
function computeLayout(activeIdx: number): CellLayout[] {
  const activeW = activeWidthFor(TABS[activeIdx]);
  const slots = TABS.length - 1;
  const gap = (BAR_CONTENT_WIDTH - activeW - slots * INACTIVE_WIDTH) / slots;
  const cells: CellLayout[] = [];
  let x = 0;
  for (let i = 0; i < TABS.length; i++) {
    const w = i === activeIdx ? activeW : INACTIVE_WIDTH;
    cells.push({ left: x, width: w });
    x += w + gap;
  }
  return cells;
}

interface TabCellProps {
  config: TabConfig;
  focused: boolean;
  left: SharedValue<number>;
  width: SharedValue<number>;
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * Absolutely-positioned pressable cell. Reads its left + width from the
 * parent's shared values so the bar layout stays a single source of truth.
 *
 * Icon is anchored to the left padding so it stays put as the cell
 * resizes; the label rides on the same row and fades in only when the
 * cell is the active one.
 *
 * @param props - {@link TabCellProps}.
 * @returns The animated cell.
 */
const TabCell: React.FC<TabCellProps> = ({
  config,
  focused,
  left,
  width,
  onPress,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const labelProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    labelProgress.value = withTiming(focused ? 1 : 0, {
      duration: ANIM_DURATION,
      easing: EASE,
    });
  }, [focused, labelProgress]);

  const cellStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: left.value }],
    width: width.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
  }));

  const Icon = config.Icon;
  const tint = focused ? theme.colors.onEmerald : theme.colors.mute;

  return (
    <Animated.View style={[styles.cellAbsolute, cellStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        hitSlop={6}
        style={styles.cellInner}>
        <Icon size={ICON_W} stroke={focused ? 2.1 : 1.8} color={tint} />
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            { color: tint, fontFamily: theme.fonts.display, width: config.labelWidth },
            labelStyle,
          ]}>
          {config.label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Floating tab bar with a fixed total width. Cells are absolutely
 * positioned inside; on tab change they slide to their new positions and
 * the active one expands to fit its label while every other cell stays
 * at its icon-only size. The emerald indicator chip slides + resizes
 * independently.
 *
 * @param props - {@link BottomTabBarProps} forwarded by React Navigation.
 * @returns The rendered tab bar.
 */
const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const activeIdx = state.index;

  const targets = useMemo(() => computeLayout(activeIdx), [activeIdx]);

  const l0 = useSharedValue(targets[0].left);
  const l1 = useSharedValue(targets[1].left);
  const l2 = useSharedValue(targets[2].left);
  const l3 = useSharedValue(targets[3].left);
  const l4 = useSharedValue(targets[4].left);
  const w0 = useSharedValue(targets[0].width);
  const w1 = useSharedValue(targets[1].width);
  const w2 = useSharedValue(targets[2].width);
  const w3 = useSharedValue(targets[3].width);
  const w4 = useSharedValue(targets[4].width);
  const indicatorLeft = useSharedValue(targets[activeIdx].left);
  const indicatorWidth = useSharedValue(targets[activeIdx].width);

  const lefts = useMemo(() => [l0, l1, l2, l3, l4], [l0, l1, l2, l3, l4]);
  const widths = useMemo(() => [w0, w1, w2, w3, w4], [w0, w1, w2, w3, w4]);

  useEffect(() => {
    const timing = { duration: ANIM_DURATION, easing: EASE };
    lefts.forEach((sv, i) => {
      sv.value = withTiming(targets[i].left, timing);
    });
    widths.forEach((sv, i) => {
      sv.value = withTiming(targets[i].width, timing);
    });
    indicatorLeft.value = withTiming(targets[activeIdx].left, timing);
    indicatorWidth.value = withTiming(targets[activeIdx].width, timing);
  }, [targets, activeIdx, indicatorLeft, indicatorWidth, lefts, widths]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorLeft.value }],
    width: indicatorWidth.value,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
      ]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.pill,
          },
          theme.shadows.e2,
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.emerald,
              borderRadius: theme.radii.pill,
            },
            indicatorStyle,
          ]}
        />
        {state.routes.map((route, index) => {
          const config = TABS.find(t => t.routeName === route.name);
          if (!config) {
            return null;
          }
          const focused = activeIdx === index;
          const descriptor = descriptors[route.key];
          const accessibilityLabel =
            descriptor?.options.tabBarAccessibilityLabel ?? config.label;

          const onPress = (): void => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabCell
              key={route.key}
              config={config}
              focused={focused}
              left={lefts[index]}
              width={widths[index]}
              onPress={onPress}
              accessibilityLabel={accessibilityLabel}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    width: BAR_TOTAL_WIDTH,
    height: PILL_HEIGHT + 2 * BAR_PADDING,
    paddingVertical: BAR_PADDING,
    paddingHorizontal: BAR_PADDING,
  },
  indicator: {
    position: 'absolute',
    left: BAR_PADDING,
    top: BAR_PADDING,
    height: PILL_HEIGHT,
  },
  cellAbsolute: {
    position: 'absolute',
    left: BAR_PADDING,
    top: BAR_PADDING,
    height: PILL_HEIGHT,
  },
  cellInner: {
    flex: 1,
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: PAD_X,
    gap: ICON_GAP,
    overflow: 'hidden',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
});

export default TabBar;
