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
import { DiscoverScreen, PoiDetailScreen } from '../../screens/discover';
import type { DiscoverStackParamList } from '../types';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

/**
 * Wave 4 stack for the Discover tab. Hosts the map + drawer Discover home
 * and the POI detail page reached from the drawer.
 *
 * @returns The configured `NativeStackNavigator` for Discover.
 */
const DiscoverStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DiscoverHome" component={DiscoverScreen} />
    <Stack.Screen name="PoiDetail" component={PoiDetailScreen} />
  </Stack.Navigator>
);

export default DiscoverStack;
