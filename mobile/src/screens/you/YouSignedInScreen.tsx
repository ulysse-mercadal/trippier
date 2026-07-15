// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBar from '../../components/AppBar';
import Button from '../../components/Button';
import Card, { CardBody, CardMedia } from '../../components/Card';
import Meta from '../../components/Meta';
import PreviewMap from '../../components/PreviewMap';
import TitleDot from '../../components/TitleDot';
import { getInitials } from '../../components/Avatar/Avatar';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../theme/useTheme';
import type { User } from '../../lib/types';
import StampCell from './StampCell';
import ThemeEntryRow from './ThemeEntryRow';
import YouStatsCard, { type YouStat } from './YouStatsCard';

export interface YouSignedInScreenProps {
  user: User;
}

const STAMPS: readonly string[] = ['ES', 'PT', 'IS', 'JP', 'FR', 'IT', 'MA', 'GR'];

const STATS: readonly [YouStat, YouStat, YouStat] = [
  { value: '12', label: 'countries' },
  { value: '34', label: 'cities' },
  { value: '187', label: 'days' },
] as const;

/**
 * Formats the "Member since" subtitle from the user's createdAt timestamp.
 *
 * @param createdAt - ISO date string returned by the backend (optional).
 * @returns A human readable "Member since {Mon Year}" or fallback string.
 */
function memberSinceLabel(createdAt: string | undefined): string {
  if (!createdAt) {
    return 'Member since this year';
  }
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Member since this year';
  }
  const month = parsed.toLocaleString('en', { month: 'short' });
  return `Member since ${month} ${parsed.getFullYear()}`;
}

/**
 * Signed-in You tab — profile header, lifetime stats, "Your world" map card,
 * a theme + map colours shortcut and the 4×2 stamp collection.
 *
 * The theme entry resets the onboarding flag via {@link useOnboarding} so the
 * {@link RootNavigator} flips back to the onboarding pager and lets the user
 * re-pick their interface + map palettes.
 *
 * @param props - {@link YouSignedInScreenProps}.
 * @returns The rendered signed-in You screen.
 */
const YouSignedInScreen: React.FC<YouSignedInScreenProps> = ({ user }) => {
  const { theme, mapTheme } = useTheme();
  const { reset } = useOnboarding();
  const insets = useSafeAreaInsets();

  const initials = useMemo(() => getInitials(user.name ?? user.email ?? 'Traveller'), [user]);
  const memberLine = useMemo(() => memberSinceLabel(user.createdAt), [user.createdAt]);

  const handleOpenMap = useCallback((): void => {
    console.warn('action stubbed: open world map');
  }, []);

  const handleResetTheme = useCallback((): void => {
    reset().catch(() => {});
  }, [reset]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 100 },
        ]}>
        <AppBar
          title="You"
          subtitle={memberLine}
          trailing={
            <View
              style={[
                styles.avatarBubble,
                { backgroundColor: theme.colors.emeraldSoft },
              ]}>
              <Text
                style={[
                  styles.avatarInitials,
                  { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.display },
                ]}>
                {initials}
              </Text>
            </View>
          }
        />

        <View style={styles.section}>
          <YouStatsCard stats={STATS} />
        </View>

        <View style={styles.section}>
          <Card>
            <CardMedia height={150}>
              <PreviewMap palette={mapTheme} surfaceColor={theme.colors.surface} height={150} />
            </CardMedia>
            <CardBody padding={16}>
              <View style={styles.worldRow}>
                <View style={styles.worldTitles}>
                  <Text
                    style={[
                      styles.h3,
                      { color: theme.colors.ink, fontFamily: theme.fonts.display },
                    ]}>
                    Your world
                    <TitleDot />
                  </Text>
                  <Meta style={styles.worldMeta}>Barcelona · here now</Meta>
                </View>
                <Button label="Open map" variant="tonal" size="sm" onPress={handleOpenMap} />
              </View>
            </CardBody>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemeEntryRow onPress={handleResetTheme} />
        </View>

        <View style={styles.sectionRow}>
          <Text
            style={[
              styles.sectionHeader,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            Stamp collection
          </Text>
          <Text
            style={[
              styles.sectionMore,
              { color: theme.colors.emeraldDeep, fontFamily: theme.fonts.display },
            ]}>
            All
          </Text>
        </View>

        <View style={styles.stamps}>
          {STAMPS.map((code, idx) => (
            <StampCell key={code} code={code} active={idx === 0} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 0,
  },
  avatarBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  section: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  worldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  worldTitles: {
    flex: 1,
    minWidth: 0,
  },
  h3: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: -0.4,
  },
  worldMeta: {
    marginTop: 3,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionMore: {
    fontSize: 13,
    fontWeight: '600',
  },
  stamps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
    rowGap: 10,
  },
});

export default YouSignedInScreen;
