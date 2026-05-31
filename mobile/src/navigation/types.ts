// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { PoiProvider, PoiType } from '../api/pois';

/**
 * A single back-to-source link displayed in the POI detail "Sources" section.
 * Computed by the caller from `EnrichedPoi.providers_data` so the screen
 * doesn't need to know how to derive URLs per provider.
 */
export interface PoiSourceLink {
  provider: PoiProvider;
  url: string;
  /**
   * Optional Wikidata ID — exposed separately so the screen can also offer a
   * "View on Wikidata" link when the POI is wikidata-linked, even though
   * Wikidata is not itself a provider.
   */
  wikidataId?: string;
}

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
 * Onboarding stack — hosts the pager + an optional modal Auth route used
 * by the AccountSlide "sign in or create account" CTA.
 */
export type OnboardingStackParamList = {
  Pager: undefined;
  Auth: { initialMode?: AuthMode } | undefined;
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
  PoiDetail: {
    name: string;
    type: PoiType;
    lat?: number;
    lng?: number;
    description?: string;
    /**
     * Canonical links back to each upstream provider for this POI.
     * Rendered as the "Sources" section. Empty/absent ⇒ section hidden.
     */
    sources?: PoiSourceLink[];
    /**
     * Optional Wikidata ID surfaced as an additional source link
     * (Wikidata is not a provider but a useful canonical reference).
     */
    wikidataId?: string;
  };
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
