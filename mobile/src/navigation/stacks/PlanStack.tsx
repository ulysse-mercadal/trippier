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
import type { PlanStackParamList } from '../types';

const Stack = createNativeStackNavigator<PlanStackParamList>();

/**
 * Wave 2 placeholder stack for the Plan tab. Wave 3 replaces the home screen
 * with the trip planner + AI generation flow.
 *
 * @returns The configured `NativeStackNavigator` for Plan.
 */
const PlanStack: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PlanHome">
      {() => <TabPlaceholder tabName="plan" wave="3" />}
    </Stack.Screen>
  </Stack.Navigator>
);

export default PlanStack;
