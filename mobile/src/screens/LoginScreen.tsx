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
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ErrorMessage from '../components/ErrorMessage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = Math.sqrt(width * width + height * height) * 2;
type ViewMode = 'entry' | 'login' | 'register';

export default function LoginScreen() {
  const [mode, setMode] = useState<ViewMode>('entry');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const { login } = useAuth();
  const revealAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = (fields: string[]) => {
    setInvalidFields(fields);
    Vibration.vibrate([0, 80, 80, 80]);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => setInvalidFields([]), 3000);
  };

  const animateToMode = (newMode: ViewMode) => {
    setInvalidFields([]);
    if (newMode !== 'entry' && mode === 'entry') {
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        setMode(newMode);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 350);
    } else if (newMode === 'entry') {
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setMode('entry');
        revealAnim.setValue(0);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      });
    } else {
      setMode(newMode);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      triggerShake(['email']);
      setError('Invalid email address');
      return;
    }

    if (password.length < 6) {
      triggerShake(['password']);
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await client.post('/auth/register', { email, password, name });
        await login(email, password);
      }
    } catch (err: any) {
      if (err.response) {
        const message = err.response.data?.message;
        const status = err.response.status;
        if (status === 401) {
          triggerShake(['email', 'password']);
        } else if (status === 409) {
          setError('This email is already registered');
          triggerShake(['email']);
        } else {
          setError(Array.isArray(message) ? message[0] : message || 'Server error');
        }
      } else if (err.request) {
        setError('Network error: Cannot reach the server');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEntry = () => (
    <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
      <Text style={[styles.title, { color: '#FFFFFF' }]}>Trippier</Text>
      <Text style={[styles.subtitle, { color: '#FFFFFF' }]}>Plan your next adventure</Text>
      <TouchableOpacity style={styles.fullWhiteButton} onPress={() => animateToMode('login')}>
        <Text style={styles.buttonTextBlack}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.fullWhiteButton, { marginTop: 15 }]}
        onPress={() => animateToMode('register')}>
        <Text style={styles.buttonTextBlack}>Create Account</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderForm = () => (
    <Animated.View
      style={[styles.content, { opacity: contentOpacity, transform: [{ translateX: shakeAnim }] }]}>
      <Text style={[styles.title, { color: '#000000', marginTop: 40 }]}>
        {mode === 'login' ? 'Welcome Back' : 'Join Us'}
      </Text>
      <Text style={[styles.subtitle, { color: '#666666' }]}>
        {mode === 'login' ? 'Sign in to continue' : 'Create your account to start'}
      </Text>
      {mode === 'register' && (
        <TextInput
          style={[
            styles.input,
            {
              borderColor: invalidFields.includes('name') ? '#FF4444' : '#DDD',
              color: '#000',
            },
            invalidFields.includes('name') && { borderWidth: 2 },
          ]}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: invalidFields.includes('email') ? '#FF4444' : '#DDD',
            color: '#000',
          },
          invalidFields.includes('email') && { borderWidth: 2 },
        ]}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[
          styles.input,
          {
            borderColor: invalidFields.includes('password') ? '#FF4444' : '#DDD',
            color: '#000',
          },
          invalidFields.includes('password') && { borderWidth: 2 },
        ]}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.blackButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonTextWhite}>{mode === 'login' ? 'Login' : 'Register'}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <Animated.View
        style={[
          styles.revealCircle,
          {
            transform: [
              {
                scale: revealAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.01, 1],
                }),
              },
            ],
          },
        ]}
      />
      {mode !== 'entry' && (
        <Animated.View style={[styles.topBar, { opacity: contentOpacity }]}>
          <TouchableOpacity
            style={styles.backButtonWithText}
            onPress={() => animateToMode('entry')}>
            <Ionicons name="arrow-back" size={38} color="#000000" />
          </TouchableOpacity>
        </Animated.View>
      )}
      <ErrorMessage message={error} onHide={() => setError(null)} />
      {mode === 'entry' ? renderEntry() : renderForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 999,
  },
  revealCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    top: (height - CIRCLE_SIZE) / 2,
    left: (width - CIRCLE_SIZE) / 2,
    zIndex: 1,
  },
  content: { width: '100%', zIndex: 5 },
  backButtonWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  input: {
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  fullWhiteButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  blackButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    marginTop: 16,
  },
  buttonTextBlack: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  buttonTextWhite: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
