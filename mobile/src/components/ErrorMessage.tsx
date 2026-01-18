// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message: string | null;
  onHide: () => void;
}

export default function ErrorMessage({ message, onHide }: ErrorMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }
  }, [message, onHide, opacity]);
  if (!message) {
    return null;
  }
  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.85)',
    padding: 15,
    borderRadius: 8,
    zIndex: 999,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
