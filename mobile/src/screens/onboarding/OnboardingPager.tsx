// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Button from '../../components/Button';
import { useTheme } from '../../theme/useTheme';
import { useOnboarding } from '../../context/OnboardingContext';
import WelcomeSlide from './slides/WelcomeSlide';
import AccountSlide from './slides/AccountSlide';
import FeatureSlide from './slides/FeatureSlide';
import SaveIllustration from './slides/SaveIllustration';
import PlanIllustration from './slides/PlanIllustration';
import TravelIllustration from './slides/TravelIllustration';

const PAGES = 5;
const LAST_INDEX = PAGES - 1;
const DOT_WIDTH = 8;
const DOT_ACTIVE_WIDTH = 22;
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

interface DotProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  width: number;
}

/**
 * One animated step dot. Width and colour interpolate continuously from
 * the live horizontal scroll offset so the dot grows / shrinks in real
 * time while the user swipes between pages.
 *
 * @param props - {@link DotProps}.
 * @returns The animated dot.
 */
const Dot: React.FC<DotProps> = ({ index, scrollX, width }) => {
  const { theme } = useTheme();
  const dotStyle = useAnimatedStyle(() => {
    if (width <= 0) {
      return { width: DOT_WIDTH, backgroundColor: theme.colors.line };
    }
    const progress = scrollX.value / width;
    const distance = Math.abs(progress - index);
    const proximity = Math.max(0, 1 - distance);
    return {
      width: interpolate(
        proximity,
        [0, 1],
        [DOT_WIDTH, DOT_ACTIVE_WIDTH],
        'clamp',
      ),
      backgroundColor: interpolateColor(
        proximity,
        [0, 1],
        [theme.colors.line, theme.colors.emerald],
      ),
    };
  });
  return <Animated.View style={[styles.dot, dotStyle]} />;
};

/**
 * Single-screen onboarding pager. Hosts five side-by-side slides:
 * theme chooser, optional account creation, then three feature pages
 * (save / plan / travel).
 *
 * Bi-directional horizontal swipe is enabled through `pagingEnabled` on
 * the outer `ScrollView`; `directionalLockEnabled` keeps the inner
 * vertical `ScrollView`s from stealing the gesture. The bottom CTA
 * advances by one and switches to "Start exploring" on the final page.
 *
 * @returns The rendered onboarding pager.
 */
const OnboardingPager: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { complete } = useOnboarding();

  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const onLayout = useCallback((e: LayoutChangeEvent): void => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (width <= 0) {
        return;
      }
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      if (idx !== page) {
        setPage(idx);
      }
    },
    [page, width],
  );

  const goTo = useCallback(
    (index: number): void => {
      if (width <= 0) {
        return;
      }
      const safe = Math.max(0, Math.min(LAST_INDEX, index));
      scrollRef.current?.scrollTo({ x: safe * width, animated: true });
      scrollX.value = withTiming(safe * width, { duration: 320, easing: EASE });
      setPage(safe);
    },
    [width, scrollX],
  );

  const handlePrimary = useCallback((): void => {
    if (page === LAST_INDEX) {
      complete();
      return;
    }
    goTo(page + 1);
  }, [page, goTo, complete]);

  const ctaLabel = useMemo(
    () => (page === LAST_INDEX ? 'Start exploring' : 'Continue'),
    [page],
  );

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      onLayout={onLayout}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        directionalLockEnabled
        keyboardShouldPersistTaps="handled"
        bounces={false}
        nestedScrollEnabled>
        {width > 0 ? (
          <>
            <WelcomeSlide width={width} />
            <AccountSlide width={width} />
            <FeatureSlide
              width={width}
              title="Curate places you'll love"
              lede="Bookmark spots as you explore and group them into custom maps — solo or with friends. Trippier learns from your saves and suggests more in the same vein."
              illustration={<SaveIllustration />}
            />
            <FeatureSlide
              width={width}
              title="A day that flows, made for you"
              lede="Drop in your dates, your budget, and one of your saved maps. Trippier orders the day, leaves room for the unexpected, and adds nearby gems when you've got time."
              illustration={<PlanIllustration />}
            />
            <FeatureSlide
              width={width}
              title="Travel, not tourist"
              lede="Currency, plug type, offline phrases — always one tap away. And if you opt in, cross paths with travellers sleeping at your hotel or visiting the same spots."
              illustration={<TravelIllustration />}
            />
          </>
        ) : null}
      </Animated.ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: theme.spacing.xl,
            backgroundColor: theme.colors.bg,
          },
        ]}>
        <View style={styles.dots}>
          {Array.from({ length: PAGES }).map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>
        <Button big full label={ctaLabel} onPress={handlePrimary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
    gap: 14,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default OnboardingPager;
