// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../theme/useTheme';
import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';
import AuthModalNavigator from '../screens/auth/AuthModalNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Top-level navigator deciding which root stack to mount.
 *
 * Guest-first: as soon as the onboarding flag is true the user lands on the
 * `Main` tab navigator regardless of auth state. The `AuthModal` route is
 * stacked on top (modal presentation) so any screen can request a sign-in
 * via the gate without resetting tab state.
 *
 * While the onboarding context hydrates from AsyncStorage we show a plain
 * surface so the first-launch flicker stays minimal.
 *
 * @returns The configured root `NativeStackNavigator`.
 */
const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { done, ready: onboardingReady } = useOnboarding();

  if (!onboardingReady) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator color={theme.colors.emerald} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!done ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="AuthModal"
            component={AuthModalNavigator}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;
