// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

const FilterBar = () => {
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const TOP_MARGIN = 12;
  const COLLAPSED_HEIGHT = 50;

  const toggleSearch = () => {
    if (!isExpanded && !isAnimating) {
      setIsAnimating(true);
      setIsExpanded(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: false,
        friction: 10,
        tension: 40,
      }).start(() => {
        setIsAnimating(false);
        inputRef.current?.focus();
      });
    }
  };

  const collapseSearch = () => {
    if (isExpanded && !isAnimating) {
      setIsAnimating(true);
      Keyboard.dismiss();
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsExpanded(false);
        setIsAnimating(false);
        setSearchText('');
      });
    }
  };

  const containerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, SCREEN_HEIGHT],
  });
  const containerTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [insets.top + TOP_MARGIN, 0],
  });
  const contentPaddingTop = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, insets.top + TOP_MARGIN],
  });
  const marginHorizontal = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const borderRadius = animation.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [25, 0, 0],
  });
  const backButtonWidth = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 40, 40],
  });
  const backButtonOpacity = animation.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: containerHeight,
          transform: [{ translateY: containerTranslateY }],
          marginHorizontal: marginHorizontal,
          borderRadius: borderRadius,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleSearch}
        style={styles.touchable}
        disabled={isExpanded}>
        <Animated.View style={[styles.content, { paddingTop: contentPaddingTop }]}>
          <View style={styles.headerRow}>
            <Animated.View
              style={[
                styles.backButtonContainer,
                { width: backButtonWidth, opacity: backButtonOpacity },
              ]}>
              <TouchableOpacity onPress={collapseSearch} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
            </Animated.View>
            <Ionicons name="search" size={20} color="#333" style={styles.icon} />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Discover new places"
              placeholderTextColor="#333"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={collapseSearch}
              disableFullscreenUI
              editable={isExpanded || isAnimating}
              pointerEvents={isExpanded ? 'auto' : 'none'}
              underlineColorAndroid="transparent"
            />
          </View>
          {isExpanded && (
            <Animated.View style={[styles.expandedContent, { opacity: animation }]}>
              {
                //TODO: sugest places to visit
              }
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButtonContainer: {
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    padding: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    fontSize: 17,
    color: '#333',
    padding: 0,
    margin: 0,
    fontWeight: '500',
    flex: 1,
    height: '100%',
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        paddingTop: 2,
      },
    }),
  },
  expandedContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default FilterBar;
