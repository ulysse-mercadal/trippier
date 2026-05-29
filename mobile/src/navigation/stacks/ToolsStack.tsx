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
import type { ToolsStackParamList } from '../types';

const Stack = createNativeStackNavigator<ToolsStackParamList>();

/**
 * Wave 2 placeholder stack for the Tools tab. Wave 4 replaces the home
 * screen with the currency converter, translator and other travel tools.
 *
 * @returns The configured `NativeStackNavigator` for Tools.
 */
const ToolsStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ToolsHome">
      {() => <TabPlaceholder tabName="tools" wave="4" />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default ToolsStack;
