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
import TabPlaceholder from '../../screens/placeholders/TabPlaceholder';
import type { FriendsStackParamList } from '../types';

const Stack = createNativeStackNavigator<FriendsStackParamList>();

/**
 * Wave 2 placeholder stack for the Friends tab. Wave 4 replaces the home
 * screen with the public feed + nearby travelers + your-map sub-views.
 *
 * @returns The configured `NativeStackNavigator` for Friends.
 */
const FriendsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FriendsHome">
      {() => <TabPlaceholder tabName="friends" wave="4" />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default FriendsStack;
