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
import ToolsScreen from '../../screens/tools';
import type { ToolsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ToolsStackParamList>();

/**
 * Wave 4 stack for the Tools tab. Hosts the weather + currency widget plus
 * the 2-column grid of pluggable travel tool tiles.
 *
 * @returns The configured `NativeStackNavigator` for Tools.
 */
const ToolsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ToolsHome" component={ToolsScreen} />
  </Stack.Navigator>
);

export default ToolsStack;
