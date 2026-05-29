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
import ProfileGuestScreen from '../../screens/profile/ProfileGuestScreen';
import type { YouStackParamList } from '../types';

const Stack = createNativeStackNavigator<YouStackParamList>();

/**
 * Wave 2 stack for the You tab. Currently shows the guest placeholder
 * with a CTA opening the auth modal; wave 4 will route signed-in users to
 * the full profile + settings screen.
 *
 * @returns The configured `NativeStackNavigator` for You.
 */
const YouStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="YouHome" component={ProfileGuestScreen} />
  </Stack.Navigator>
);

export default YouStack;
