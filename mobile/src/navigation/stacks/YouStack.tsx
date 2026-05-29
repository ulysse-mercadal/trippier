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
import YouScreen from '../../screens/you';
import type { YouStackParamList } from '../types';

const Stack = createNativeStackNavigator<YouStackParamList>();

/**
 * Wave 4 stack for the You tab. The screen internally swaps between the
 * guest fallback and the signed-in profile based on the auth context.
 *
 * @returns The configured `NativeStackNavigator` for You.
 */
const YouStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="YouHome" component={YouScreen} />
  </Stack.Navigator>
);

export default YouStack;
