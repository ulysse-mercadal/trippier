// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Deep-linking configuration for React Navigation. Uses the `trippier://`
 * scheme; web URLs are reserved for future use once the landing page hosts
 * the universal-links manifest.
 *
 * Wave 2 maps only the top-level entry points (onboarding + tabs + auth
 * modal). Per-screen deep links will be added alongside the real screens in
 * waves 3 and 4.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['trippier://'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      AuthModal: {
        path: 'auth',
        screens: {
          Auth: 'sign-in',
        },
      },
      Main: {
        path: 'main',
        screens: {
          Discover: 'discover',
          Plan: 'plan',
          Friends: 'friends',
          Tools: 'tools',
          You: 'you',
        },
      },
    },
  },
};
