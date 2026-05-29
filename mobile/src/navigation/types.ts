// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root stack — either the onboarding Welcome screen (first launch) or the
 * main tab navigator with an auth modal stacked on top.
 */
export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<TabParamList>;
  AuthModal: NavigatorScreenParams<AuthStackParamList>;
};

/**
 * Single-screen onboarding stack — Welcome only.
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
};

/**
 * Bottom tab navigator routes. Every tab nests its own stack.
 * v4 names: Discover / Plan / Friends / Tools / You.
 */
export type TabParamList = {
  Discover: NavigatorScreenParams<DiscoverStackParamList>;
  Plan: NavigatorScreenParams<PlanStackParamList>;
  Friends: NavigatorScreenParams<FriendsStackParamList>;
  Tools: NavigatorScreenParams<ToolsStackParamList>;
  You: NavigatorScreenParams<YouStackParamList>;
};

/** Discover tab stack routes. */
export type DiscoverStackParamList = {
  DiscoverHome: undefined;
};

/** Plan tab stack routes. */
export type PlanStackParamList = {
  PlanHome: undefined;
};

/** Friends tab stack routes. */
export type FriendsStackParamList = {
  FriendsHome: undefined;
};

/** Tools tab stack routes. */
export type ToolsStackParamList = {
  ToolsHome: undefined;
};

/** You tab stack routes. */
export type YouStackParamList = {
  YouHome: undefined;
};

/**
 * Auth modal stack — single auth screen exposed in wave 2.
 */
export type AuthStackParamList = {
  Auth: { initialMode?: AuthMode } | undefined;
  ForgotPassword: undefined;
};

/**
 * Discriminator selecting whether the unified auth screen opens in sign-in
 * mode or in account-creation mode.
 */
export type AuthMode = 'signIn' | 'signUp';

/**
 * Set of write actions that trigger the {@link AuthRequiredSheet} when the
 * current user is a guest. Each variant maps to a contextual copy table.
 */
export type GateAction =
  | 'save'
  | 'comment'
  | 'create_map'
  | 'follow'
  | 'generic';
