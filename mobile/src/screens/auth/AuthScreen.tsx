// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../../components/Button';
import Eyebrow from '../../components/Eyebrow';
import Input from '../../components/Input';
import SegmentedControl from '../../components/SegmentedControl';
import { X } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../context/AuthContext';
import type { AuthMode } from '../../navigation/types';

const SEGMENTS = ['signIn', 'signUp'] as const;
const SEGMENT_LABELS: Record<AuthMode, string> = {
  signIn: 'sign in',
  signUp: 'create account',
};

/**
 * Best-effort error normaliser for axios / fetch rejections.
 *
 * @param err - The rejected value to inspect.
 * @param fallback - Default user-facing message.
 * @returns A user-facing message string.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { response?: { data?: { message?: unknown } }; message?: string };
    const raw = e.response?.data?.message;
    if (Array.isArray(raw) && typeof raw[0] === 'string') {
      return raw[0];
    }
    if (typeof raw === 'string') {
      return raw;
    }
    if (typeof e.message === 'string') {
      return e.message;
    }
  }
  return fallback;
}

/**
 * Unified auth screen presented as a modal above the tab navigator.
 *
 * A two-segment control toggles between sign-in and account-creation. The
 * name field appears only in account-creation mode. On success, dismisses
 * the modal so the user lands back on whichever tab triggered the gate.
 * Errors are surfaced inline without an external toast dependency.
 *
 * @param props - {@link NativeStackScreenProps} for the `Auth` route.
 * @returns The rendered auth screen.
 */
const AuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { initialMode?: AuthMode } | undefined;
  const [mode, setMode] = useState<AuthMode>(params?.initialMode ?? 'signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setConfirmPassword('');
  }, [mode]);

  const dismiss = useCallback((): void => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signUp') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signIn') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim() || undefined);
      }
      dismiss();
    } catch (err: unknown) {
      const fallback =
        mode === 'signIn'
          ? 'Sign-in failed. Please try again.'
          : 'Account creation failed. Please try again.';
      setError(extractErrorMessage(err, fallback));
    } finally {
      setSubmitting(false);
    }
  }, [mode, email, password, confirmPassword, name, signIn, signUp, dismiss]);

  const isSignIn = mode === 'signIn';
  const ctaLabel = submitting
    ? isSignIn ? 'Signing in…' : 'Creating…'
    : isSignIn ? 'Sign in' : 'Create account';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <View
        style={[
          styles.topRow,
          { paddingTop: insets.top + 12, paddingHorizontal: theme.spacing.xl },
        ]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={dismiss}
          style={[
            styles.closeBtn,
            {
              borderColor: theme.colors.line,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.md,
            },
          ]}>
          <X size={18} color={theme.colors.ink} />
        </Pressable>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.body,
          { paddingHorizontal: theme.spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Eyebrow>welcome</Eyebrow>
          <Text
            style={[styles.h1, { color: theme.colors.ink, fontFamily: theme.fonts.display }]}>
            Welcome to <Text style={{ color: theme.colors.emerald }}>trippier</Text>
          </Text>
        </View>
        <SegmentedControl<AuthMode> segments={SEGMENTS} value={mode} onChange={setMode} />
        <View style={styles.form}>
          {!isSignIn ? (
            <Input
              label="username"
              placeholder="pick a handle"
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : null}
          <Input
            label="email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="password"
            placeholder={isSignIn ? '••••••••' : 'at least 6 characters'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!isSignIn ? (
            <Input
              label="confirm password"
              placeholder="re-enter your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          ) : null}
          {error ? (
            <Text
              style={[
                styles.error,
                {
                  color: theme.colors.ink,
                  fontFamily: theme.fonts.mono,
                  fontSize: theme.fontSize.xs,
                },
              ]}>
              {error}
            </Text>
          ) : null}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: theme.spacing.xl,
            backgroundColor: theme.colors.bg,
            borderTopColor: theme.colors.line,
          },
        ]}>
        <Button big full label={ctaLabel} onPress={handleSubmit} disabled={submitting} />
        <Text
          style={[
            styles.hint,
            {
              color: theme.colors.mute,
              fontFamily: theme.fonts.mono,
              fontSize: theme.fontSize.xs,
            },
          ]}>
          {isSignIn ? SEGMENT_LABELS.signUp : SEGMENT_LABELS.signIn} above to switch
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 4 },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scroll: { flex: 1 },
  body: { paddingTop: 24, paddingBottom: 32, gap: 20 },
  heading: { gap: 8 },
  h1: { fontSize: 30, fontWeight: '600', letterSpacing: -0.6, lineHeight: 34 },
  form: { gap: 14 },
  error: { letterSpacing: 0.4 },
  footer: {
    paddingTop: 14,
    gap: 10,
  },
  hint: { letterSpacing: 0.6, alignSelf: 'center', paddingTop: 4 },
});

export default AuthScreen;
