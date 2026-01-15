// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import {StatusBar, View, ActivityIndicator} from 'react-native';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import DiscoverScreen from './src/screens/DiscoverScreen';
import PlanScreen from './src/screens/PlanScreen';
import ConnectScreen from './src/screens/ConnectScreen';
import LoginScreen from './src/screens/LoginScreen';
import CustomTabBar from './src/components/CustomTabBar';
import {AuthProvider, useAuth} from './src/context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const NotionTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#2F3437',
    primary: '#FFFFFF',
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
        }} />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          tabBarLabel: 'Plan',
        }} />
      <Tab.Screen
        name="Connect"
        component={ConnectScreen}
        options={{
          tabBarLabel: 'Connect',
        }} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const {token, loading} = useAuth();

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000'}}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={NotionTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {token == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
