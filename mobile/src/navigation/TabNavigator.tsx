// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import DiscoverStack from './stacks/DiscoverStack';
import PlanStack from './stacks/PlanStack';
import FriendsStack from './stacks/FriendsStack';
import ToolsStack from './stacks/ToolsStack';
import YouStack from './stacks/YouStack';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Bottom-tab navigator hosting the five top-level stacks of the app.
 *
 * The visual chrome is provided by the custom {@link TabBar} component so the
 * navigator stays focused on routing. Tab order matches the v4 design spec:
 * Discover, Plan, Friends, Tools, You.
 *
 * @returns The configured `BottomTabNavigator`.
 */
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={props => <TabBar {...props} />}>
    <Tab.Screen name="Discover" component={DiscoverStack} />
    <Tab.Screen name="Plan" component={PlanStack} />
    <Tab.Screen name="Friends" component={FriendsStack} />
    <Tab.Screen name="Tools" component={ToolsStack} />
    <Tab.Screen name="You" component={YouStack} />
  </Tab.Navigator>
);

export default TabNavigator;
