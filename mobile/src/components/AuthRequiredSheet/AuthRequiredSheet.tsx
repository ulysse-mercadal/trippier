// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Button from '../Button';
import Eyebrow from '../Eyebrow';
import { Lock } from '../icons';
import { useTheme } from '../../theme/useTheme';
import { EASE_OUT, T_SLOW } from '../../animations/motion';
import type { GateAction } from '../../navigation/types';

export interface AuthRequiredSheetProps {
  visible: boolean;
  action: GateAction;
  onClose: () => void;
  onSignIn: () => void;
}

interface CopyEntry {
  title: string;
  lede: string;
}

const COPY: Record<GateAction, CopyEntry> = {
  save: {
    title: 'Save this place',
    lede: 'Create an account to keep your favourites in one place.',
  },
  comment: { title: 'Join the conversation', lede: 'Sign in to leave a comment.' },
  create_map: {
    title: 'Build your map',
    lede: 'Sign in to organise places into custom maps.',
  },
  follow: {
    title: 'Stay in the loop',
    lede: "Sign in to follow travellers and see what they're up to.",
  },
  generic: { title: 'Sign in to continue', lede: 'This action needs an account.' },
};

const SHEET_HEIGHT = 380;
const DISMISS_DRAG = SHEET_HEIGHT * 0.35;
const DISMISS_VELOCITY = 800;
const MAX_BACKDROP = 0.6;

/**
 * Bottom-sheet modal shown when a guest user attempts a write action.
 *
 * Behaves like a real drawer: drag the handle (or anywhere on the sheet)
 * downward to track the gesture; release past the dismissal threshold (or
 * with enough velocity) closes the sheet, otherwise it springs back into
 * place. Overdrag up is clamped so the sheet cannot float above its open
 * position.
 *
 * @param props - {@link AuthRequiredSheetProps}.
 * @returns A modal containing the gated-action drawer.
 */
const AuthRequiredSheet: React.FC<AuthRequiredSheetProps> = ({
  visible,
  action,
  onClose,
  onSignIn,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const dragStart = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: T_SLOW, easing: EASE_OUT });
    } else {
      translateY.value = SHEET_HEIGHT;
    }
  }, [visible, translateY]);

  const animateClose = useCallback((): void => {
    translateY.value = withTiming(
      SHEET_HEIGHT,
      { duration: T_SLOW, easing: EASE_OUT },
      () => {
        runOnJS(onClose)();
      },
    );
  }, [translateY, onClose]);

  const handleSignIn = useCallback((): void => {
    translateY.value = withTiming(
      SHEET_HEIGHT,
      { duration: T_SLOW, easing: EASE_OUT },
      () => {
        runOnJS(onSignIn)();
      },
    );
  }, [translateY, onSignIn]);

  const pan = Gesture.Pan()
    .onStart(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate(e => {
      const next = dragStart.value + e.translationY;
      translateY.value = next < 0 ? next / 4 : next;
    })
    .onEnd(e => {
      const shouldClose =
        translateY.value > DISMISS_DRAG || e.velocityY > DISMISS_VELOCITY;
      if (shouldClose) {
        translateY.value = withTiming(
          SHEET_HEIGHT,
          { duration: T_SLOW, easing: EASE_OUT },
          () => {
            runOnJS(onClose)();
          },
        );
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress = 1 - translateY.value / SHEET_HEIGHT;
    return {
      opacity: interpolate(progress, [0, 1], [0, MAX_BACKDROP], 'clamp'),
    };
  });

  const copy = COPY[action];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View
          style={[styles.backdrop, { backgroundColor: theme.colors.bg }, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={animateClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.line,
                borderTopLeftRadius: theme.radii.xl,
                borderTopRightRadius: theme.radii.xl,
                paddingBottom: insets.bottom + theme.spacing.lg,
              },
              sheetStyle,
            ]}>
            <View style={[styles.handle, { backgroundColor: theme.colors.line }]} />
            <View style={styles.iconWrap}>
              <View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: theme.colors.emeraldSoft,
                    borderColor: theme.colors.emerald,
                  },
                ]}>
                <Lock size={20} color={theme.colors.emerald} />
              </View>
            </View>
            <Eyebrow style={styles.eyebrow}>members only</Eyebrow>
            <Text
              style={[
                styles.title,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              {copy.title}
            </Text>
            <Text
              style={[
                styles.lede,
                {
                  color: theme.colors.ink2,
                  fontFamily: theme.fonts.display,
                  fontSize: theme.fontSize.md,
                },
              ]}>
              {copy.lede}
            </Text>
            <View style={styles.actions}>
              <Button
                big
                label="Sign in or create account"
                onPress={handleSignIn}
                accessibilityLabel="Sign in or create account"
              />
              <Button
                big
                variant="ghost"
                label="Not now"
                onPress={animateClose}
                accessibilityLabel="Dismiss"
              />
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  iconWrap: { alignItems: 'flex-start' },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { marginTop: 4 },
  title: { fontSize: 24, fontWeight: '600', letterSpacing: -0.5, lineHeight: 28 },
  lede: { lineHeight: 22 },
  actions: { gap: 10, marginTop: 16 },
});

export default AuthRequiredSheet;
