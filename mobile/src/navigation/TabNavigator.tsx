// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import TabBar from '../components/TabBar';
import DiscoverStack from './stacks/DiscoverStack';
import PlanStack from './stacks/PlanStack';
import FriendsStack from './stacks/FriendsStack';
import ToolsStack from './stacks/ToolsStack';
import YouStack from './stacks/YouStack';
import { createSwipeableTabNavigator } from './SwipeableTabNavigator';
import type { TabParamList } from './types';

const Tab = createSwipeableTabNavigator<TabParamList>();

/**
 * Top-level tab navigator hosting the five v4 stacks.
 *
 * Built on the custom {@link createSwipeableTabNavigator} — screens are laid
 * out side-by-side and a pan gesture drives the horizontal translate so the
 * destination screen is revealed from the swipe edge in real time, then
 * snapped on release. From a React Navigation point of view it behaves like
 * a regular tab navigator (deep linking, focus events, `navigate('Plan')`
 * etc.), so the custom {@link TabBar} keeps reading state + descriptors as
 * before.
 *
 * @returns The configured tab navigator.
 */
const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={props => <TabBar {...props} />}>
    <Tab.Screen
      name="Discover"
      component={DiscoverStack}
      options={{ swipeEnabled: false }}
    />
    <Tab.Screen name="Plan" component={PlanStack} />
    <Tab.Screen name="Friends" component={FriendsStack} />
    <Tab.Screen name="Tools" component={ToolsStack} />
    <Tab.Screen name="You" component={YouStack} />
  </Tab.Navigator>
);

export default TabNavigator;
