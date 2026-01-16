// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FilterBarProps {
  onSearch: (text: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FilterBar = ({ onSearch, onClear, onFocus, onBlur }: FilterBarProps) => {
  const insets = useSafeAreaInsets();
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    Keyboard.dismiss();
    onSearch(searchText);
  };

  const handleClear = () => {
    setSearchText('');
    onClear();
    Keyboard.dismiss();
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View style={[styles.container, { top: insets.top + 12 }]}>
      <View style={styles.bar}>
        {isFocused || searchText ? (
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
          style={styles.input}
          placeholder="Discover new places"
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    paddingHorizontal: 12,
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
});

export default FilterBar;