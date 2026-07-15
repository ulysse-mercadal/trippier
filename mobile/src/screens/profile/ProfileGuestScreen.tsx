// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import Eyebrow from '../../components/Eyebrow';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../context/AuthContext';
import { useAuthGate } from '../../hooks/useAuthGate';

/**
 * Profile tab guest state.
 *
 * Renders the topo backdrop, a "G" avatar, the "browsing as guest" eyebrow
 * and a primary CTA that opens the auth modal through the gate. Once a user
 * is signed in (wave 4) the parent stack will swap this for the real
 * profile screen — for now we just show a thin "signed in" confirmation.
 *
 * @returns The rendered Profile guest screen.
 */
const ProfileGuestScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { gate } = useAuthGate();
  const insets = useSafeAreaInsets();

  const handleSignIn = useCallback((): void => {
    gate('generic', () => {});
  }, [gate]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          {
            paddingTop: insets.top + theme.spacing.xl,
            paddingBottom: insets.bottom + theme.spacing.xxl + 80,
            paddingHorizontal: theme.spacing.xl,
          },
        ]}>
        <Avatar name={user?.name ?? 'Guest'} size={88} style={styles.avatar} />
        <Eyebrow style={styles.eyebrow}>
          {user ? 'signed in' : 'browsing as guest'}
        </Eyebrow>
        <Text
          style={[
            styles.h2,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          {user ? (user.name ?? 'Welcome back') : 'Make it yours'}
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
          {user
            ? 'Profile customisation lands in wave 4 — saved POIs, custom maps and trips will live here.'
            : 'Save favourites, build custom maps and follow other travellers — an account keeps it all in sync.'}
        </Text>
        {user ? null : (
          <Button
            big
            label="Sign in or create account"
            onPress={handleSignIn}
            style={styles.cta}
            accessibilityLabel="Open auth modal"
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    marginBottom: 12,
  },
  eyebrow: {
    marginBottom: 2,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  lede: {
    lineHeight: 22,
    maxWidth: 360,
  },
  cta: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});

export default ProfileGuestScreen;
