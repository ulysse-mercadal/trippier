// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

interface FilterBarProps {
  isExpanded: boolean;
  value?: string;
  onSearch: (text: string) => void;
  onClear: () => void;
  onChangeText: (text: string) => void;
  onToggle: (expanded: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMyMapsClick?: () => void;
  onProfileClick?: () => void;
}

export interface FilterBarRef {
  blur: () => void;
  focus: () => void;
}

const FilterBar = forwardRef<FilterBarRef, FilterBarProps>(
  (
    {
      isExpanded,
      value = '',
      onSearch,
      onClear,
      onChangeText,
      onToggle,
      onFocus,
      onBlur,
      onMyMapsClick,
      onProfileClick,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const { user } = useAuth();

    const expansionProgress = useSharedValue(0);

    useEffect(() => {
      expansionProgress.value = withSpring(isExpanded ? 1 : 0, {
        stiffness: 300,
        damping: 30,
      });
    }, [isExpanded, expansionProgress]);

    useImperativeHandle(ref, () => ({
      blur: () => {
        inputRef.current?.blur();
        Keyboard.dismiss();
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const handleSearch = () => {
      Keyboard.dismiss();
      onSearch(value);
    };

    const handleClear = () => {
      onClear();
      onToggle(false);
      Keyboard.dismiss();
      inputRef.current?.blur();
    };

    const handleFocus = () => {
      onToggle(true);
      if (onFocus) {
        onFocus();
      }
    };

    const handleBlur = () => {
      if (onBlur) {
        onBlur();
      }
    };

    const getInitials = (name: string) => {
      if (!name) {
        return '??';
      }
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        expansionProgress.value,
        [0, 1],
        ['transparent', '#000000'],
      );

      return {
        borderColor,
        borderWidth: 2,
      };
    });

    return (
      <View style={[styles.container, { top: insets.top + 12 }]}>
        <Animated.View style={[styles.bar, animatedContainerStyle]}>
          {isExpanded || value ? (
            <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton}>
              <Ionicons name="search" size={20} color="#333" />
            </View>
          )}
          <TextInput
            ref={inputRef}
            style={[styles.input, user && { marginRight: 44 }]}
            placeholder="Discover new places"
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {value.length > 0 && !user && (
            <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
          {user && (
            <TouchableOpacity
              onPress={() => setIsMenuOpen(true)}
              style={styles.profileMedal}
              activeOpacity={0.9}>
              <Text style={styles.initialsText}>{getInitials(user.name)}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <Modal
          visible={isMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsMenuOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.menuContainer, { top: insets.top + 65 }]}>
                <View style={styles.menuArrow} />
                <View style={styles.menuContent}>
                  <View style={styles.menuHeader}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.name || 'User'}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
                  <View style={styles.menuDivider} />
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      onMyMapsClick?.();
                    }}>
                    <Ionicons name="map-outline" size={18} color="#9CA3AF" />
                    <Text style={styles.menuItemText}>My Maps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      onProfileClick?.();
                    }}>
                    <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                    <Text style={styles.menuItemText}>Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 50,
    paddingLeft: 12,
    paddingRight: 4,
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
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  clearButton: {
    padding: 8,
  },
  profileMedal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  initialsText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    right: 20,
    width: 220,
    zIndex: 2000,
  },
  menuArrow: {
    position: 'absolute',
    right: 18,
    top: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
    zIndex: 1,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
});

export default FilterBar;
