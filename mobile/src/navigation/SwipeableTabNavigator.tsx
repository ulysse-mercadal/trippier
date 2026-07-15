// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  TabActions,
  TabRouter,
  createNavigatorFactory,
  useNavigationBuilder,
} from '@react-navigation/native';
import type {
  DefaultNavigatorOptions,
  ParamListBase,
  TabActionHelpers,
  TabNavigationState,
  TabRouterOptions,
} from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Subset of {@link BottomTabNavigationOptions} the custom swipeable navigator
 * honours. Visual chrome is owned by the supplied `tabBar` renderer; the
 * `swipeEnabled` flag lets individual screens opt out of the horizontal pan
 * (used by Discover so the MapLibre pan/zoom isn't fighting the navigator).
 */
export interface SwipeableTabNavigationOptions {
  tabBarAccessibilityLabel?: string;
  swipeEnabled?: boolean;
}

/**
 * Events emitted by the swipeable tab navigator. Mirrors the surface area of
 * `@react-navigation/bottom-tabs` so an existing tab-bar component can be
 * reused as-is.
 */
export interface SwipeableTabNavigationEventMap {
  tabPress: { data: undefined; canPreventDefault: true };
  tabLongPress: { data: undefined };
  swipeStart: { data: undefined };
  swipeEnd: { data: undefined };
  [key: string]: { data: unknown; canPreventDefault?: boolean };
}

/**
 * Props passed to the user-supplied tab-bar renderer. The shape matches the
 * three fields the existing project `TabBar` reads, with the descriptor map
 * narrowed to the options this navigator understands.
 */
type NavigationBuilderResult = ReturnType<
  typeof useNavigationBuilder<
    TabNavigationState<ParamListBase>,
    TabRouterOptions,
    TabActionHelpers<ParamListBase>,
    SwipeableTabNavigationOptions,
    SwipeableTabNavigationEventMap
  >
>;

type SwipeableTabNavigation = NavigationBuilderResult['navigation'];
type SwipeableTabDescriptorMap = NavigationBuilderResult['descriptors'];

export interface SwipeableTabBarProps {
  state: TabNavigationState<ParamListBase>;
  descriptors: SwipeableTabDescriptorMap;
  navigation: SwipeableTabNavigation;
}

interface SwipeableTabNavigatorOwnProps {
  tabBar: (props: SwipeableTabBarProps) => React.ReactNode;
}

type SwipeableTabNavigatorProps = SwipeableTabNavigatorOwnProps &
  DefaultNavigatorOptions<
    ParamListBase,
    TabNavigationState<ParamListBase>,
    SwipeableTabNavigationOptions,
    SwipeableTabNavigationEventMap
  > &
  TabRouterOptions;

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const ACTIVATION_THRESHOLD = 14;
const TIMING_DURATION = 280;

/**
 * Inner view rendering all routes in a single horizontal row and driving the
 * row's `translateX` from a pan gesture. The row width is exactly
 * `routes.length × screen width`; the active route is always the column
 * fully visible at `translateX = -index × screenWidth`.
 *
 * While the user drags, neighbouring columns are revealed at the swipe edge
 * — this is the "preview" the bottom tab navigator could never give. On
 * release we snap to the nearest column (with velocity bias) and emit the
 * matching `jumpTo` action so React Navigation state stays the source of
 * truth.
 *
 * @param props - {@link SwipeableTabBarProps} forwarded by the navigator.
 * @returns The horizontal pager + chrome tab bar.
 */
const SwipeableTabView: React.FC<
  SwipeableTabBarProps & { tabBar: SwipeableTabNavigatorOwnProps['tabBar'] }
> = ({ state, descriptors, navigation, tabBar }) => {
  const { width: screenWidth } = useWindowDimensions();
  const routeCount = state.routes.length;
  const activeIndex = state.index;

  const translateX = useSharedValue(-activeIndex * screenWidth);
  const startX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(-activeIndex * screenWidth, {
      duration: TIMING_DURATION,
    });
  }, [activeIndex, screenWidth, translateX]);

  const jumpToIndex = useCallback(
    (index: number) => {
      const route = state.routes[index];
      if (!route || index === state.index) {
        return;
      }
      navigation.dispatch({
        ...TabActions.jumpTo(route.name),
        target: state.key,
      });
    },
    [navigation, state],
  );

  const activeRoute = state.routes[activeIndex];
  const swipeEnabled =
    descriptors[activeRoute.key]?.options.swipeEnabled !== false;

  const pan = Gesture.Pan()
    .enabled(swipeEnabled)
    .activeOffsetX([-ACTIVATION_THRESHOLD, ACTIVATION_THRESHOLD])
    .failOffsetY([-ACTIVATION_THRESHOLD, ACTIVATION_THRESHOLD])
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
    })
    .onUpdate(event => {
      'worklet';
      const maxX = 0;
      const minX = -(routeCount - 1) * screenWidth;
      const next = startX.value + event.translationX;
      translateX.value = Math.max(minX, Math.min(maxX, next));
    })
    .onEnd(event => {
      'worklet';
      let nextIndex = activeIndex;
      const dx = event.translationX;
      const vx = event.velocityX;
      if (dx <= -SWIPE_DISTANCE || vx <= -SWIPE_VELOCITY) {
        nextIndex = Math.min(routeCount - 1, activeIndex + 1);
      } else if (dx >= SWIPE_DISTANCE || vx >= SWIPE_VELOCITY) {
        nextIndex = Math.max(0, activeIndex - 1);
      }
      translateX.value = withTiming(-nextIndex * screenWidth, {
        duration: TIMING_DURATION,
      });
      if (nextIndex !== activeIndex) {
        runOnJS(jumpToIndex)(nextIndex);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.row,
            { width: screenWidth * routeCount },
            rowStyle,
          ]}>
          {state.routes.map(route => {
            const descriptor = descriptors[route.key];
            return (
              <View
                key={route.key}
                style={[styles.column, { width: screenWidth }]}
                collapsable={false}>
                {descriptor.render()}
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>
      {tabBar({ state, descriptors, navigation })}
    </View>
  );
};

/**
 * Custom React Navigation tab navigator with horizontal swipe + preview.
 *
 * Built with {@link useNavigationBuilder} + {@link TabRouter} so it exposes
 * the same navigation surface as `@react-navigation/bottom-tabs`: deep
 * linking, `useFocusEffect`, `navigation.navigate('OtherTab')`, etc. all
 * keep working. The only difference is the rendering layer — see
 * {@link SwipeableTabView}.
 *
 * @param props - {@link SwipeableTabNavigatorProps}.
 * @returns The navigator component.
 */
function SwipeableTabNavigator({
  initialRouteName,
  children,
  screenOptions,
  tabBar,
  ...rest
}: SwipeableTabNavigatorProps): React.JSX.Element {
  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      TabNavigationState<ParamListBase>,
      TabRouterOptions,
      TabActionHelpers<ParamListBase>,
      SwipeableTabNavigationOptions,
      SwipeableTabNavigationEventMap
    >(TabRouter, {
      children,
      screenOptions,
      initialRouteName,
      ...rest,
    });

  return (
    <NavigationContent>
      <SwipeableTabView
        state={state}
        descriptors={descriptors}
        navigation={navigation}
        tabBar={tabBar}
      />
    </NavigationContent>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
});

export const createSwipeableTabNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  SwipeableTabNavigationOptions,
  SwipeableTabNavigationEventMap,
  typeof SwipeableTabNavigator
>(SwipeableTabNavigator);
