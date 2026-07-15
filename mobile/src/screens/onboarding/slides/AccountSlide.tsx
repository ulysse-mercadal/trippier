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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Avatar from '../../../components/Avatar';
import Button from '../../../components/Button';
import TitleDot from '../../../components/TitleDot';
import { Check, Cloud, Lock, User as UserIcon } from '../../../components/icons';
import { useTheme } from '../../../theme/useTheme';
import { useAuth } from '../../../context/AuthContext';
import type { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';

export interface AccountSlideProps {
  width: number;
}

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Pager'>;

/**
 * Optional account-creation slide. Renders two CTAs that open the auth
 * modal in the matching mode; if the user is already signed in, the slide
 * confirms the account is linked and lets the parent pager advance.
 *
 * @param props - {@link AccountSlideProps}.
 * @returns The slide content.
 */
const AccountSlide: React.FC<AccountSlideProps> = ({ width }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signedIn } = useAuth();
  const navigation = useNavigation<Nav>();

  const openAuth = useCallback((): void => {
    navigation.navigate('Auth', { initialMode: 'signUp' });
  }, [navigation]);

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 16 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.colors.emeraldSoft,
            borderRadius: theme.radii.xl,
          },
        ]}>
        {signedIn ? (
          <View style={styles.signedInBlock}>
            <Avatar name={user?.name ?? user?.email ?? 'You'} size={84} />
            <View
              style={[
                styles.checkBadge,
                {
                  backgroundColor: theme.colors.emerald,
                  borderColor: theme.colors.emeraldSoft,
                },
              ]}>
              <Check size={16} color={theme.colors.onEmerald} stroke={2.6} />
            </View>
          </View>
        ) : (
          <View style={styles.guestComp}>
            <View
              style={[
                styles.guestUser,
                {
                  backgroundColor: theme.colors.emerald,
                  shadowColor: theme.colors.emeraldDeep,
                },
              ]}>
              <UserIcon size={40} color={theme.colors.onEmerald} stroke={1.8} />
            </View>
            <View
              style={[
                styles.guestSatellite,
                styles.guestSatelliteLeft,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.emerald,
                },
              ]}>
              <Cloud size={20} color={theme.colors.emeraldDeep} stroke={1.9} />
            </View>
            <View
              style={[
                styles.guestSatellite,
                styles.guestSatelliteRight,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.emerald,
                },
              ]}>
              <Lock size={18} color={theme.colors.emeraldDeep} stroke={1.9} />
            </View>
          </View>
        )}
      </View>

      <Text style={[styles.h1, { color: theme.colors.ink, fontFamily: theme.fonts.display }]}>
        {signedIn ? 'You\'re all set' : 'Keep your saves safe'}
        <TitleDot />
      </Text>
      <Text
        style={[styles.lede, { color: theme.colors.ink2, fontFamily: theme.fonts.display }]}>
        {signedIn
          ? `Signed in as ${user?.name ?? user?.email}. Your saves and trips will sync across devices automatically.`
          : 'An account keeps your bookmarks, custom maps and trips synced across devices, lets friends collaborate, and never loses a thing if you change phones.'}
      </Text>

      {!signedIn ? (
        <View style={styles.cta}>
          <Button
            big
            full
            variant="ghost"
            label="Sign in or create an account"
            onPress={openAuth}
          />
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 12,
  },
  hero: {
    width: '100%',
    height: 220,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  guestComp: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guestUser: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    zIndex: 3,
  },
  guestSatellite: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    zIndex: 2,
  },
  guestSatelliteLeft: {
    top: 36,
    left: '18%',
  },
  guestSatelliteRight: {
    bottom: 36,
    right: '18%',
  },
  signedInBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    elevation: 4,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  h1: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 34,
  },
  lede: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 360,
  },
  cta: {
    gap: 10,
    marginTop: 14,
  },
  hint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    alignSelf: 'center',
    paddingTop: 4,
  },
});

export default AccountSlide;
