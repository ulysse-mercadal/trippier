// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Keyboard, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const COLORS = {
  containerBackground: 'transparent',
  tabBarBackground: '#FFFFFF',
  activeChip: '#000000',
  activeIcon: '#FFFFFF',
  inactiveIcon: '#000000',
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [visible, setVisible] = useState(true);
  const totalTabs = state.routes.length;
  const SCREEN_PADDING = 20;
  const TAB_BAR_WIDTH = width - SCREEN_PADDING * 2;
  const INTERNAL_PADDING = 5;
  const AVAILABLE_WIDTH = TAB_BAR_WIDTH - INTERNAL_PADDING * 2;
  const TAB_WIDTH = AVAILABLE_WIDTH / totalTabs;
  const translateX = useSharedValue(state.index * TAB_WIDTH);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setVisible(false),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setVisible(true),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 15,
      stiffness: 100,
    });
  }, [state.index, TAB_WIDTH, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    'use worklet';
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.tabBar, { width: TAB_BAR_WIDTH }]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: TAB_WIDTH,
              left: INTERNAL_PADDING,
            },
            animatedStyle,
          ]}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
            let iconName = '';
            if (route.name === 'Discover') {
              iconName = 'globe';
            } else if (route.name === 'Plan') {
              iconName = 'calendar';
            } else if (route.name === 'Connect') {
              iconName = 'chatbubbles';
            }
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tabItem, { width: TAB_WIDTH }]}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? COLORS.activeIcon : COLORS.inactiveIcon}
                />
              </TouchableOpacity>
            );
          },
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.containerBackground,
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBarBackground,
    borderRadius: 40,
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: 'flex-start',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  indicator: {
    position: 'absolute',
    height: '86%',
    top: '7%',
    backgroundColor: COLORS.activeChip,
    borderRadius: 30,
  },
});

export default CustomTabBar;
