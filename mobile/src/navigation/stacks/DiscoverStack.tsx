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
import type { DiscoverStackParamList } from '../types';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

/**
 * Wave 2 placeholder stack for the Discover tab. Wave 3 replaces the home
 * screen with the real map + drawer Discover experience.
 *
 * @returns The configured `NativeStackNavigator` for Discover.
 */
const DiscoverStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DiscoverHome">
      {() => <TabPlaceholder tabName="discover" wave="3" />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default DiscoverStack;
