// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingPager from '../screens/onboarding/OnboardingPager';
import AuthScreen from '../screens/auth/AuthScreen';
import type { OnboardingStackParamList } from './types';

export type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Onboarding stack. Hosts the single {@link OnboardingPager} screen and a
 * presentation-modal `Auth` route used by the optional account-creation
 * slide. The Auth screen wraps the shared {@link AuthScreen} component
 * route-agnostically so it can also serve the in-app `AuthModal`.
 *
 * @returns The configured `NativeStackNavigator` for onboarding.
 */
const OnboardingNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Pager" component={OnboardingPager} />
    <Stack.Screen
      name="Auth"
      component={AuthScreen}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
);

export default OnboardingNavigator;
