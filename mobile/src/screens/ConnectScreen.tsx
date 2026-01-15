// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function ConnectScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      {user && (
        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: '#888' }]}>Email</Text>
          <Text style={[styles.value, { color: colors.text }]}>{user.email}</Text>
          {user.name && (
            <>
              <Text style={[styles.label, { color: '#888' }]}>Name</Text>
              <Text style={[styles.value, { color: colors.text }]}>{user.name}</Text>
            </>
          )}
        </View>
      )}
      <TouchableOpacity style={[styles.logoutButton, { borderColor: '#FF4444' }]} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  logoutButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
