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
import FriendsScreen from '../../screens/friends';
import type { FriendsStackParamList } from '../types';

const Stack = createNativeStackNavigator<FriendsStackParamList>();

/**
 * Wave 4 stack for the Friends tab. Hosts the segmented host that swaps
 * between the public feed, nearby-matchers and the personal map sub-views.
 *
 * @returns The configured `NativeStackNavigator` for Friends.
 */
const FriendsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FriendsHome" component={FriendsScreen} />
  </Stack.Navigator>
);

export default FriendsStack;
