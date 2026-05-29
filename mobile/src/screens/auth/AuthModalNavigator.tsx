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
import AuthScreen from './AuthScreen';
import type { AuthStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Native stack hosting the unified {@link AuthScreen}.
 *
 * Mounted by the root navigator with `presentation: 'modal'` so the screen
 * slides up over the tab navigator and can be dismissed without resetting
 * tab state. Wave 3 may add a `ForgotPassword` stub here.
 *
 * @returns The configured `NativeStackNavigator` for the auth modal.
 */
const AuthModalNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Auth"
    screenOptions={{
      headerShown: false,
    }}>
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

export default AuthModalNavigator;
