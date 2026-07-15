// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/context/AuthContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import {
  AuthGateProvider,
  navigationRef,
} from './src/context/AuthGateContext';
import RootNavigator from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { loadFonts } from './src/lib/fonts';

/**
 * Application entry point.
 *
 * Mounts the providers in the canonical wave-2 order:
 * `SafeAreaProvider` → `GestureHandlerRootView` → `ThemeProvider` →
 * `AuthProvider` → `OnboardingProvider` → `AuthGateProvider` →
 * `NavigationContainer` → {@link RootNavigator}.
 *
 * The `AuthGateProvider` lives below `AuthProvider` (so it can read the
 * signed-in state) and above the navigation tree (so the gated sheet can
 * navigate to the auth modal via `navigationRef`).
 *
 * @returns The fully-wired application root component.
 */
function App(): React.JSX.Element {
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadFonts()
      .catch(() => {})
      .finally(() => {
        if (active) {
          setFontsReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (!fontsReady) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator color="#34d39c" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.fill}>
        <ThemeProvider>
          <AuthProvider>
            <OnboardingProvider>
              <AuthGateProvider>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <NavigationContainer ref={navigationRef} linking={linking}>
                  <RootNavigator />
                </NavigationContainer>
              </AuthGateProvider>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});

export default App;
